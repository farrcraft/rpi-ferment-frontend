# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template = require './templates/nav'

module.exports = class NavView extends Backbone.Marionette.ItemView
	template: template

	initialize: (options) =>
		@model = new Backbone.Model()
		@app = options.application
		if @app.session.authenticated() is true
			@model.set 'loggedIn', true
		sessionChangeHandler = (session) =>
			@syncModel()
			@render()
		@app.session.on 'change:auth', sessionChangeHandler

		@app.vent.on 'Sensor:PV', (data) =>
			if data.sensor is "ambient"
				display = data.pv.toFixed 2
				display = display + '&deg;'
				$('#ambient-display').html display

	syncModel: ->
		@model.set 'loggedIn', @app.session.authenticated()
