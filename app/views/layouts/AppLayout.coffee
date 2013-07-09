# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

ModalRegion = require 'views/ModalRegion'
template 	= require 'views/templates/layouts/appLayout'

module.exports = class AppLayout extends Backbone.Marionette.Layout
	template: template
	el: "body"

	regions:
		nav: "#nav"
		content: "#content"
		modal: ModalRegion

	initialize: (options) =>
		@app = options.application
		@app.vent.on 'Sensor:PV', (data) =>
			if data.sensor is "ambient"
				display = data.pv.toFixed 2
				display = display + '&deg;'
				$('#ambient-display').html display
