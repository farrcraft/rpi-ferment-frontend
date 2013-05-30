template = require './templates/heater'
HeaterModel = require 'models/heaterModel'

module.exports = class HeaterView extends Backbone.Marionette.ItemView
	template: template
	events:
		'click .heaterOverride': 'heaterOverride'
	ui:
		heaterLight: '.heaterLight'
		heaterState: '.heaterState'

	initialize: (options) =>
		@fermenterId = options.fermenterId
		@app = options.application
		@graphModel = options.graphModel
		modelOptions = 
			fermenterId: @fermenterId
			gpio: options.gpio
		@model = new HeaterModel modelOptions
		return

	heaterOverride: (e) =>
		oldState = @model.get 'state'
		newState = 'on'
		newClass = 'green'
		oldClass = 'red'
		value = true
		if oldState is 'on'
			newState = 'off'
			newClass = 'red'
			oldClass = 'green'
			value = false

		profile = @graphModel.get 'profile'
		overrides = profile.get 'overrides'
		override = 
			action: newState
			time: new Date()
		overrides.push override
		profile.set 'overrides', overrides
		profile.save()

		@model.set 'state', newState
		@ui.heaterLight.removeClass oldClass
		@ui.heaterLight.addClass newClass
		@ui.heaterState.text 'Heater ' + newState
		@app.controller_.socket_.emit 'setgpio', @fermenterId, value
		false
