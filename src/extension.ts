import { commands, window } from 'vscode';

export function activate() {
    commands.registerCommand('rails-test.rails-test', () => {
        const editor = window.activeTextEditor;

        if (editor) {
            const cursorPosition = editor.selection.active
            const current_line_text = editor.document.lineAt(cursorPosition.line).text
            let current_line_match = current_line_text.match(/render\s*(.*Component)/)
            let selected_text = ""

            if (current_line_match !== null) {
                selected_text = current_line_match[1].concat(".html.erb")
            } else {
                selected_text = editor.document.getText(editor.selection)
            }

            selected_text = selected_text.replace("::", "/");

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
            const cursorPosition = editor.selection.active
            const current_line_text = editor.document.lineAt(cursorPosition.line).text
            let current_line_match = current_line_text.match(/render\s*(.*Component)/)
            let selected_text = ""

            if (current_line_match !== null) {
                selected_text = current_line_match[1].concat(".rb")
            } else {
                selected_text = editor.document.getText(editor.selection)
            }

            selected_text = selected_text.replace("::", "/");

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
