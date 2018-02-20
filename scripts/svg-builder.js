const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = function(isDark)
{
    const NS = 'http://www.w3.org/2000/svg';
    const dom = new JSDOM("<svg xmlns=\"" + NS  +"\">\r\n</svg>");
    var document = dom.window.document;

    this.getDocument = function() 
    {
        return this.root_;
    };

    this.setDocumentSize = function(width, height) 
    {
        this.root_.setAttribute('width', width);
        this.root_.setAttribute('height', height);
    };

    this.getElementSize = function(element) 
    {
        return { x: 0, y: 0, width: 9 * element.innerHTML.length, height: 18 };
    };

    this.createRect = function(width, height) 
    {
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        rect.setAttribute('style', 'stroke-width: 1; fill: none; stroke: ' + (isDark ? 'white;' : 'black;'));
        
        return rect;
    };

    this.createText = function(message) 
    {
        var text = document.createElementNS(NS, 'text');
        text.textContent = message;
        text.setAttribute('fill', isDark ? 'white' : 'black');

        return text;
    };

    this.createPath = function(format, linetype) 
    {
        var args = arguments;
        var pathSpec = format.replace(/\{(\d+)\}/g, function(string, index) {
            return args[parseInt(index)+2];
        });

        var path = document.createElementNS(NS, 'path');
        path.setAttribute('d', pathSpec);
        path.setAttribute('style', 'stroke-width: 1; fill: none; stroke: ' + (isDark ? 'white;' : 'black;'));

        if (linetype == "dashed")
            path.setAttribute("stroke-dasharray", "7,4");

        return path;
    };

    this.createNewDocument = function()
    {
        if (typeof document === 'undefined')
            return null;

        this.root_ = document.body; 

        var filledArrow = document.createElementNS(NS, 'marker');
        var filledArrowPath = this.createPath('M0,0 6,3 0,6z', "solid");
        filledArrow.appendChild(filledArrowPath);
    
        var openArrow = document.createElementNS(NS, 'marker');
        var openArrowPath = this.createPath('M0,0 6,3 0,6', "solid");
        openArrow.appendChild(openArrowPath);

        var defs = document.createElementNS(NS, 'defs');
        defs.appendChild(filledArrow);
        defs.appendChild(openArrow);
    
        filledArrow.setAttribute('id', 'arrow-filled');
        filledArrow.setAttribute('refX', '6');
        filledArrow.setAttribute('refY', '3');
        filledArrow.setAttribute('markerWidth', '6');
        filledArrow.setAttribute('markerHeight', '6');
        filledArrow.setAttribute('orient', 'auto');

        filledArrowPath.setAttribute('style', 'stroke: none; fill: ' + (isDark ? 'white;' : 'black;'));
    
        openArrow.setAttribute('id', 'arrow-open');
        openArrow.setAttribute('refX', '6');
        openArrow.setAttribute('refY', '3');
        openArrow.setAttribute('markerWidth', '6');
        openArrow.setAttribute('markerHeight', '6');
        openArrow.setAttribute('orient', 'auto');

        openArrowPath.setAttribute('style', 'stroke-width: 1; stroke: ' + (isDark ? 'white;' : 'black;'));

        this.root_.appendChild(defs);
    }

    this.serialize = function()
    {
        return dom.serialize();
    }

    // This is temporary, until the malformed svg string issue is solved
    this.rectifySvg = function(svg, width, height)
    {
        var index = svg.indexOf("<svg ");

        svg = svg.replace("<svg ", "<svg width=\"" + width + "\" height=\"" + height + "\" ");
        svg = svg.substr(index);
        svg = svg.replace("</svg>", "");
        svg = svg.replace("</body>", "</svg>");
        svg = svg.replace("</html>", "");

        return svg;
    }
    
    this.root_ = null;
    this.createNewDocument();
}
