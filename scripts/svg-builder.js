const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = function(stylesheet)
{
    const NS = 'http://www.w3.org/2000/svg';
    this.dom = new JSDOM("<svg xmlns=\"" + NS  +"\">\r\n</svg>");
    var document = this.dom.window.document;

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
        return { x: 0, y: 0, width: 9*element.innerHTML.length, height: 18 };
    };

    this.group = function() 
    {
        var group = document.createElementNS(NS, 'g');
        for (var i = 0; i < arguments.length; ++i) {
        group.appendChild(arguments[i]);
        }
        return group;
    };

    this.rect = function(width, height) 
    {
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        return rect;
    };

    this.text = function(message) 
    {
        var text = document.createElementNS(NS, 'text');
        text.textContent = message;
        return text;
    };

    this.path = function(format) 
    {
        var args = arguments;
        var pathSpec = format.replace(/\{(\d+)\}/g, function(string, index) {
            return args[++index];
        });

        var path = document.createElementNS(NS, 'path');
        path.setAttribute('d', pathSpec);

        return path;
    };

    this.createNewDocument = function(stylesheet)
    {
        if (typeof document === 'undefined')
            return null;

        this.root_ = document.body; // document.createElementNS(NS, 'svg');

        var defs = document.createElementNS(NS, 'defs');
    
        var filledArrow = document.createElementNS(NS, 'marker');
        var filledArrowPath = this.path('M0,0 5,2.5 0,5z');
    
        var openArrow = document.createElementNS(NS, 'marker');
        var openArrowPath = this.path('M0,0 5,2.5 0,5');
    
        filledArrow.setAttribute('id', 'arrow-filled');
        filledArrow.setAttribute('refX', '5');
        filledArrow.setAttribute('refY', '2.5');
        filledArrow.setAttribute('markerWidth', '5');
        filledArrow.setAttribute('markerHeight', '5');
        filledArrow.setAttribute('orient', 'auto');
        filledArrowPath.setAttribute('style', 'stroke: none; fill: #000');
    
        openArrow.setAttribute('id', 'arrow-open');
        openArrow.setAttribute('refX', '5');
        openArrow.setAttribute('refY', '2.5');
        openArrow.setAttribute('markerWidth', '5');
        openArrow.setAttribute('markerHeight', '5');
        openArrow.setAttribute('orient', 'auto');
        openArrowPath.setAttribute('style', 'stroke-width: 1');
    
        // this.root_.appendChild(stylesheet);
        this.root_.appendChild(defs);
        defs.appendChild(filledArrow);
        filledArrow.appendChild(filledArrowPath);
        defs.appendChild(openArrow);
        openArrow.appendChild(openArrowPath);
    }

    this.root_ = null;
    this.createNewDocument(stylesheet);
}
