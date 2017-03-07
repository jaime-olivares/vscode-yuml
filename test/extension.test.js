const assert = require('assert');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
require('../scripts/yumldoc-utils.js')();

suite("Extension Tests", function() 
{
    test("Creation of svg", function() 
    {
        var yuml = fs.readFileSync(path.join(__dirname, "../docs/yuml_activity.yuml"), {encoding:"utf8", flag:"r"});
        
        var diagram = processYumlDocument(yuml, "dummy.svg", false);

        assert.ok(diagram);
        assert.notEqual(diagram.indexOf("<!DOCTYPE svg"), -1);
    });
});
