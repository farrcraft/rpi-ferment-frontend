# rpi-ferment-frontend
This is the frontend application for the [rpi-ferment](https://github.com/sigsegv42/rpi-ferment) server.  It includes a lightweight server-side application using node-static to serve the static application assets. 

The client-side application is built using [Brunch](http://brunch.io/) with [MarionetteJS](http://marionettejs.com/).

Graphene is included for rendering graph data from the graphite server.

## Features



## Dependencies

- Node.js
- node-static
- CoffeeScript
- Brunch

For runtime all that is required is a working node installation and the node-static module.  

If you want to make any changes, you'll also need CoffeeScript and Brunch installed along with their own dependencies.  Running _npm install_ in the root project directory will automatically install all of the dependencies listed in the _package.json_ file.


## 3rd Party Application Components

The application is built using a host of 3rd party libraries.  Most of these are already directly included in the repository.

- [Brunch](http://brunch.io/)
- [Backbone.js](http://backbonejs.org/)
- [MarionetteJS](http://marionettejs.com/)
- [Twitter Bootstrap](http://twitter.github.io/bootstrap/)
- [Bootstrap Spin Edit](https://github.com/geersch/bootstrap-spinedit)
- [Graphene](https://github.com/jondot/graphene)
- [Socket.IO](http://socket.io/)
- [Brunch with Marionette skeleton](https://github.com/SimbCo/brunch-with-marionette)
- [D3.js](http://d3js.org/)
- [Handlebars](http://handlebarsjs.com/)
- [Moment.js](http://momentjs.com/)
- [Handlebars Helpers](https://gist.github.com/elidupuis/1468937)
- [node-static](https://github.com/cloudhead/node-static)
