# yUML extension
yUML extension for Visual Studio Code. Allows the creation of UML diagrams based on [yUML Syntax](http://yuml.me/).

[![](https://vsmarketplacebadge.apphb.com/version/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)
[![](https://vsmarketplacebadge.apphb.com/installs/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)
[![](https://vsmarketplacebadge.apphb.com/rating/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)

## Features
* Syntax highlighting of *.yuml* files
* Viewing of yUML diagrams after each file save
* Additional directives for altering diagram type, size and orientation

![yUML extension screenshots](images/vscode-yuml.gif)

## Directives
Directives are not part of the yUML syntax, but are required for modifying the drawing behavior of the rendering.
The directives shall be placed at the beginning of the file, before any yuml statement.
The *type* directive is the unique mandatory one.

This is the list of valid directives:

+ **type**: <u>Mandatory</u>, specifies the diagram type.  
  Valid values: *class, activity, usecase*  
  Example: `// {type:class}`

+ **style**: Optional, specifies the diagram style. The 'boring' style produces smaller image files.  
  Valid values: *boring, plain, scruffy*  
  Default: `plain`  
  Example: `// {style:scruffy}`

+ **size**: Optional, specifies the size of the diagram elements. Notice that the diagram viewer will scale the image to fit the window.  
  Valid values: *huge, big, normal, small, tiny*  
  Default: `normal`  
  Example: `// {size:big}` 

+ **direction**: Optional, specifies the drawing direction for certain diagram types.  
  Valid values: *leftToRight, rightToLeft, topDown*  
  Default: `leftToRight`  
  Example: `// {direction:topDown}`

+ **generate**: Optional, indicates if a *.png* file shall be generated on each save, sparing some calls to the *yuml.me* web service when reopening. The image file is saved in the same folder as the .yuml file.  
  Valid values: *true, false*  
  Default: `false`  
  Example: `// {generate:true}`

## Invocation methods
Once a *.yuml* file is open, the viewer window can be invoked in two ways:
* By opening the command pallete and [partially] typing: `view yuml diagram`
* By right clicking on the document's title tab and selecting the option: *View yUML Diagram*

## Extension Settings
No settings yet

## Dependencies
This extension doesn't have any dependency. It is a pure javascript application.

## Issue reporting
If you have experience developing Visual Studio Code extensions, please propose a detailed solution for any reported issue.

## Roadmap
* Better syntax highlighting
* Intellisense for language syntax
* Intellisense for colors

## Credits
* ~~The syntax highlighting has been taken from [sublime-yuml](https://github.com/cluther/sublime-yuml) by Chet Luther~~
* ~~Examples taken from [yuml.me](http://yuml.me/diagram/scruffy/class/samples)~~
