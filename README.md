# yUML extension
yUML extension for Visual Studio Code. Allows the creation of offline UML diagrams based on the [yUML Syntax](http://yuml.me/).

[![](https://vsmarketplacebadge.apphb.com/version/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)
[![](https://vsmarketplacebadge.apphb.com/installs/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)
[![](https://vsmarketplacebadge.apphb.com/rating/JaimeOlivares.yuml.svg)](https://marketplace.visualstudio.com/items?itemName=JaimeOlivares.yuml)

## Features
* Syntax highlighting of *.yuml* files
* Currently, the following diagram types are supported: 
  + Class
  + Activity 
  + Use-case
  + State
  + Deployment
  + Package
  + `[new]` Sequence (experimental)
* Update of yUML diagrams after each file save
* Additional directives for altering diagram type and orientation
* Embedded rendering engine: **No need to call an external web service**
* Code snippets with samples of each diagram

![yUML extension screenshots](images/vscode-yuml.gif)

## yUML syntax
Please refer to the [wiki page](https://github.com/jaime-olivares/vscode-yuml/wiki)

## Invocation methods
Once a *.yuml* file is open, the viewer window can be invoked in two ways:
* By opening the command pallete and [partially] typing: `view yuml diagram` (see the screenshot above)
* By clicking the preview icon in the editor title area (see below)

![title icon](images/title_icon.png)

## Snippets
There is a snippet for each diagram type. Just start typing one of the available diagram types: 
`class`, `activity`, `usecase`, `state` or `deployment`, `package`, `sequence` 
and a full example will be pasted into the yuml file.

![yUML snippet screenshot](images/snippet.png)

## Top bar
A newly added topbar (see below) will show some useful links when hovered,
for accessing the wiki page, writing a review, reporting bugs and requesting new features.

![yUML snippet screenshot](images/top_bar.png)

## Extension Settings
No settings yet.

## Dependencies
This extension has not dependencies.
It contains a frozen version of viz-lite.js (see [viz.js](https://github.com/mdaines/viz.js)). Newest versions have a bug that caused [issue #23](https://github.com/jaime-olivares/vscode-yuml/issues/23).
No other product or library is needed and thus the installation process is quietly simple across platforms.

## Issue reporting
If you have experience developing Visual Studio Code extensions, please propose a detailed solution for any reported issue or feature request.

## Credits
* Syntax and some examples taken from [yuml.me](http://yuml.me/diagram/scruffy/class/samples)
* This extension uses a Javascript port of [Dot/Graphviz](http://www.graphviz.org/) called [viz.js](https://github.com/mdaines/viz.js)
* The yuml-to-dot translator is loosely based on a Python project called [scruffy](https://github.com/aivarsk/scruffy)
* The new sequence diagram is based on [this github fork](https://github.com/sharvil/node-sequence-diagram)
