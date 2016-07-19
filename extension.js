const vscode = require('vscode');
const fs = require('fs');
const classDiagram = require('./scripts/class-diagram.js');

require('./scripts/yuml-utils.js')();

exports.activate = function(context) 
{
    class yUMLDocumentContentProvider 
    {
        constructor () {
            this._onDidChange = new vscode.EventEmitter();
            this.diagram = "";
        }

        provideTextDocumentContent (uri, token) {
            return `<!DOCTYPE html>
            <html>
            <head>
            </head>
            <body style="background:white;color:black;border:10px;">
                ${this.diagram}
            </body>`;
        }
        
        get onDidChange () {
            return this._onDidChange.event;
        }

        load(uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)
                return;

            const text = editor.document.getText();
            const filename = editor.document.fileName;

            this.diagram = createYumlElement(text, uri, filename); 
            
            this._onDidChange.fire(uri); 
        }

        update(uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)  
                return;

            const text = editor.document.getText();            
            const filename = editor.document.fileName;
            const diagram = createYumlElement(text, uri, filename);
            
            if (diagram == "") 
                this.diagram = "";
            else if (!diagram)
                this.diagram = "Error composing the yuml invocation";
            else
                this.diagram = diagram;
            
            this._onDidChange.fire(uri);
        }

        imageFileIsDirty(filename)   // Not being used yet
        {
            try 
            {
                var imagename = filename.replace(/\.[^.$]+$/, '.png');
                dateYuml = fs.statSync(filename).mtime.getTime();
                datePng = fs.statSync(imagename).mtime.getTime();

                return datePng < dateYuml;
            }
            catch (err)
            {
                return true;
            }
        }
    }
    
    const registerCommand = vscode.commands.registerCommand;
    const previewUri = vscode.Uri.parse('vscode-yuml://authority/vscode-yuml');
    
    let provider = new yUMLDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('vscode-yuml', provider);

    console.log('The extension "vscode-yuml" is now active.');

    let disposable = registerCommand('extension.viewYumlDiagram', () => {
        var disp = vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then(
            (success) => { provider.update(previewUri); }, 
            (reason) => { vscode.window.showErrorMessage(reason); });
        return disp;
    });

    vscode.workspace.onDidSaveTextDocument((e) => { provider.update(previewUri); });

    vscode.workspace.onDidOpenTextDocument((e) => { provider.load(previewUri); });

    context.subscriptions.push(disposable, registration);
}

exports.deactivate = function() {};
