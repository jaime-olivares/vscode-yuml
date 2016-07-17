# Version 2.0 project

## Problem description
Currently, vscode-yuml depends on the rendering service of yuml.me, 
making it unusable in offline scenarios and vulnerable to future changes in that service.
 
## Overall plan
The overall plan has the following objectives:
+ Replace the invocation to yuml.me, by replacing it with local functionalities,  
written in pure javascript for eliminating dependencies that complicates the installation across OSs.
+ Although yuml.me is not open source, there are alternatives like [scruffy](https://github.com/aivarsk/scruffy),
for composing the diagrams with high compatibility with the YUML markup language. As this library is written in Python, 
it will be necessary a translation to Javascript.
+ [Dot/Graphviz](http://www.graphviz.org/) has been identified as the rendering engine for *scruffy*, 
but is has big dependencies on the operating system and other third party libraries. 
[viz.js](https://github.com/mdaines/viz.js) has been identified as a pure-javascript replacement for *GraphViz*, 
so it can be integrated with the Javascript version of *scruffy*.

## Contributions
Contributions are welcomed for the following tasks:
+ Translation of *scruffy* to Javascript
+ Integration of *scruffy* with *viz.js*
+ Overall testing and generation of complex UML samples for demo
