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
    var last_id = 0;

    function Box (name, spec) {
        this.name = name;
        this.spec = spec;
        this.uid = 'A' + (last_id++);
        this.right_margin = 0
        this.width = 0

        this.update = function(spec)
        {
            if (this.spec.length < spec.length)
                this.spec = spec
            return this;
        }
    }

    function Boxes() {
        this.boxes = {};

        this.addBox = function(spec) {
            var name = spec.split('|')[0].trim();
            if (!boxes.hasOwnProperty(name))
                this.boxes[name] = new Box(name, spec);
            return this.boxes[name].update(spec);
        }

        this.getBoxes = function() {
            return this.boxes;  // must be sorted and possibly an array
        }
    }

    function escape_label(label)
    {
        label = label.replace('{', '\\{').replace('}', '\\}');
        label = label.replace(';', '\\n');
        label = label.replace(' ', '\\ ');
        label = label.replace('<', '\\<').replace('>', '\\>');
        label = label.replace('\\n\\n', '\\n');
        return label;
    }    

    function splitYumlExpr(spec)
    {
        var word = "";
        var depth = 0;
        var parts = [];

        for (var i=0; i<spec.length; i++)
        {
            c = spec[i];

            if (c == '[')
                depth += 1
            else if (c == ']')
                depth -= 1

            if (depth == 1 && c == '[') {
                parts.push(word.trim());
                word = c;
                continue;
            }

            word += c;
            if (depth == 0 && c == ']') {
                parts.push(word.trim());
                word = "";
            }
        }

        if (word.length > 0)
            parts.push(word.trim());

        return parts;
    }

    /* function crop(fin, fout) {
        img = Image.open(fin)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        bg = Image.new('RGB', img.size, (255, 255, 255))
        diff = ImageChops.difference(img, bg)
        area = img.crop(diff.getbbox())
        area.save(fout, 'png')
    } */

    function escape_token_escapes(spec)
    {
        return spec.replace('\\[', '\\u005b').replace('\\]', '\\u005d');
    }

    function unescape_token_escapes(spec)
    {
        return spec.replace('\\u005b', '[').replace('\\u005d', ']');
    }

    function parseYumlExpr(spec)
    {
        var exprs = []
        var parts = this.splitYumlExpr(escape_tokens);

        for (var i=0; i<parts.length; i++)
        {
            var part = parts[i].trim();
            // control empty part

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
                var bgParts = /^\[(.*)\{bg:[\w]*\}\]$/.exec(part);
                if (bgParts.length == 3)
                {
                    part = bgParts[1];
                    bg = bgParts[2];
                }

                if (part.startswith("note:"))
                {
                    exprs.push(["note", part.substring(5).trim(), bg]);
                }
                else if (part.match(/\[|\]/))
                {
                    var tokens = part.match(/\[(.*?)\]/g);
                    exprs.push(["cluster", tokens[0], bg, tokens.slice(1)]);
                }
                else
                    exprs.push(["record", part, bg]); 
            }
            else if (part.index("-") >= 0)
            {
                var style;
                var tokens;

                if (part.index("-.-") >= 0)
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
                        return [ "odiamond", ltext = left.substring(2) ];
                    else if (left.startsWith("++")) 
                        return [ "diamond", left.substring(2) ];                  
                    else if (left.startsWith("+"))
                        return [ "odiamond", ltext = left.substring(1) ];
                    else if (left.startsWith("<") || left.endswith(">"))
                        return [ "vee", left.substring(1) ];
                    else if (left.startsWith("^")) 
                        return [ "empty", left.substring(1) ];
                    else
                        return [ "none", left ];
                }
                tokens = processLeft(left);
                lstyle = tokens[0];
                ltext = tokens[1];

                var processRight = function(right)
                {
                    if (right.startsWith("<>"))
                        return [ "odiamond", ltext = right.substring(2) ];
                    else if (right.startsWith("++")) 
                        return [ "diamond", right.substring(2) ];                  
                    else if (right.startsWith("+"))
                        return [ "odiamond", ltext = right.substring(1) ];
                    else if (right.startsWith(">"))
                        return [ "vee", right.substring(1) ];
                    else if (right.startsWith("^")) 
                        return [ "empty", right.substring(1) ];
                    else
                        return processLeft(right);
                }
                tokens = processRight(right);
                rstyle = tokens[0];
                rtext = tokens[1];
                
                exprs.push(['edge', lstyle, ltext, rstyle, rtext, style]);
            }
        }
    }
    
    function recordName(label)
    {
        return label.split("|")[0].trim();
    }

    function wordwrap(str, width, newline) 
    {
        if (!str) 
            return str; 
    
        var regex = '.{1,' + width + '}(\s|$)' + '|\S+?(\s|$)';
    
        return str.match(RegExp(regex, 'g')).join(newline);
    }    

    function yuml2dot(spec, options)
    {
        var uids = {};
        var len = 0;

        var Foo = function(label)
        {
            this.uid = label;
        };

        var exprs = yumlExpr(spec);

        if (exprs.length > 5)
            options.rankdir = 'TD'
        else
            options.rankdir = 'LR'

        var dot = "";
        dot += 'digraph G {\r\n';
        dot += '    ranksep = 1\r\n';
        dot += '    rankdir = ' + options.rankdir + '\r\n';

        for (var i=0; i<exprs.length; i++)
        {
            var elem = exprs[i];

            if (elem[0] == "cluster")
            {
                var label = elem[1]
                if (uids.hasOwnProperty(recordName(label)))
                    continue;

                var uid = 'cluster_A' + (len++).toString();
                uids[recordName(label)] = new Foo(uid);

                dot += '    subgraph ' + uid + ' {\r\n';
                dot += '        label = \"' + label + '\"\r\n';
                dot += '        fontsize = 10\r\n';

                //if options.font:
                //    dot += '        fontname = "%s"' % (options.font))

                if (elem.length>3)
                {
                    for (var j=0; j<elem.length; j++)
                        dot += '        ' + uids[node].uid + '\r\n';
                }
                dot += '    }\r\n';
            }
            else if (elem[0] == "note" || elem[0] == "record")
            {
                var label = elem[1];
                if (uids.hasOwnProperty(recordName(label)))
                    continue;
                
                var uid = 'A' + (len++).toString();
                uids[recordName(label)] = new Foo(uid);

                dot += '    node [\r\n';
                dot += '        shape = "' + elem[0] + '"\r\n';
                dot += '        height = 0.50\r\n';
                dot += '        fontsize = 10\r\n';

                // if options.font:
                //    dot += '        fontname = "%s"' % (options.font))

                dot += '        margin = "0.20,0.05"\r\n';
                dot += '    ]\r\n';
                dot += '    ' + uid + ' [\r\n';
            
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

                if (label.indexOf("|") >= 0 &&  options.rankdir == 'TD')
                    label = '{' + label + '}'

                dot += '        label = "' + label + '"\r\n';

                if (elem[2]) {
                    dot += '        style = "filled"\r\n';
                    dot += '        fillcolor = "' + elem[2] + '"\r\n';
                }
                dot += '    ]\r\n';
            }
        }

        if (expr.length == 3 && expr[1][0] == 'edge')
        {
            var elem = expr[1];
            dot += '    edge [\r\n';
            dot += '        shape = "' + elem[0] + '"\r\n';
            dot += '        dir = "both"\r\n';
            // Dashed style for notes
            if (expr[0][0] == 'note' || expr[2][0] == 'note')
                dot += '        style = "dashed"\r\n';
            else
                dot += '        style = "' + elem[5] + '"\r\n';
            dot += '        arrowtail = "' + elem[1] + '"\r\n';
            dot += '        taillabel = "' + elem[2] + '"\r\n';
            dot += '        arrowhead = "' + elem[3] + '"\r\n';
            dot += '        headlabel = "' + elem[4] + '"\r\n';
            dot += '        labeldistance = 2\r\n';
            dot += '        fontsize = 10\r\n';

            //if options.font:
            //    dot += '        fontname = "%s"' % (options.font))
            dot += '    ]\r\n';
            dot += '    ' + uids[recordName(expr[0][1])].uid + ' -> ' + uids[recordName(expr[2][1])].uid + '\r\n';
        }

        dot += '}\r\n';
        return dot;
    }

    function transform(expr, fout, options) 
    {
        dot = yuml2dot(expr, options);
        subprocess.Popen(['dot', '-Tpng'], stdin=subprocess.PIPE, stdout=fout).communicate(input=dot);
    }
}
