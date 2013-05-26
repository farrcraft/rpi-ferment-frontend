require 'lib/view_helper'
Graph = require 'lib/graph'
ProfileController = require 'controllers/profile'

class Application extends Backbone.Marionette.Application
    graph_: {}
    config_: {}

    initialize: =>
        @graph_ = new Graph()
        @socket_ = io.connect 'http://graphite:6001'

        @on("initialize:after", (options) =>
            options = 
                application: @
            @controller_ = new ProfileController(options)
            @setupSockets()

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

    setupSockets: =>
        @socket_.on 'config', (config) =>
            @controller_.config_ = config
            @vent.trigger 'Socket:Config', config
        @socket_.on 'pv', (data) =>
            @vent.trigger 'Socket:PV'
            console.log 'new pv'
        @socket_.on 'sv', (data) =>
            @vent.trigger 'Socket:SV'
            console.log 'new sv'
        @socket_.on 'mode', (data) =>
            @vent.trigger 'Socket:Mode', config

        @socket_.emit 'config'




module.exports = new Application()
