const fs = require('fs');
const yuml_diagram = require('yuml-diagram');

module.exports = function()
{
    this.processYumlDocumentForVSCode = function(text, filename, mayGenerate) 
    {
        var options = {};
        var yuml = new yuml_diagram();
        getOptions(yuml, text, options);

        var svgLight = yuml.processYumlDocument(text, false);
        var svgDark = yuml.processYumlDocument(text, true);

        try {
            if (filename && options.generate===true && mayGenerate===true)
            {
                var imagename = filename.replace(/\.[^.$]+$/, '.svg');
                fs.writeFileSync(imagename, svgLight);
            }
        }
        catch (e) { }

        var div = `<div>
    <style>
        .vscode-high-contrast .yuml-light {
            display: none;
        }
        .vscode-dark .yuml-light {
            display: none;
        }
        .vscode-light .yuml-dark {
            display: none;
        }
    </style>
    <div class='yuml-light'>
        ${svgLight}
    </div>
    <div class='yuml-dark'>
        ${svgDark}
    </div>
</div>`;

        return div;
    }

    function getOptions(yuml, text, options)
    {
        var lines = text.split(/\r|\n/);

        for (var i=0; i<lines.length; i++)
        {
            var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
            
            if (line.startsWith("//"))
                yuml.processDirectives(line, options);
        }
    }
}
