const classDiagram = require('./class-diagram.js');
const usecaseDiagram = require('./usecase-diagram.js');
const Viz = require("viz.js");
require('./svg-utils.js')();

module.exports = function()
{
    this.processYumlDocument = function(text, uri, filename)
    {
        var newlines = [];
        var options = { dir: "TB", generate: false };

        var lines = text.split(/\r|\n/);

        for (var i=0; i<lines.length; i++)
        {
            var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
            if (line.startsWith("//"))
                processDirectives(line, options);
            else if (line.length > 0)
                newlines.push(line);
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

        var dot = null;
        switch (options.type)
        {
            case "class":
                dot = classDiagram(newlines, options);
                break;
            case "usecase":
                dot = usecaseDiagram(newlines, options);
                break;
            case "activity":
                break;
        }

        if (dot != null)
        {
            var svg = Viz(dot);
            return processEmbeddedImages(svg);
        }

        return null;
    }

    processDirectives = function(line, options)
    {
        const directions = {
            leftToRight: "LR",
            rightToLeft: "RL",
            topDown: "TB"
        };

        var keyvalue = /^\/\/\s+\{\s*([\w]+)\s*:\s*([\w]+)\s*\}$/.exec(line);  // extracts directives as:  // {key:value}
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
                        return;
                    }
                    break;
                case "direction":
                    if (value=="leftToRight" || value=="rightToLeft" || value=="topDown")
                        options.dir = directions[value];
                    else {
                        options.error = "Error: invalid value for 'direction'. Allowed values are: leftToRight, rightToLeft, topDown <i>(default)</i>.";
                        return;
                    }
                    break;
                case "generate":
                    if (value=="true" || value=="false")
                        options.generate = (value === "true");
                    else {
                        options.error = "Error: invalid value for 'generate'. Allowed values are: true, false <i>(default)</i>.";
                        return;
                    }
            }
        }
    }
}