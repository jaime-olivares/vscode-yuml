# yUML extension
yUML extension for Visual Studio Code. Enables the use of [yuml.me](http://yuml.me/) tools.

## Features
* Syntax highlighting of *.yuml* files
* Viewing of yUML diagrams after each file save
* Viewing directives for altering diagram type, size and orientation

<img src="./images/vscode-yuml.gif" height=480 />

## Directives
Directives are not part of the yUML syntax, but are required for modifying the drawing behavior of the rendering service.
The *type* directive is the unique mandatory one.

All comment or directive lines are not posted to the rendering service. This is the list of valid directives

+ **type**: <u>Mandatory</u>, specifies the diagram type  
Valid values: class, activity, usecase  
Example: `// {type:class}`

+ **style**: Optional, specifies the diagram style  
Valid values: boring, plain, scruffy  
Default: `plain`  
Example: `// {style:scruffy}` 

+ **size**: Optional, specifies the size of the diagram elements  
Valid values: huge, big, normal, small, tiny  
Default: `normal`  
Example: `// {size:big}` 

+ **direction**: Optional, specifies the drawing direction for certain diagram  
Valid values: leftToRight, rightToLeft, topDown  
Default: `leftToRight`  
Example: `// {direction:topDown}`

## Invocation methods
Once a *.yuml* file is open, the viewer window can be invoked in two ways:
* By opening the command pallete and [partially] typing: `view yuml diagram`
* By right clicking on the document's title tab and selecting the option: *View yUML Diagram*

## Extension Settings
No settings yet

## Dependencies
This extension doesn't have any dependency. However, it invokes the diagraming service at [yuml.me](http://yuml.me/)

## Issue reporting
This extension is only a wrapper for the rendering service provided by [yuml.me](http://yuml.me/).
You can find many examples at their [site](http://yuml.me/diagram/scruffy/class/samples).

Please do not create issues related to diagram types, elements, styles or lack of syntax documentation. 
Rather go directly to their [Forum](https://groups.google.com/forum/#!forum/yuml) page.

If you have experience developing Visual Studio Code extensions, please propose a detailed solution for any reported issue.

## Roadmap
* Intellisense for language syntax
* Intellisense for colors

## Credits
* The syntax highlighting has been taken from [sublime-yuml](https://github.com/cluther/sublime-yuml) by Chet Luther
* Examples taken from [yuml.me](http://yuml.me/diagram/scruffy/class/samples)
