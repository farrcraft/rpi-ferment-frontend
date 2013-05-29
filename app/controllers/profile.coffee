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

	setupSockets: =>
		@socket_ = io.connect 'http://graphite:6001'
		@socket_.on 'config', (config) =>
			@config_ = config
			@app.vent.trigger 'Socket:Config', config
		@socket_.on 'pv', (data) =>
			@app.vent.trigger 'Socket:PV'
			console.log 'new pv'
		@socket_.on 'sv', (data) =>
			@app.vent.trigger 'Socket:SV'
			console.log 'new sv'
		@socket_.on 'mode', (data) =>
			@app.vent.trigger 'Socket:Mode', data

		@socket_.emit 'config'
