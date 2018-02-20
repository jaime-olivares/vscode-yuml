require('./yuml2dot-utils.js')();
const renderer = require('./sequence-renderer.js');

/*
Unofficial syntax, based on a proposal specified in the Scruffy project, plus local additions

Object     [Patron]
Message    [Patron]order food>[Waiter]
Response   [Waiter]serve wine.>[Patron]
Note       [Actor]-[note: a note message]
Comment    // Comments

Asynchronous message            [Patron]order food>>[Waiter]
Open activation box at source   [Source](message>[Dest]
Open activation box at dest     [Source]message>([Dest]
Close activation at dest        [Source]message>)[Dest]
Close activation at source      [Source])message>[Dest]
Cancel activation box           [Source])X
*/

module.exports = function(specLines, options)
{
    var actors  = [];
    var signals = [];

    function newActor(name, label) 
    {
        return { name: name, label: label, index: actors.length };
    }

    function newSignal(actorA, linetype, arrowtype, actorB, message) 
    {
        return { type: "Signal", actorA: actorA, actorB: actorB, linetype: linetype, arrowtype: arrowtype, message: message }
    }
      
    function newNote(actor, placement, message) 
    {
        return { type: "Note", actor: actor, placement: placement, message: message }
    }

    function parseYumlExpr(specLine)
    {
        var exprs = [];
        var parts = this.splitYumlExpr(specLine, "[");

        for (var i=0; i<parts.length; i++)
        {
            var part = parts[i].trim();
            if (part.length == 0)
                continue;

            if (part.match(/^\[.*\]$/)) // object
            {
                part = part.substr(1, part.length-2);
                //var ret = extractBgAndNote(part, true);
                //exprs.push([ret.isNote ? "note" : "record", ret.part, ret.bg, ret.fontcolor]);
                exprs.push(["object", part]);
            }
            else if (part.indexOf(">") >= 0)  // message
            {
                var style = (part.indexOf(".>") >= 0) ? "dashed" : "solid";
                style = (part.indexOf(">>") >= 0) ? "async" : style;

                var prefix = "";
                if (part.startsWith("(") || part.startsWith(")"))
                {
                    prefix = part.substr(0, 1);
                    part = part.substr(1);
                }

                var message = "";
                var pos = part.match(/[\.|>]{0,1}>[\(|\)]{0,1}$/);
                if (pos == null)
                {
                    throw("Invalid expression");
                }
                else if (pos.index > 0)
                {
                    message = part.substr(0, pos.index);
                    part = part.substr(pos.index);
                }

                var suffix = "";
                if (part.endsWith("(") || part.endsWith(")"))
                {
                    suffix = part.charAt(part.length - 1);
                    part = part.substr(0, part.length - 1);
                }

                exprs.push(["message", prefix, message, style, suffix]);
            }
            else
                throw("Invalid expression");
        }

        return exprs;
    }

    function composeSvg(specLines, options)
    {
        var uids = {};
        var index = 0;
        
        for (var i=0; i<specLines.length; i++)
        {
            var elem = parseYumlExpr(specLines[i]);

            for (var k=0; k<elem.length; k++)
            {
                if (elem[k][0] == "object")
                {
                    var label = elem[k][1];
                    var rn = recordName(label);
                    if (uids.hasOwnProperty(rn))
                        continue;

                    //var uid = 'A' + (uids.length+1).toString();
                    label = formatLabel(label, 20, true);
                    var actor = newActor(rn, label);
                    uids[rn] = actor;

                    actors.push(actor);
                }
            }

            if (elem.length == 3 && elem[1][0] == 'message')  // what if self or cancel?
            {
                var message = elem[1][2];
                var style = elem[1][3];
                var actorA = uids[recordName(elem[0][1])];
                var actorB = uids[recordName(elem[2][1])];

                switch (style)
                {
                    case "dashed":
                        signals.push(newSignal(actorA, "dashed", "arrow-filled", actorB, message));                    
                        break;
                    case "solid":
                        signals.push(newSignal(actorA, "solid", "arrow-filled", actorB, message));                    
                        break;
                    case "async":
                        signals.push(newSignal(actorA, "solid", "arrow-open", actorB, message));                                    
                        break;
                }
            }            
        }

        var r = new renderer(actors, signals, true);
        var svg = r.svg_.serialize();
        var svgDark = r.svg_.rectifySvg(svg, r.width, r.height);

        r = new renderer(actors, signals, false);
        svg = r.svg_.serialize();
        var svgLight = r.svg_.rectifySvg(svg, r.width, r.height);        

        return [svgLight, svgDark];
    }

    return composeSvg(specLines, options);
}
