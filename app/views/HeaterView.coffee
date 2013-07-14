# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template 	= require './templates/heater'
HeaterModel = require 'models/heaterModel'

# View for displaying heater indicator and heater override controls
module.exports = class HeaterView extends Backbone.Marionette.ItemView
	fermenterId: null
	app: null
	graphModel: null

	template: template
	events:
		'click .heaterOverride': 'heaterOverride'
		'click .overrideResume': 'overrideResume'
	ui:
		heaterLight: '.heaterLight'
		heaterState: '.heaterState'
		overrideResume: '.overrideResume'

	initialize: (options) =>
		@fermenterId = options.fermenterId
		@app = options.application
		@graphModel = options.graphModel
		modelOptions = 
			fermenterId: @fermenterId
			gpio: options.gpio
		@model = new HeaterModel modelOptions
		@app.vent.on 'Heater:State', (data) =>
			if data.sensor is @fermenterId
				@setHeaterState data.state
		@app.vent.on 'Heater:Changed', (data) =>
			if data.sensor is @fermenterId
				@setHeaterState data.state
		# request current GPIO state
		@app.controller_.socket_.emit 'getgpio', @fermenterId
		return

	onRender: () ->
		profile = @graphModel.get 'profile'
		if profile is undefined or profile is null
			@ui.overrideResume.hide()
			return
		overrides = profile.get 'overrides'
		if overrides.length > 0 and overrides[overrides.length - 1].action is 'resume'
			@ui.overrideResume.hide()
		else
			@ui.overrideResume.show()


	# Update the heater indicator and control UI 
	# The profile and actual gpio state on the server are not modified
	setHeaterState: (state) =>
		newState = 'on'
		newClass = 'green'
		oldClass = 'red'
		if state isnt true
			newState = 'off'
			newClass = 'red'
			oldClass = 'green'
		@model.set 'state', newState
		@ui.heaterLight.removeClass oldClass
		@ui.heaterLight.addClass newClass
		@ui.heaterState.text 'Heater ' + newState

	# Override the current heater state
	# The current state is toggled, a new override entry is added to the server profile,
	# the gpio state is toggled, and the UI is updated
	heaterOverride: (e) =>
		oldState = @model.get 'state'
		newState = 'on'
		value = true
		if oldState is 'on'
			newState = 'off'
			value = false

		profile = @graphModel.get 'profile'
		if profile isnt undefined and profile isnt null
			overrides = profile.get 'overrides'
			override = 
				action: newState
				time: new Date()
			overrides.push override
			profile.set 'overrides', overrides
			profile.save()

		@setHeaterState value
		token = @app.session.get 'access_token'
		@app.controller_.socket_.emit 'setgpio', @fermenterId, value, token
		false

	# Resume the current profile step
	# A new override entry is saved to the current server profile
	# The UI update will be triggered from a separate socket.io event
	overrideResume: (e) =>
		profile = @graphModel.get 'profile'
		overrides = profile.get 'overrides'
		override = 
			action: 'resume'
			time: new Date()
		overrides.push override
		profile.set 'overrides', overrides
		profile.save()
		@ui.overrideResume.hide()
		false
