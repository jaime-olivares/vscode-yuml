require('./yuml2dot-utils.js')();

/*
Class         [Customer]
Directional   [Customer]->[Order]
Bidirectional [Customer]<->[Order]
Aggregation   [Customer]+-[Order] or [Customer]<>-[Order]
Composition   [Customer]++-[Order]
Inheritance   [Customer]^[Cool Customer], [Customer]^[Uncool Customer]
Dependencies  [Customer]uses-.->[PaymentStrategy]
Cardinality   [Customer]<1-1..2>[Address]
Labels        [Person]customer-billingAddress[Address]
Notes         [Person]-[Address],[Address]-[note: Value Object]
Full Class    [Customer|Forename;Surname;Email|Save()]
Color splash  [Customer{bg:orange}]<>1->*[Order{bg:green}]
Comment       // Comments

[Foo|valueProp]
[Foo]entityRef->[Bar]
[Foo]entityComp++->ownedBy[Baz]
[Foo]oneToMany->*[FooBar]
[Bar|name]
[FooBar|value]
[FooBar]^[Bar]
*/

module.exports = function() 
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

            if (part=="^")
            {
                exprs.push(["edge", "empty", "", "none", "", "solid"]);                
            }
            // [something like this]
            // [something like this {bg:color}]
            // [note: something like this {bg:color}]
            else if (part.match(/^\[.*\]$/))
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
                    exprs.push(["record", part, bg]); 
            }
            else if (part.indexOf("-") >= 0)
            {
                var style;
                var tokens;

                if (part.indexOf("-.-") >= 0)
                {
                    style = "dashed";
                    tokens = part.split("-.-");
                }
                else
                {
                    style = "solid";
                    tokens = part.split("-");
                }

                if (tokens.length != 2)
                    throw("Invalid expression");

                var left = tokens[0];
                var right = tokens[1];
                var lstyle, ltext, rstyle, rtext;

                var processLeft = function(left)
                {
                    if (left.startsWith("<>"))
                        return [ "odiamond", left.substring(2)];
                    else if (left.startsWith("++")) 
                        return [ "diamond", left.substring(2)];                  
                    else if (left.startsWith("+"))
                        return [ "odiamond", left.substring(1)];
                    else if (left.startsWith("<") || left.endsWith(">"))
                        return [ "vee", left.substring(1)];
                    else if (left.startsWith("^")) 
                        return [ "empty", left.substring(1)];
                    else
                        return [ "none", left ];
                }
                tokens = processLeft(left);
                lstyle = tokens[0];
                ltext = tokens[1];

                var processRight = function(right)
                {
                    var len = right.length;

                    if (right.endsWith("<>"))
                        return [ "odiamond", right.substring(0, len-2)];
                    else if (right.endsWith("++")) 
                        return [ "diamond", right.substring(0, len-2)];
                    else if (right.endsWith("+"))
                        return [ "odiamond", right.substring(0, len-1)];
                    else if (right.endsWith(">"))
                        return [ "vee", right.substring(0, len-1)];
                    else if (right.endsWith("^")) 
                        return [ "empty", right.substring(0, len-1)];
                    else
                        return processLeft(right);
                }
                tokens = processRight(right);
                rstyle = tokens[0];
                rtext = tokens[1];
                
                exprs.push(['edge', lstyle, ltext, rstyle, rtext, style]);
            }
        }

        return exprs;
    }

    this.yuml2dot = function(specLines, options)
    {
        var uids = {};
        var len = 0;

        var Foo = function(label)
        {
            this.uid = label;
        };

        if (specLines.length > 5)
            options.rankdir = 'TD'
        else
            options.rankdir = 'LR'

        var dot = "";
        dot += 'digraph class_diagram {\r\n';
        dot += '    ranksep = 1\r\n';
        dot += '    rankdir = ' + options.rankdir + '\r\n';

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
                    uids[recordName(label)] = new Foo(uid);

                    dot += '    ' + uid + ' [ ';
                    dot += 'shape = "' + elem[k][0] + '", ';
                    dot += 'height = 0.50, ';
                    dot += 'fontsize = 10, ';
                    dot += 'margin = "0.20,0.05", ';
                
                    // Looks like table / class with attributes and methods
                    if (label.indexOf("|") >= 0)
                    {
                        label = label + '\\n';
                        label = label.replace('|', '\\n|');
                    }
                    else
                    {
                        var lines = label.split(";");
                        for (var j=0; j<lines.length; j++)
                            lines[j] = wordwrap(lines[j], 20, "\\n");
                        label = lines.join("\\n");
                    }

                    label = escape_label(label);

                    //if (label.indexOf("|") >= 0 &&  options.rankdir == 'TD')
                    //    label = '{' + label + '}'

                    dot += 'label = "' + label + '"';

                    if (elem[k][2]) {
                        dot += ', style = "filled"';
                        dot += ', fillcolor = "' + elem[k][2] + '"';
                    }
                    dot += ' ]\r\n';
                }
            }

            if (elem.length == 3 && elem[1][0] == 'edge')
            {
                var edge = elem[1];
                var style = (elem[0][0] == 'note' || elem[2][0] == 'note') ? "dashed" : edge[5];

                dot += '    ' + uids[recordName(elem[0][1])].uid + ' -> ' + uids[recordName(elem[2][1])].uid + ' ';
                dot += '[ shape = "' + edge[0] + '", ';
                dot += 'dir = "both", ';
                dot += 'style = "' + style + '", ';
                dot += 'arrowtail = "' + edge[1] + '", ';
                dot += 'taillabel = "' + edge[2] + '", ';
                dot += 'arrowhead = "' + edge[3] + '", ';
                dot += 'headlabel = "' + edge[4] + '", ';
                dot += 'labeldistance = 2, ';
                dot += 'fontsize = 10 ]\r\n';
            }
        }

        dot += '}\r\n';
        return dot;
    }     
}