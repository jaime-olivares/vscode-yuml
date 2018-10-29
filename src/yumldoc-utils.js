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
        .vscode-high-contrast .yuml-light,
        .vscode-dark .yuml-light,
        .vscode-light .yuml-dark {
            display: none;
        }
    </style>
    <img class='yuml-light' src='data:image/svg+xml;base64,${Buffer.from(svgLight).toString('base64')}'>
    <img class='yuml-dark' src='data:image/svg+xml;base64,${Buffer.from(svgDark).toString('base64')}'>
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
