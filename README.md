# rpi-ferment-frontend
This is the frontend application for the [rpi-ferment](https://github.com/sigsegv42/rpi-ferment) server.  It includes a lightweight server-side application using node-static to serve the static application assets. 

The client-side application is built using [Brunch](http://brunch.io/) with [MarionetteJS](http://marionettejs.com/).

Graphene is included for rendering graph data from the graphite server.

## Features

The frontend is used to setup fermentation profiles and monitoring temperature changes in the system.  There are also controls for manually overriding the temperature controller settings.

### Profile Properties

Fermentation profiles are defined by how they can control the temperature along with a series of steps. 

#### control

The control mode can be *none*, *auto*, *manual*, or *pid*.  

##### none

When set to **none**, the *gpio* and *sv* sensor parameters will be ignored and no control signals will be generated.

##### manual

Manual mode is similar to the *none* setting except that manual override settings will function.

##### auto

Auto control mode sends a control signal to turn on the *gpio* channel when the temperature sensor reading is below the *sv* temperature.  When the temperature reading is at or above the *sv* value then a control signal is sent to turn off the configured *gpio* channel.

##### pid

PID control mode is similar to auto mode except that it uses a PID controller algorithm to generate the control signals.

### Fermentation Step Properties

Each step within a fermentation profile details a temperature to maintain and the duration it should last.

#### name

A descriptive label that describes the step, e.g. "Primary Fermentation" or "Diacetyl Rest".

#### duration

An integer specifying how long the step should run for.

#### unit

The unit that the duration is specified in can be either *days* or *hours*.

#### start_temperature

The initial temperature that should be maintained during the duration of the step.

#### end_temperature

The final temperature that should be reached at the end of the step.  For most steps where you normally want to maintain a constant temperature over the duration of the step this would be the same temperature as the start_temperature value.  There maybe some instances where you would want to gradually increase or decrease the temperature over a period of time without having to create a large number of distinct steps.  For instance, if you're lagering you may want to define a "Drop to lagering temperature" step that slowly decreases the temperature over a period of time.  Another common scenario would be slowly raising the temperature to affect yeast ester production.  In either case, the current SV will be an interpolated value between the start and end temperatures based on the current time in the overall step duration.

#### order

Each step has an integer number indicating its position in the sequence of all profile steps.  The first step in a profile always starts with *1*. 

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
