# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template = require './templates/home'

module.exports = class HomeView extends Backbone.Marionette.ItemView
	id: 'home-view'
	template: template
	
