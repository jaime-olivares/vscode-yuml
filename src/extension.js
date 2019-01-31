const vscode = require('vscode');
require('./yumldoc-utils.js')();

exports.activate = function(context)
{
    class yUMLDocumentContentProvider
    {
        constructor () 
        {
            this.diagram = "";
        }

        provideWebContent() 
        {
            var editor = vscode.window.activeTextEditor;

            if (!editor || !editor.document)
                return "<body>No active editor<body>";           

			if (!(editor.document.languageId === 'yuml'))
				return "<body>Active editor doesn't show a yUML document<body>";

            return this.createHTML();
        }

        createHTML()
        {
            return `<!DOCTYPE html>
            <html>
            <head>
                <script>
                    function showTopbar() 
                    {
                        var isLight = document.body.classList.contains('vscode-light');
                        var styleSheet = document.getElementById('topbar-themed');
                        var color = isLight ? "#404040" : "#C0C0C0";
                        styleSheet.innerHtml = "#topbar { color:" + color + "; }";
                    }
                </script>
                <style>
                    #topbar {
                        background-color:rgba(255,102,0,0.1);
                        height:24px;
                        line-height:24px;
                        margin:0 -5px 15px -5px;
                        padding-left: 10px;
                        white-space: nowrap;
                    } 
                    .links {
                        display: none;                        
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
                <style id="topbar-themed">
                </style>                    
            </head>
            <body style="margin:10px;" onload="showTopbar()">
                <div id="topbar">&#9654; yUML <div class="links">
                    <a href="https://github.com/jaime-olivares/yuml-diagram/wiki">Wiki</a>
                    <a href="https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml#review-details">Write a review</a>
                    <a href="https://github.com/jaime-olivares/vscode-yuml/issues">Bug reports &amp; feature requests</a>
                </div></div>
                ${this.diagram}
            </body>
            </html>`;
        }
    }

    let currentPanel = undefined;
    const provider = new yUMLDocumentContentProvider();
 
    // const previewUri = vscode.Uri.parse('vscode-yuml://authority/vscode-yuml');
    let registration = vscode.workspace.registerTextDocumentContentProvider('vscode-yuml', provider);

    function showDiagram(reveal)
    {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !editor.document)
            return;

        if (!(editor.document.languageId === 'yuml'))
            return;

        const columnToShowIn = editor ? (editor.viewColumn == 1 ? 2 : 1) : undefined;
                
        const text = editor.document.getText();
        const filename = editor.document.fileName;
        const diag = processYumlDocumentForVSCode(text, filename, true);

        if (diag == "")
            provider.diagram = "";
        else if (!diag)
            provider.diagram = "Error composing the yUML invocation";
        else
            provider.diagram = diag;

        if (currentPanel) 
        {
            currentPanel.webview.html = provider.provideWebContent();

            if (reveal)
                currentPanel.reveal(columnToShowIn)
        }
        else 
        {
            // Create and show a new webview
            currentPanel = vscode.window.createWebviewPanel(
                'yuml', // Identifies the type of the webview. Used internally
                'Yuml Diagram', // Title of the panel displayed to the user
                columnToShowIn, // Editor column to show the new webview panel in.
                {
					enableScripts: true
                }
            );
            currentPanel.webview.html = provider.provideWebContent();

            currentPanel.onDidDispose(
                () => { currentPanel = undefined; },
                null,
                context.subscriptions
            );
        }
    }

    let command = vscode.commands.registerCommand('extension.viewYumlDiagram', () => 
    {
        showDiagram();
    });

    vscode.workspace.onDidSaveTextDocument((e) => 
    { 
        showDiagram(); 
    });
    vscode.workspace.onDidOpenTextDocument((e) => 
    { 
        showDiagram(); 
    });
    //vscode.window.onDidChangeActiveTextEditor((e) => { provider.loadOrUpdate(); });
    //provider.onDidChange((e) => { vscode.commands.executeCommand("extension.viewYumlDiagram"); })

    context.subscriptions.push(command, registration);

    return {
        extendMarkdownIt(md) 
        {
            return md.use(require('./markdown-it-yuml.js'));
        }
    }
}

exports.deactivate = function() {};