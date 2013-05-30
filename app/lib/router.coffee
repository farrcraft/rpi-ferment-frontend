# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

HomeLayout 		= require 'views/HomeLayout'
ProfilesLayout 	= require 'views/ProfilesLayout'

module.exports = class Router extends Backbone.Router

	routes:
		'': 'home'
		'profiles': 'profiles'

	home: =>
		options =
			application: window.RpiApp
		home = new HomeLayout options
		window.RpiApp.layout.content.close()
		window.RpiApp.layout.content.show home
		if window.RpiApp.controller_.config_ isnt undefined
			home.createCollection window.RpiApp.controller_.config_

	profiles: =>
		options = 
			application: window.RpiApp
		profiles = new ProfilesLayout options
		window.RpiApp.layout.content.close()
		window.RpiApp.layout.content.show profiles
		profiles.showProfiles()

	profile: (id) =>
		