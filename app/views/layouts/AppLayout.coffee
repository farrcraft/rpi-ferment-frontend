# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

ModalRegion = require 'views/ModalRegion'
template 	= require 'views/templates/layouts/appLayout'
NavView 	= require 'views/NavView'

module.exports = class AppLayout extends Backbone.Marionette.Layout
	template: template
	el: "body"

	regions:
		nav: "#top-nav"
		content: "#content"
		alert: "#alert-box"
		modal: ModalRegion

	initialize: (options) =>
		@app = options.application

	onRender: () =>
		options = 
			application: @app
		view = new NavView options
		@nav.show view
