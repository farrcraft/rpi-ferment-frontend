template 	= require './templates/sample'
SampleModel = require 'models/sampleModel'

module.exports = class SampleView extends Backbone.Marionette.ItemView
	template: template

	ui:
		currentSample: '.currentSample'

	events:
		'click .sampleRate': 'changeSampleRate'

	initialize: (options) ->
		@fermenterId = options.fermenterId
		modelOptions = 
			fermenterId: @fermenterId
		@model = new SampleModel modelOptions
		return

	changeSampleRate: (e) =>
		newRate = $(e.target).text()
		unit = newRate.substr newRate.length-1, 1
		value = newRate.substring 0, newRate.indexOf unit
		console.log 'set rate to ' + value + ' in unit ' + unit
		@model.set 'current', value
		@model.set 'unit', unit
		@ui.currentSample.text newRate
		false