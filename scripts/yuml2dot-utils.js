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

    this.extractBgColor = function(part)
    {
        var bgParts = /^(.*)\{bg:([\w]*)\}$/.exec(part);
        if (bgParts != null && bgParts.length == 3)
        {
            return { part: bgParts[1], bg: bgParts[2] }
        }
        return { part: part, bg: ""}
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

    this.wordwrap = function(str, width, newline)
    {
        if (!str)
            return str;

        var regex = '.{1,' + width + '}(\s|$)' + '|\S+?(\s|$)';

        return str.match(RegExp(regex, 'g')).join(newline);
    }

    this.serialize = function(obj)
    {
        var text = "";

        for (key in obj)
        {
            if (text.length == 0)
                text = "[ ";
            else
                text += ", ";

            text += key + ' = ';
            if (typeof obj[key] === "number")
                text += obj[key];
            else
                text += '"' + obj[key] + '"';
        }

        text += " ]";
        return text;
    }
}
