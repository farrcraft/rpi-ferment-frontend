# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

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
		@layout = options.layout
		modelOptions = 
			fermenterId: @fermenterId
		@model = new SampleModel modelOptions
		return

	changeSampleRate: (e) =>
		newRate = $(e.target).text()
		unit = newRate.substr newRate.length-1, 1
		value = newRate.substring 0, newRate.indexOf unit
		@model.set 'current', value
		@model.set 'unit', unit
		@ui.currentSample.text newRate
		@layout.model.set 'sample', value
		@layout.renderGraph()
		false
