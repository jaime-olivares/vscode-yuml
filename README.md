# yUML extension
yUML extension for Visual Studio Code. Allows the creation of UML diagrams based on the [yUML Syntax](http://yuml.me/).

## Features
* Syntax highlighting of *.yuml* files
* Currently, the following diagram types are supported: 
  + Class
  + Activity 
  + Use-case
  + State
* Viewing of yUML diagrams after each file save
* Additional directives for altering diagram type and orientation
* Embedded rendering engine. No need to call an external web service.

![yUML extension screenshots](images/vscode-yuml.gif)

## Directives
Directives are not part of the yUML syntax, but are required for modifying the rendering behavior.
The directives shall be placed at the beginning of the file, before any yuml statement.
The *type* directive is the unique mandatory one.

This is the list of valid directives:

+ **type**: <u>Mandatory</u>, specifies the diagram type.    
  Valid values: *class, activity, usecase, state*  
  Example: `// {type:class}`

+ **direction**: Optional, specifies the drawing direction for certain diagram types.  
  Valid values: *leftToRight, rightToLeft, topDown*  
  Default: `topDown`  
  Example: `// {direction:leftToRight}`

+ **generate**: Optional, indicates if a *.svg* file shall be generated on each save. The image file is saved in the same folder as the .yuml file.  
  Valid values: *true, false*  
  Default: `false`  
  Example: `// {generate:true}`

## Invocation methods
Once a *.yuml* file is open, the viewer window can be invoked in two ways:
* By opening the command pallete and [partially] typing: `view yuml diagram`
* By right clicking on the document's title tab and selecting the option: *View yUML Diagram*

## Extension Settings
No settings yet.

## Dependencies
This extension only depends on [viz.js](https://github.com/mdaines/viz.js), which is installed automatically.
No other product or library is needed and thus the installation process is quietly simple.

## Issue reporting
If you have experience developing Visual Studio Code extensions, please propose a detailed solution for any reported issue.

## Roadmap
* Completion of other diagram types: sequence, components, deployment, etc.
* Diagram nesting
* Better syntax highlighting
* Intellisense for language syntax
* Intellisense for colors
* Mimic the editor's dark or light theme
* Wiki for the yUML syntax

## Credits
* The syntax highlighting has been taken from [sublime-yuml](https://github.com/cluther/sublime-yuml) by Chet Luther
* Syntax and examples taken from [yuml.me](http://yuml.me/diagram/scruffy/class/samples)
* This extension uses a Javascript port of [Dot/Graphviz](http://www.graphviz.org/) called [viz.js](https://github.com/mdaines/viz.js)
* The yuml-to-dot translator is loosy based on a Python project called [scruffy](https://github.com/aivarsk/scruffy)
