template = require './templates/heater'
HeaterModel = require 'models/heaterModel'

module.exports = class HeaterView extends Backbone.Marionette.ItemView
	template: template
	events:
		'click .heaterOverride': 'heaterOverride'
	ui:
		heaterLight: '.heaterLight'
		heaterState: '.heaterState'

	initialize: (options) ->
		@fermenterId = options.fermenterId
		modelOptions = 
			fermenterId: @fermenterId
		@model = new HeaterModel modelOptions
		return

	heaterOverride: (e) ->
		console.log 'switching heater state for ' + @fermenterId
		oldState = @model.get 'state'
		console.log 'old state was ' + oldState
		newState = 'on'
		newClass = 'green'
		oldClass = 'red'
		if oldState is 'on'
			newState = 'off'
			newClass = 'red'
			oldClass = 'green'
		@model.set 'state', newState
		@ui.heaterLight.removeClass oldClass
		@ui.heaterLight.addClass newClass
		@ui.heaterState.text 'Heater ' + newState
		false
