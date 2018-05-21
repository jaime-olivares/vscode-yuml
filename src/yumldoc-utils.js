const fs = require('fs');
require('yuml-diagram')();

module.exports = function()
{
    this.processYumlDocumentForVSCode = function(text, filename, mayGenerate) 
    {
        var options = {};
        getOptions(text, options);

        var svgLight = processYumlDocument(text, filename, false);
        var svgDark = processYumlDocument(text, filename, true);

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

    function getOptions(text, options)
    {
        var lines = text.split(/\r|\n/);

        for (var i=0; i<lines.length; i++)
        {
            var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
            if (line.startsWith("//"))
                processDirectives(line, options);
        }
    }
}
