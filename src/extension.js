const vscode = require('vscode');
const fs = require("fs");
const yuml2svg = require("yuml2svg");

exports.activate = function(context)
{
    class yUMLDocumentContentProvider
    {
        constructor () {
            this._onDidChange = new vscode.EventEmitter();
            this.diagram = "";
        }

        provideTextDocumentContent (uri, token) {
            var editor = vscode.window.activeTextEditor;
			if (editor.document.languageId !== 'yuml') {
				return "<body>Active editor doesn't show a yUML document<body>";
			}
			return this.createHTML();
        }

        createHTML() {
            return `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    .links,
                    .vscode-light .yuml-dark,
                    .vscode-high-contrast .yuml-light,
                    .vscode-dark .yuml-light {
                        display: none;
                    }
                    #topbar {
                        background-color:rgba(255,102,0,0.1);
                        height:24px;
                        line-height:24px;
                        margin:0 -5px 15px -5px;
                        padding-left: 10px;
                        white-space: nowrap;
                        color: #C0C0C0;
                    }
                    .vscode-light #topbar {
                        color: #404040;
                    }
                    #topbar:hover {
                        background-color: rgba(255,102,0,0.5);
                    }
                    #topbar:hover .links {
                        display: inline-block;
                    }
                    a {
                        margin-left: 15px;
                    }
                </style>
            </head>
            <body style="margin:10px;" onload="showTopbar()">
                <div id="topbar">&#9654; yUML <div class="links">
                    <a href="https://github.com/jaime-olivares/vscode-yuml/wiki">Wiki</a>
                    <a href="https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml#review-details">Write a review</a>
                    <a href="https://github.com/jaime-olivares/vscode-yuml/issues">Bug reports &amp; feature requests</a>
                </div></div>
                ${this.diagram}
            </body>
            </html>`;
        }

        get onDidChange() {
            return this._onDidChange.event;
        }

        load(uri, isOpen) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)
                return;

            const text = editor.document.getText();

            try {
                this.diagram = `<div class='yuml-light'>
                    ${yuml2svg(text, { isDark: false })}
                    </div>
                    <div class='yuml-dark'>
                    ${yuml2svg(text, { isDark: true })}
                    </div>`;
            } catch (e) {
                this.diagram = e.message;
            }

          this._onDidChange.fire(uri);
        }

        update(uri) {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)
                return;

            const text = editor.document.getText();
            const filename = editor.document.fileName;

            try {
                const options = {};
                const diagram = yuml2svg(text, options);

                if (options.generate) {
                    fs.writeFile(filename.replace(/\.[^.$]+$/, ".svg"), (err) => {
                        if (err) vscode.window.showInformationMessage(err);
                    });
                }

                if (diagram == "")
                    this.diagram = "";
                else if (!diagram)
                    this.diagram = "Error composing the yUML invocation";
                else
                    this.diagram = `<div class='yuml-light'>
                        ${diagram}
                        </div>
                        <div class='yuml-dark'>
                        ${yuml2svg(text, { isDark: true })}
                        </div>`;
            } catch (e) {
                this.diagram = e.message;
            }

            this._onDidChange.fire(uri);
        }
    }

    const registerCommand = vscode.commands.registerCommand;
    const previewUri = vscode.Uri.parse('vscode-yuml://authority/vscode-yuml');

    let provider = new yUMLDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('vscode-yuml', provider);

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

    return {
        extendMarkdownIt(md) {
            return md.use(require('./markdown-it-yuml.js'));
        }
    }
}

exports.deactivate = function() {};
