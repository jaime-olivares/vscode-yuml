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

    this.splitYumlExpr = function(spec)
    {
//        return spec.split("\r\n");

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
}
