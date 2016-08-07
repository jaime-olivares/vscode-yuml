const vscode = require('vscode');
const fs = require('fs');
require('./scripts/yumldoc-utils.js')();

exports.activate = function(context)
{
    class yUMLDocumentContentProvider
    {
        constructor () {
            this._onDidChange = new vscode.EventEmitter();
            this.diagram = "";
        }

        provideTextDocumentContent (uri, token) {
            var doc = `<!DOCTYPE html>
            <html>
            <head>
                <script>
                    function showDiagram() 
                    {
                        var isLight = document.body.classList.contains('vscode-light');
                        var toHide = document.getElementById(isLight ? "dark" : "light");
                        toHide.style.display = "none";  
                    }
                </script>                
            </head>
            <body style="margin:10px;" onload="showDiagram()">
                ${this.diagram}
            </body>
            </html>`;

            var editor = vscode.window.activeTextEditor;
            if (editor)
                editor.show();

            return doc;
        }

        get onDidChange () {            
            return this._onDidChange.event;
        }

        load(uri, isOpen) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)
                return;

            const text = editor.document.getText();
            const filename = editor.document.fileName;

            this.diagram = processYumlDocument(text, filename, false);

            this._onDidChange.fire(uri);
        }

        update(uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)
                return;

            const text = editor.document.getText();
            const filename = editor.document.fileName;
            const diagram = processYumlDocument(text, filename, true);

            if (diagram == "")
                this.diagram = "";
            else if (!diagram)
                this.diagram = "Error composing the yuml invocation";
            else
                this.diagram = diagram;

            this._onDidChange.fire(uri);
        }
    }

    const registerCommand = vscode.commands.registerCommand;
    const previewUri = vscode.Uri.parse('vscode-yuml://authority/vscode-yuml');

    let provider = new yUMLDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('vscode-yuml', provider);

    console.log('The extension "vscode-yuml" is now active.');

    let command = registerCommand('extension.viewYumlDiagram', () => {
        var disp = vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then(
            (success) => { provider.update(previewUri); },
            (reason) => { vscode.window.showErrorMessage(reason); });
        return disp;
    });

    vscode.workspace.onDidSaveTextDocument((e) => { provider.update(previewUri); });

    vscode.workspace.onDidOpenTextDocument((e) => { provider.load(previewUri); });

    vscode.window.onDidChangeActiveTextEditor((e) => { provider.load(previewUri); });

    context.subscriptions.push(command, registration);
}

exports.deactivate = function() {};
