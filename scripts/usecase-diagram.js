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

            if (part.match(/^\(.*\)$/))  // use-case
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
            else switch (part)
            {
                case "<":
                    exprs.push(["edge", "vee", "<<extend>>", "none", "dashed"]);
                    break;
                case ">":
                    exprs.push(["edge", "none", "<<include>>", "vee", "dashed"]);
                    break;
                case "-":
                    exprs.push(["edge", "none", "", "none", "solid"]);
                    break;
                case "^":
                    exprs.push(["edge", "empty", "", "none", "solid"]);
                    break;
                default:
                    throw("Invalid expression");
            }
        }

        return exprs;
    }

    function composeDotExpr(specLines, options)
    {
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

                    var node = {
                        fontsize: 10
                    };

                    if (type == "actor") {
                        node.margin = "0.05,0.05";
                        node.shape = "none";
                        node.label = "{img:actor} " + label;
                        node.height = 1;
                    }
                    else {
                        node.margin = "0.20,0.05";
                        node.shape = type;
                        node.label = label;
                        node.height = 0.5;

                        if (elem[k][2]) {
                            node.style = "filled";
                            node.fillcolor = elem[k][2];
                        }
                    }

                    dot += '    ' + uid + ' ' + serialize(node) + "\r\n";
                }
            }

            if (elem.length == 3 && elem[1][0] == 'edge')
            {
                var style = (elem[0][0] == 'note' || elem[2][0] == 'note') ? "dashed" : elem[1][4];

                var edge = {
                    shape: "edge",
                    dir: "both",
                    style: style,
                    arrowtail: elem[1][1],
                    arrowhead: elem[1][3],
                    labeldistance: 2,
                    fontsize: 10
                }
                if (elem[1][2].len > 0)
                    edge.label = elem[1][2];

                dot += '    ' + uids[recordName(elem[0][1])] + " -> " + uids[recordName(elem[2][1])] + ' ' + serialize(edge) + "\r\n";
            }
        }

        dot += '}\r\n';
        return dot;
    }

    return composeDotExpr(specLines, options);
}