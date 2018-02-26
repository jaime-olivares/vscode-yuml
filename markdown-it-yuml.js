require('./scripts/yumldoc-utils.js')();

module.exports = function(md, options) 
{
    const originalFence = md.renderer.rules.fence;
    
    md.renderer.rules.fence = function(tokens, idx, _options, env, self) 
    {       
        const token = tokens[idx];
    
        if (token.type === 'fence' && token.info === 'yuml')
        {
            try {
                var html_svg = processYumlDocument(token.content);
                html_svg = `<div class="markdown-yuml">${html_svg}</div>`;
            }
            catch (err) {
                html_svg = '<pre>Error in the yUML code</pre>';
            }
            
            return html_svg;
        }

        return originalFence(tokens, idx, _options, env, self)
    }

    return md;
}
