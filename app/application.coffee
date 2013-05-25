require 'lib/view_helper'
Graph = require 'lib/graph'
ProfileController = require 'controllers/profile'

class Application extends Backbone.Marionette.Application
    graph_: {} 

    initialize: =>
        @graph_ = new Graph()

        @on("initialize:after", (options) =>
            options = 
                application: @
            @controller_ = new ProfileController(options)

            Backbone.history.start();
            # Freeze the object
            Object.freeze? this
        )

        @on('start', () =>
        )

        @addInitializer( (options) =>

            AppLayout = require 'views/AppLayout'
            @layout = new AppLayout()
            @layout.render()
        )

        @addInitializer((options) =>
            # Instantiate the router
            Router = require 'lib/router'
            @router = new Router()
        )

        @start()



module.exports = new Application()
