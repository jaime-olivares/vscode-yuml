module.exports = function()
{
    this.escape_label = function(label)
    {
        label = label.replace('{', '\\{').replace('}', '\\}');
        label = label.replace(';', '\\n');
        label = label.replace(' ', '\\ ');
        label = label.replace('<', '\\<').replace('>', '\\>');
        label = label.replace('\\n\\n', '\\n');
        return label;
    }

    this.splitYumlExpr = function(line, separators)
    {
        var word = "";
        var lastChar = null;
        var parts = [];

        for (var i=0; i<line.length; i++)
        {
            c = line[i];

            if (separators.indexOf(c) >= 0 && lastChar === null)
            {
                if (word.length > 0) {
                    parts.push(word.trim());
                    word = "";
                }

                switch (c)
                {
                    case '[':
                        lastChar = ']'; break;
                    case '(':
                        lastChar = ')'; break;
                    case '<':
                        lastChar = '>'; break;
                    case '|':
                        lastChar = '|'; break;
                    default:
                        lastChar = null; break;
                }
                word = c;
            }
            else if (c === lastChar)
            {
                lastChar =  null;
                parts.push(word.trim() + c);
                word = "";
            }
            else
            {
                word += c;
            }
        }

        if (word.length > 0)
            parts.push(word.trim());

        return parts;
    }

    this.extractBgAndNote = function(part, allowNote)
    {
        var ret = { bg: "", isNote: false };

        var bgParts = /^(.*)\{bg:([\w]*)\}$/.exec(part);
        if (bgParts != null && bgParts.length == 3)
        {
            ret.part = bgParts[1].trim();
            ret.bg = bgParts[2].trim();
        }
        else
            ret.part = part.trim();

        if (allowNote && part.startsWith("note:"))
        {
            ret.part = ret.part.substring(5).trim();
            ret.isNote = true;
        }
        return ret;
    }

    this.escape_token_escapes = function(spec)
    {
        return spec.replace('\\[', '\\u005b').replace('\\]', '\\u005d');
    }

    this.unescape_token_escapes = function(spec)
    {
        return spec.replace('\\u005b', '[').replace('\\u005d', ']');
    }

    this.recordName = function(label)
    {
        return label.split("|")[0].trim();
    }

    this.formatLabel = function(label, wrap, allowDivisors)
    {
        var lines = [label];

        if (allowDivisors && label.indexOf("|") >= 0)
            lines = label.split('|');

        for (var j=0; j<lines.length; j++)
            lines[j] = wordwrap(lines[j], wrap, "\\n");

        label = lines.join('|');

        return escape_label(label);
    }

    this.wordwrap = function(str, width, newline)
    {
        if (!str || str.length<width)
            return str;

        var p;
        for (p = width; p>0 && str[p]!=' '; p--) { }
        if (p > 0) {
            var left = str.substring(0, p);
            var right = str.substring(p+1);
            return left + newline + this.wordwrap(right, width, newline);
        }

        return str;
    }

    this.serializeDot = function(obj)
    {
        var text = "";

        for (key in obj)
        {
            if (text.length == 0)
                text = "[ ";
            else
                text += ", ";

            text += key + ' = ';
            if (typeof obj[key] === "string")
                text += '"' + obj[key] + '"';
            else
                text += obj[key];
        }

        text += " ]";
        return text;
    }
}
