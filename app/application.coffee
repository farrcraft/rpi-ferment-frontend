# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

require 'lib/view_helper'
Graph               = require 'lib/graph'
ProfileController   = require 'controllers/profile'
AppLayout           = require 'views/layouts/AppLayout'
Router 				= require 'lib/router'
Session				= require 'models/sessionModel'

class Application extends Backbone.Marionette.Application
	graph_: null
	config_: null
	controller_: null

	initialize: =>
		@session = new Session()
		window.session = @session
		@graph_ = new Graph()

		@on("initialize:after", (options) =>
			options = 
				application: @
			@controller_ = new ProfileController options
			@controller_.setupSockets()

			Backbone.history.start();
			# Freeze the object
			Object.freeze? this
		)

		@on('start', () =>
		)

		@addInitializer( (options) =>

			options =
				application: @
			@layout = new AppLayout options
			@layout.render()
		)

		@addInitializer((options) =>
			options = 
				application: @
			# Instantiate the router
			@router = new Router options
		)

		@start()

	# redirect app to a different route
	redirect: (route) ->
		window.location.hash = route

	# display an alert message in the app
	alert: (type, msg) ->
		AlertView = require 'views/AlertView'
		options = 
			message: msg
			type: type
		view = new AlertView options
		@layout.alert.show view


module.exports = new Application()
