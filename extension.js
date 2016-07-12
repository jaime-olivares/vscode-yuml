const vscode = require('vscode');
const _ = require('lodash');

function activate(context) 
{
    class yUMLDocumentContentProvider 
    {
        constructor () {
            this._onDidChange =  new vscode.EventEmitter();
            this.diagram = '';
            this.update = _.throttle(this.unthrottledUpdate, 250);
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
        
        unthrottledUpdate (uri) 
        {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !editor.document)  // Just in case
                return;

            const text = editor.document.getText();            
            const diagram = this.createYumlElement(text);
            
            if (diagram == "") {
                this.diagram = "";
            } else if (!diagram) {
                this.diagram = "Error composing the yuml invocation";
            } else {
                this.diagram = diagram;
            }
            
            this._onDidChange.fire(uri);
        }

        createYumlElement(text) {
            var lines = text.split(/\r|\n/);
            var newlines = [];
            var options = { style: "plain", dir: "LR", scale: "100" };

            for (var i=0; i<lines.length; i++)
            {
                var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
                if (line.startsWith("//"))
                {
                    this.processDirectives(line, options);
                }
                else if (line.length > 0) 
                {
                    newlines.push(line);
                }
            }
            if (newlines.length == 0)  
                return "";

            if (!options.hasOwnProperty("type"))
            {
                options.error = "Error: Missing mandatory 'type' directive";
            }

            if (options.hasOwnProperty("error"))
            {
                return options.error;
            }

            return this.composeYuml(newlines.join(), options);
        }

        processDirectives(line, options) {
            const sizes = {
                huge: "140",
                big: "120",
                normal: "100",
                small: "80",
                tiny: "60"
            };
            const directions = {
                leftToRight: "LR",
                rightToLeft: "RL",
                topDown: "TB"
            }

            var keyvalue = /^\/\/\s+\{([\w]+)\s*:\s*([\w]+)\}$/.exec(line);  // extracts directives as:  // {key:value}
            if (keyvalue != null && keyvalue.length == 3)
            {
                var key = keyvalue[1];
                var value = keyvalue[2];

                switch (key)
                {
                    case "type":
                        if (value=="class" || value=="usecase" || value=="activity")
                            options.type = value;
                        else {
                            options.error = "Error: invalid value for 'type'. Allowed values are: class, usecase, activity.";
                            return options;
                        } 
                        break;
                    case "style":
                        if (value=="boring" || value=="plain" || value=="scruffy")
                            options.style = value;
                        else {
                            options.error = "Error: invalid value for 'style'. Allowed values are: boring, plain <i>(default)</i>, scruffy.";
                            return options;
                        } 
                        break;
                    case "size":
                        if (value=="huge" || value=="big" || value=="normal" || value=="small" || value=="tiny")
                            options.scale = sizes[value];
                        else {
                            options.error = "Error: invalid value for 'size'. Allowed values are: huge, big, normal <i>(default)</i>, small, tiny.";
                            return options;
                        } 
                        break;
                    case "direction":
                        if (value=="leftToRight" || value=="rightToLeft" || value=="topDown")
                            options.dir = directions[value];
                        else {
                            options.error = "Error: invalid value for 'style'. Allowed values are: leftToRight <i>(default)</i>, rightToLeft, topDown.";
                            return options;
                        }
                }
            }

            return options;            
        }

        composeYuml(diagram, options) {
            var uri = "<img src='http://yuml.me/diagram/" + options.style;
            uri += ";dir:" + options.dir + ";scale:" + options.scale;  
            uri += "/" + options.type + "/" + encodeURI(diagram) + "'/>";
            return uri;            
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

    vscode.workspace.onDidSaveTextDocument((e) => {
        provider.update(previewUri);
    });
    
    context.subscriptions.push(disposable, registration);
}
function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;
