const fs = require('fs');
const classDiagram = require('./class-diagram.js');
const usecaseDiagram = require('./usecase-diagram.js');
const activityDiagram = require('./activity-diagram.js');
const stateDiagram = require('./state-diagram.js');
const deploymentDiagram = require('./deployment-diagram.js');
const packageDiagram = require('./package-diagram.js');
const sequenceDiagram = require('./sequence-diagram.js');
const Viz = require("./viz-lite-1.8.1.js");
const vscode = require('vscode');
require('./svg-utils.js')();

module.exports = function () {
    this.processYumlDocument = function (text, filename, mayGenerate) {
        var newlines = [];
        var options = { dir: "TB", generate: false };

        var lines = text.split(/\r|\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].replace(/^\s+|\s+$/g, '');  // Removes leading and trailing spaces
            if (line.startsWith("//"))
                processDirectives(line, options);
            else if (line.length > 0)
                newlines.push(line);
        }

        if (newlines.length == 0)
            return "";

        if (!options.hasOwnProperty("type")) {
            options.error = "Error: Missing mandatory 'type' directive";
        }

        if (options.hasOwnProperty("error")) {
            return options.error;
        }

        var dot = null;
        var svg = null;

        try {
            switch (options.type) {
                case "class":
                    dot = classDiagram(newlines, options);
                    break;
                case "usecase":
                    dot = usecaseDiagram(newlines, options);
                    break;
                case "activity":
                    dot = activityDiagram(newlines, options);
                    break;
                case "state":
                    dot = stateDiagram(newlines, options);
                    break;
                case "deployment":
                    dot = deploymentDiagram(newlines, options);
                    break;
                case "package":
                    dot = packageDiagram(newlines, options);
                    break;
                case "sequence":
                    svgs = sequenceDiagram(newlines, options);
                    break;
            }
        }
        catch (e) {
            return "Error parsing the yUML file";
        }

        if (dot == null && svgs == null)
            return "Error: unable to parse the yUML file";

        var svgLight, svgDark;

        if (dot != null) {
            try {
                svgLight = Viz(buildDotHeader(false) + dot);
                svgLight = processEmbeddedImages(svgLight, false);

                svgDark = Viz(buildDotHeader(true) + dot);
                svgDark = processEmbeddedImages(svgDark, true);
            }
            catch (e) {
                return "Error composing the diagram"
            }
        }
        else {
            svgLight = svgs[0];
            svgDark = svgs[1];
        }

        try {
            if (filename && options.generate === true && mayGenerate === true) {
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

    processDirectives = function (line, options) {
        const directions = {
            leftToRight: "LR",
            rightToLeft: "RL",
            topDown: "TB"
        };

        var keyvalue = /^\/\/\s+\{\s*([\w]+)\s*:\s*([\w]+)\s*\}$/.exec(line);  // extracts directives as:  // {key:value}
        if (keyvalue != null && keyvalue.length == 3) {
            var key = keyvalue[1];
            var value = keyvalue[2];

            switch (key) {
                case "type":
                    if (/^(class|usecase|activity|state|deployment|package|sequence)$/.test(value))
                        options.type = value;
                    else {
                        options.error = "Error: invalid value for 'type'. Allowed values are: class, usecase, activity, state, deployment, package.";
                        return;
                    }
                    break;
                case "direction":
                    if (/^(leftToRight|rightToLeft|topDown)$/.test(value))
                        options.dir = directions[value];
                    else {
                        options.error = "Error: invalid value for 'direction'. Allowed values are: leftToRight, rightToLeft, topDown <i>(default)</i>.";
                        return;
                    }
                    break;
                case "generate":
                    if (/^(true|false)$/.test(value))
                        options.generate = (value === "true");
                    else {
                        options.error = "Error: invalid value for 'generate'. Allowed values are: true, false <i>(default)</i>.";
                        return;
                    }
            }
        }
    }
}
