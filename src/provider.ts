import {
    CompletionItemProvider,
    TextDocument,
    Position,
    Range,
    workspace,
    CompletionItem,
    CompletionItemKind,
    SnippetString,
    FileSystemWatcher,
    RelativePattern
  } from "vscode";
  
  const NAME_PATTERN = /class (.*?) < .*Component.*/;
  const ARGS_PATTERN = /def initialize\(([^)]+)\)?/m;
  const COMPONENT_GLOB = 'app/components/**/*component.rb';
  
  type Component = {
    name: string;
    args?: string;
  };
  
  const findComponents = async (): Promise<readonly Component[]> => {
    const componentPaths = await workspace.findFiles(COMPONENT_GLOB);
    const promises = componentPaths.map(async (path) => {
      const text = (await workspace.openTextDocument(path)).getText();
      const nameMatches = text.match(NAME_PATTERN);
      if (!nameMatches) {
        return;
      }
      const argsMatches = text.match(ARGS_PATTERN);
  
      return {
        name: nameMatches[1],
        args: (argsMatches && argsMatches[1]) ?? undefined,
      };
    });
  
    return (await Promise.all(promises)).filter((c): c is NonNullable<typeof c> => !!c);
  };

  const toSnakeCase = (str: string) => str.match(/[A-Z][a-z]+/g)?.map(s => s.toLowerCase()).join("_");
  
  const componentToFileName = (componentName: string) => {
    return componentName.replace("::Component", "").split("::").map((part: string) => toSnakeCase(part)).join("/")
  };

  const buildSnippetValue = (componentName: string, args?: string): string => {
    const renderSnippet = (str: string) => `<%= render ${str} \$0%>`;

    let argsSnippet = ""
    if (args) {
      argsSnippet = [`"${componentToFileName(componentName)}"`].concat(
                            args.split(',') 
                            .map((arg, i) => {
                                const [argName, argValue] = arg.split(':').map((s) => s.trim());
                                const pos = i + 1;
                                if (argValue === undefined) {
                                return `\${${pos}:${argName}}`;
                                }
                        
                                return `${argName}: \${${pos}:${argValue || argName}}`;
                            })
                          ).join(', ');
    }
    
    return renderSnippet(`component(${argsSnippet})`);
  };
  
  
  export default class CompletionProvider implements CompletionItemProvider {
    private cache?: readonly Component[];
    private watchers?: readonly FileSystemWatcher[];
  
    public constructor() {
      this.watchers = workspace.workspaceFolders?.map((folder) => {
        const watcher = workspace.createFileSystemWatcher(new RelativePattern(folder, COMPONENT_GLOB));
        watcher.onDidChange(() => this.clearCache());
        watcher.onDidCreate(() => this.clearCache());
        watcher.onDidDelete(() => this.clearCache());
        return watcher;
      });
    }
  
    public dispose() {
      this.clearCache();
      this.watchers?.forEach((watcher) => watcher.dispose());
    }
  
    public async provideCompletionItems(document: TextDocument, position: Position) {
      const line = document.getText(
        new Range(
          new Position(position.line, 0),
          new Position(position.line, position.character)
        )
      );
  
      const components = await this.findComponents();
      return components.map(({ name, args }) => {
        const item = new CompletionItem(name, CompletionItemKind.Class);
        item.detail = args;
        item.insertText = new SnippetString(buildSnippetValue(name, args));
        item.sortText = '0000';
        return item;
      });
    }
  
    private async findComponents(): Promise<readonly Component[]> {
      if (!this.cache) {
        this.cache = await findComponents();
      }
  
      return this.cache;
    }
  
    private clearCache() {
      this.cache = undefined;
    }
  }
  