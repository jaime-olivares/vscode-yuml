const http = require('http');
const fs = require('fs');

module.exports = function() 
{ 
    this.determineHasGenerate = function(text, options)
    {
        var options = {};
        var hasGenerate = false;

        this.traverseLines(text, (line) => {
            if (line.startsWith("//"))
            {
                this.processDirectives(line, options);
                if (options.hasOwnProperty("error"))
                    return false;
                if (options.hasOwnProperty("generate"))
                {
                    hasGenerate = options.generate;
                    return false;
                }                    
                return true;
            }
            else if (line.length > 0)
                return false;
        });            

        return hasGenerate;
    }

    this.createYumlElement = function(text, uri, filename, callback) 
    {
        var newlines = [];
        var options = { style: "plain", dir: "LR", scale: "100", generate: false };

        this.traverseLines(text, (line) => {
            if (line.startsWith("//"))
                this.processDirectives(line, options);
            else if (line.length > 0) 
                newlines.push(line);
            return true;
        });

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

        if (!options.generate)
            return this.composeYumlImg(newlines.join(), options);

        this.getYumlPngAsync(newlines.join(), options, callback);
        return "Loading...";
    }

    this.traverseLines = function(text, funcProcess)
    {
        var lines = text.split(/\r|\n/);

        for (var i=0; i<lines.length; i++)
        {
            var line = lines[i].replace(/^\s+|\s+$/g,'');  // Removes leading and trailing spaces
            if (!funcProcess(line))
                break;
        }            
    }

    this.processDirectives = function(line, options) 
    {
        const styles = {
            boring: "nofunky",
            plain: "plain",
            scruffy: "scruffy"
        }

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
                case "style":
                    if (value=="boring" || value=="plain" || value=="scruffy")
                        options.style = styles[value];
                    else {
                        options.error = "Error: invalid value for 'style'. Allowed values are: boring, plain <i>(default)</i>, scruffy.";
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

    this.composeYumlImg = function(diagram, options) 
    {
        var element = "<img src='http://yuml.me/diagram/" + options.style;
        element += ";dir:" + options.dir + ";scale:" + options.scale;  
        element += "/" + options.type + "/" + encodeURI(diagram) + "'/>";

        return element;            
    }

    this.getYumlPngAsync = function(diagram, options, callback) 
    {
        var path = "/diagram/" + options.style;
        path += ";dir:" + options.dir + ";scale:" + options.scale;  
        path += "/" + options.type + "/" + encodeURI(diagram);

        var request = {
            hostname: "yuml.me",
            port: 80,
            path: path,
            agent: false
        }

        var data = [];

        http.get(request, (response) => {
            response.on("data", function(body) { data.push(body); });
            response.on("end", function() { callback(data); });
        }).on("error", function(e) { callback(e.message) });
    }

    this.processPngResponse = function(pngData, filename)
    {
        var imagename = filename.replace(/\.[^.$]+$/, '.png');
        var action = "retrieved from";

        if (pngData != null)
        {
            try
            {
                var buffer = Buffer.concat(pngData);
                fs.writeFileSync(imagename, buffer);
                action = "stored at";
            }
            catch (error) { return "Error generating the image file"; }
        }

        var element = "<span>Image " + action + " " + imagename + "</span><p/>";
        element += "<img src=file://" + imagename + " />"; 

        return element;
    }

    this.imageFileIsDirty = function(filename)
    {
        try 
        {
            var imagename = filename.replace(/\.[^.$]+$/, '.png');
            dateYuml = fs.statSync(filename).mtime.getTime();
            datePng = fs.statSync(imagename).mtime.getTime();

            return datePng < dateYuml;
        }
        catch (err)
        {
            return true;
        }
    }
}