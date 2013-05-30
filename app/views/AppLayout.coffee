# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

ModalRegion = require 'views/ModalRegion'
template 	= require 'views/templates/appLayout'

module.exports = class AppLayout extends Backbone.Marionette.Layout
	template: template
	el: "body"

	regions:
		nav: "#nav"
		content: "#content"
		modal: ModalRegion

