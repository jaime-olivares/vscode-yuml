const classDiagram = require('./class-diagram.js');
const Viz = require("viz.js");

module.exports = function()
{
    this.createYumlElement = function(text, uri, filename)
    {
        var newlines = [];
        var options = { style: "plain", dir: "LR", scale: "100", generate: false };

        var lines = text.split(/\r|\n/);

        for (var i=0; i<lines.length; i++)
        {
            var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
            if (line.startsWith("//"))
                this.processDirectives(line, options);
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

        var output = null;
        switch (options.type)
        {
            case "class":
                output = classDiagram(newlines, options);
                break;
            case "usecase":
                break;
            case "activity":
                break;
        }

        if (output != null)
            return Viz(output);

        return null;
    }

    this.processDirectives = function(line, options)
    {
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
                case "size":
                    if (value=="huge" || value=="big" || value=="normal" || value=="small" || value=="tiny")
                        options.scale = sizes[value];
                    else {
                        options.error = "Error: invalid value for 'size'. Allowed values are: huge, big, normal <i>(default)</i>, small, tiny.";
                        return;
                    }
                    break;
                case "direction":
                    if (value=="leftToRight" || value=="rightToLeft" || value=="topDown")
                        options.dir = directions[value];
                    else {
                        options.error = "Error: invalid value for 'direction'. Allowed values are: leftToRight <i>(default)</i>, rightToLeft, topDown.";
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