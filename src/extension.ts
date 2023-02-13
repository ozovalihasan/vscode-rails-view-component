import { commands, window } from 'vscode';

export function activate() {
    commands.registerCommand('rails-test.rails-test', () => {
        const editor = window.activeTextEditor;

        if (editor) {
            let selected_text = editor.document.getText(editor.selection) 
            selected_text = selected_text.replace("::", "/");

            if (selected_text.toLowerCase().includes("component")){
                selected_text = selected_text.concat(".html.erb")
            }            

            if (selected_text.toLowerCase().includes("\n")){
                selected_text = ""
            }

            commands.executeCommand(
                'workbench.action.quickOpen',
                selected_text
            );
        }
    });

    commands.registerCommand('rails-test.view-component-ruby', () => {
        const editor = window.activeTextEditor;

        if (editor) {
            let selected_text = editor.document.getText(editor.selection) 
            selected_text = selected_text.replace("::", "/");

            if (selected_text.toLowerCase().includes("component")){
                selected_text = selected_text.concat(".rb")
            }


            if (selected_text.toLowerCase().includes("\n")){
                selected_text = ""
            }

            commands.executeCommand(
                'workbench.action.quickOpen',
                selected_text
            );
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}
