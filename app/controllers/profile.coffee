ProfileModalView 	= require 'views/ProfileModalView'
ProfileModel 		= require 'models/profileModel'
ProfileCollection 	= require 'models/profileCollection'

module.exports = class ProfileController extends Backbone.Marionette.Controller
	initialize: (options) =>
		@app = options.application

		@profiles_ = new ProfileCollection()
		@profiles_.fetch
			add: true
			success: () =>
				@app.vent.trigger 'Profiles:Loaded'

		$('#new-profile-nav').on 'click', () =>
			@app.vent.trigger 'Nav:NewProfile'
			# return false to prevent event bubble from changing history hash
			false

		@app.vent.on 'Nav:NewProfile', () =>
			model = new ProfileModel()
			options =
				application: @app
				model: model
			modal = new ProfileModalView(options)
			@app.layout.modal.show modal
