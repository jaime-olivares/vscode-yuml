const classDiagram = require('./class-diagram.js');
const usecaseDiagram = require('./usecase-diagram.js');
const Viz = require("viz.js");

module.exports = function()
{
    var shapes = {
        actor: [`<circle cx="0" cy="-20" r="7.5" />
                <line x1="0" y1="-12.5" x2="0" y2="5" />
                <line x1="-15" y1="-5" x2="15" y2="-5" />
                <line x1="0" y1="5" x2="-15" y2="17" />
                <line x1="0" y1="5" x2="15" y2="17" />`, 0, 25 ]
    }

    this.createYumlElement = function(text, uri, filename)
    {
        var newlines = [];
        var options = { dir: "TB", scale: "100", generate: false };

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

    processEmbeddedImages = function(svg)
    {
        var expr = /<text\s.*>{img:.*}.*<\/text>/g;

        svg = svg.replace(expr, function(match) {
            try {
                var parts = /<text\s(.*)>{img:(.*)}(.*)<\/text>/.exec(match);
                var text = "<text " + parts[1] + ">" + parts[3].trim() + "</text>";

                if (!shapes.hasOwnProperty(parts[2]))
                    return text;

                var translate = /<text\s.*x=\"(-?[0-9\.]+)\" y=\"(-?[0-9\.]+)\"/.exec(text);
                var x = translate[1];
                var y = translate[2];

                var img = shapes[parts[2]];
                text = text.replace(' x="' + x + '"', ' x="' + (parseFloat(x)+img[1]) + '"');
                text = text.replace(' y="' + y + '"', ' y="' + (parseFloat(y)+img[2]) + '"');

                return '<g transform="translate(' + x + ',' + y + ')" style="fill:none;stroke:black;stroke-width:1px">' + img[0] + "</g>\r\n" + text;
            }
            catch (e) {
                return match;
            }
        });

        return svg;
    }
}