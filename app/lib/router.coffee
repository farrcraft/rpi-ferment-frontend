# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

HomeLayout 			= require 'views/HomeLayout'
ProfilesLayout 		= require 'views/ProfilesLayout'
ProfileDetailView 	= require 'views/ProfileDetailView'
ProfileModel		= require 'models/profileModel'

module.exports = class Router extends Backbone.Router

	routes:
		'': 'home'
		'profiles': 'profiles'
		'profile/:id': 'profile'

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
		model = new ProfileModel { _id: id }
		fetchSuccessHandler = (profile, res, opts) =>
			options = 
				application: window.RpiApp
				model: profile
			view = new ProfileDetailView options
			window.RpiApp.layout.content.close()
			window.RpiApp.layout.content.show view

		model.fetch { success: fetchSuccessHandler }
		return