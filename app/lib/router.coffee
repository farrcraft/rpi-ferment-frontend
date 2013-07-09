# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

HomeLayout 			= require 'views/layouts/HomeLayout'
ProfilesLayout 		= require 'views/layouts/ProfilesLayout'
ProfileDetailView 	= require 'views/ProfileDetailView'
ProfileModel		= require 'models/profileModel'

module.exports = class Router extends Backbone.Router

	routes:
		'': 			'home'
		'profiles': 	'profiles'
		'profile/:id': 	'profile'
		'login':		'login'
		'logout':		'logout'

	initialize: (options) =>
		@app = options.application

	home: =>
		options =
			application: @app
		home = new HomeLayout options
		@app.layout.content.close()
		@app.layout.content.show home
		if @app.controller_.config_ isnt undefined
			home.createCollection @app.controller_.config_

	profiles: =>
		options = 
			application: @app
		profiles = new ProfilesLayout options
		@app.layout.content.close()
		@app.layout.content.show profiles
		profiles.showProfiles()

	profile: (id) =>
		model = new ProfileModel { _id: id }
		fetchSuccessHandler = (profile, res, opts) =>
			options = 
				application: @app
				model: profile
			view = new ProfileDetailView options
			@app.layout.content.close()
			@app.layout.content.show view

		model.fetch { success: fetchSuccessHandler }
		return

	login: ->
		if @app.session.authenticated() is true
			@app.redirect 'dashboard'
		@displayView 'views/LoginView'

	logout: ->
		if @app.session.authenticated() is true
			@app.session.logout()
		@app.redirect 'login'
