require('./yuml2dot-utils.js')();

/*
Syntax as specified in yuml.me

Start	           (start)
End	               (end)
Activity           (Find Products)
Flow	           (start)->(Find Products)
Multiple Assoc.    (start)->(Find Products)->(end)
Decisions          (start)-><d1>
Decisions w/Label  (start)-><d1>logged in->(Show Dashboard), <d1>not logged in->(Show Login Page)
Parallel	       (Action 1)->|a|,(Action 2)->|a|
*/

module.exports = function(specLines, options)
{
    function parseYumlExpr(specLine)
    {
        var exprs = [];
        var parts = this.splitYumlExpr(specLine, "(<|");

        for (var i=0; i<parts.length; i++)
        {
            var part = parts[i].trim();
            if (part.length == 0)
                continue;

            if (part.match(/^\(.*\)$/)) // activity
            {
                part = part.substr(1, part.length-2);
                var ret = extractBgColor(part);
                part = ret.part;

                //if (part.startsWith("note:"))
                //{
                //    exprs.push(["note", part.substring(5).trim(), ret.bg]);
                //}
                //else
                    exprs.push(["record", part, ret.bg]);
            }
            else if (part.match(/^<.*>$/))
            {
                part = part.substr(1, part.length-2);
                exprs.push(["diamond", part]);
            }
            else if (part.match(/^\|.*\|$/))
            {
                part = part.substr(1, part.length-2);
                exprs.push(["rectangle", part]);
            }
            else if (part.match(/->$/))  // arrow
            {
                part = part.substr(0, part.length-2).trim();
                exprs.push(["edge", "none", "vee", part, "solid"]);
            }
            else if (part == '-')
            {
                exprs.push(["edge", "none", "none", "", "solid"]);
            }
            else
                throw("Invalid expression");
        }

        return exprs;
    }

    function composeDotExpr(specLines, options)
    {
        var uids = {};
        var len = 0;

        var dot = 'digraph activity_diagram {\r\n';
        dot += '    ranksep = 0.5\r\n';
        dot += '    rankdir = ' + options.dir + '\r\n';

        for (var i=0; i<specLines.length; i++)
        {
            var elem = parseYumlExpr(specLines[i]);

            for (var k=0; k<elem.length; k++)
            {
                if (elem[k][0] == "note" || elem[k][0] == "record")
                {
                    var label = elem[k][1];
                    if (uids.hasOwnProperty(recordName(label)))
                        continue;

                    var uid = 'A' + (len++).toString();
                    uids[recordName(label)] = uid;

                    if (elem[k][0]=="record" && (label=="start" || label=="end"))
                    {
                        var node = {
                            shape: label=="start" ? "circle" : "doublecircle",
                            height: 0.3,
                            width: 0.3,
                            margin: "0,0",
                            label: ""
                        }
                    }
                    else
                    {
                        var node = {
                            shape: elem[k][0],
                            height: 0.5,
                            fontsize: 10,
                            margin: "0.20,0.05",
                            label: escape_label(label),
                            style: "rounded"
                        }

                        if (elem[k][2]) {
                            node.style = "filled";
                            node.fillcolor = elem[k][2];
                        }
                    }

                    dot += '    ' + uid + ' ' + serialize(node) + "\r\n";
                }
                else if (elem[k][0] == "diamond")
                {
                    var label = elem[k][1];
                    if (uids.hasOwnProperty(recordName(label)))
                        continue;

                    var uid = 'A' + (len++).toString();
                    uids[recordName(label)] = uid;

                    var node = {
                        shape: "diamond",
                        height: 0.5,
                        width: 0.5,
                        margin: "0,0",
                        label: ""
                    }

                    dot += '    ' + uid + ' ' + serialize(node) + "\r\n";
                }
                else if (elem[k][0] == "rectangle")
                {
                    var label = elem[k][1];
                    if (uids.hasOwnProperty(recordName(label)))
                        continue;

                    var uid = 'A' + (len++).toString();
                    uids[recordName(label)] = uid;

                    var node = {
                        shape: "rectangle",
                        height: options.dir == "TB" ? 0.05 : 0.5,
                        width:  options.dir == "TB" ? 0.5 : 0.05,
                        margin: "0,0",
                        style: "filled",
                        fillcolor: "black",
                        label: ""
                    }

                    dot += '    ' + uid + ' ' + serialize(node) + "\r\n";
                }
            }

            for (var k=1; k<(elem.length-1); k++)
            {
                if (elem[k][0] == "edge" && elem[k-1][0] != "edge" && elem[k+1][0] != "edge")
                {
                    var style = (elem[k-1][0] == 'note' || elem[k+1][0] == 'note') ? "dashed" : elem[k][4];

                    var edge = {
                        shape: "edge",
                        dir: "both",
                        style: style,
                        arrowtail: elem[k][1],
                        arrowhead: elem[k][2],
                        labeldistance: 2,
                        fontsize: 10
                    }

                    if (elem[k][3].length > 0)
                        edge.label = elem[k][3];

                    dot += '    ' + uids[recordName(elem[k-1][1])] + " -> " + uids[recordName(elem[k+1][1])] + ' ' + serialize(edge) + "\r\n";
                }
            }
        }

        dot += '}\r\n';
        return dot;
    }

    return composeDotExpr(specLines, options);
}