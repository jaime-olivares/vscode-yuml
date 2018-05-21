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
  + Sequence  
  See the corresponding [github project](https://github.com/jaime-olivares/yuml-diagram) for the updated features
* Update of yUML diagrams after each file save
* Additional directives for altering diagram type and orientation
* Embedded rendering engine: **No need to call an external web service**
* Automatic sensing of light and dark themes
* Code snippets with samples of each diagram
* Integrated Markdown support

![yUML extension screenshots](images/vscode-yuml.gif)

## yUML syntax
Please refer to the [wiki page](https://github.com/jaime-olivares/yuml-diagram/wiki)

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

## Markdown support
yUML code can now be embedded into markdown documents by using the fencing syntax, as shown:

    This is a simple example of a **yUML** sequence diagram: 
    
    ```yuml
    // {type: sequence}
    [A]>[B]
    ```
The yUML diagram will be directly rendered in the markdown preview window.

## Top bar
A topbar will show some useful links when hovered (see below),
for accessing the wiki page, writing a review, reporting bugs and requesting new features.

![yUML snippet screenshot](images/top_bar.png)

## Extension Settings
No settings yet.

## Issue reporting
If you have experience developing Visual Studio Code extensions, please propose a detailed solution for any reported issue or feature request.

For issues related to the yUML syntax, please post your issue in the corresponding [github project](https://github.com/jaime-olivares/yuml-diagram/issues)

## Contributing
For pull requests, please read [CONTRIBUTING.md](https://github.com/jaime-olivares/vscode-yuml/blob/master/CONTRIBUTING.md)
