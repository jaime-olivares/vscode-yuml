require('./yuml2dot-utils.js')();

/*
Syntax as specified in yuml.me

Use Case	        (Login)
Actor	            [Customer]
<<Extend>>	        (Login)<(Forgot Password)
<<Include>>	        (Register)>(Confirm Email)
Actor Inheritance	[Admin]^[User]
Notes	            [Admin]^[User],[Admin]-(note: Most privilidged user)
*/

module.exports = function(specLines, options)
{
    function parseYumlExpr(specLine)
    {
        var exprs = [];
        var parts = this.splitYumlExpr(specLine);

        for (var i=0; i<parts.length; i++)
        {
            var part = parts[i].trim();
            if (part.length == 0)
                continue;

            if (part=="<")
            {
                exprs.push(["edge", "vee", "<<extend>>", "none", "dashed"]);
            }
            else if (part==">")
            {
                exprs.push(["edge", "none", "<<include>>", "vee", "dashed"]);
            }
            else if (part=="-")
            {
                exprs.push(["edge", "none", "", "none", "solid"]);
            }
            else if (part=="^")
            {
                exprs.push(["edge", "empty", "", "none", "solid"]);
            }
            else if (part.match(/^\(.*\)$/))  // use-case
            {
                part = part.substr(1, part.length-2);

                var bg = "";
                var bgParts = /^(.*)\{bg:([\w]*)\}$/.exec(part);
                if (bgParts != null && bgParts.length == 3)
                {
                    part = bgParts[1];
                    bg = bgParts[2];
                }

                if (part.startsWith("note:"))
                {
                    exprs.push(["note", part.substring(5).trim(), bg]);
                }
                else
                    exprs.push(["ellipse", part, bg]);
            }
            else if (part.match(/^\[.*\]$/))   // actor
            {
                part = part.substr(1, part.length-2);

                exprs.push(["actor", part]);
            }
            else
                throw("Invalid expression");
        }

        return exprs;
    }

    var uids = {};
    var len = 0;

    var dot = 'digraph usecase_diagram {\r\n';
    dot += '    ranksep = 1\r\n';
    dot += '    rankdir = ' + options.dir + '\r\n';

    for (var i=0; i<specLines.length; i++)
    {
        var elem = parseYumlExpr(specLines[i]);

        for (var k=0; k<elem.length; k++)
        {
            var type = elem[k][0];

            if (type == "note" || type == "ellipse" || type == "actor")
            {
                var label = elem[k][1];
                if (uids.hasOwnProperty(recordName(label)))
                    continue;

                var uid = 'A' + (len++).toString();
                uids[recordName(label)] = uid;

                var lines = label.split(";");
                for (var j=0; j<lines.length; j++)
                    lines[j] = wordwrap(lines[j], 20, "\\n");
                label = escape_label(lines.join("\\n"));

                dot += '    ' + uid + ' [ ';
                dot += 'fontsize = 10, ';

                if (type == "actor")
                {
                    dot += 'margin = "0.05,0.05", ';
                    dot += 'shape = "none", ';
                    dot += 'label = "{img:actor} ' + label + '", ';
                    dot += 'height = 1 ';
                }
                else {
                    dot += 'margin = "0.20,0.05", ';
                    dot += 'shape = "' + type + '", ';
                    dot += 'label = "' + label + '", ';
                    dot += 'height = 0.5 ';
                    if (elem[k][2]) {
                        dot += ', style = "filled"';
                        dot += ', fillcolor = "' + elem[k][2] + '"';
                    }
                }
                dot += ' ]\r\n';
            }
        }

        if (elem.length == 3 && elem[1][0] == 'edge')
        {
            var edge = elem[1];
            var style = (elem[0][0] == 'note' || elem[2][0] == 'note') ? "dashed" : edge[4];

            dot += '    ' + uids[recordName(elem[0][1])] + ' -> ' + uids[recordName(elem[2][1])] + ' ';
            dot += '[ shape = "' + edge[0] + '", ';
            dot += 'dir = "both", ';
            dot += 'style = "' + style + '", ';
            dot += 'arrowtail = "' + edge[1] + '", ';
            if (edge[2].len > 0)
                dot += 'label = "' + edge[2] + '", ';
            dot += 'arrowhead = "' + edge[3] + '", ';
            dot += 'labeldistance = 2, ';
            dot += 'fontsize = 10 ]\r\n';
        }
    }

    dot += '}\r\n';
    return dot;
}