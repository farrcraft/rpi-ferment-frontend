ProfileModalView 	= require 'views/ProfileModalView'
ProfileModel 		= require 'models/profileModel'
ProfileCollection 	= require 'models/profileCollection'

module.exports = class ProfileController extends Backbone.Marionette.Controller
	socket_: null

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
			modal = new ProfileModalView options
			@app.layout.modal.show modal

	activateProfile: (id, state) =>
		activeSensor = null
		oldState = !state
		@profiles_.each (profile) ->
			thisId = profile.get '_id'
			if id is thisId
				activeSensor = profile.get 'sensor'
		@profiles_.each (profile) =>
			thisId = profile.get '_id'
			thisSensor = profile.get 'sensor'
			save = false
			if id is thisId
				profile.set 'active', state
				save = true
			else if activeSensor is thisSensor
				profile.set 'active', oldState
				save = true
			if save
				profile.once 'sync', () => 
					@app.vent.trigger 'Profile:Modified'
				profile.save()

	setupSockets: =>
		@socket_ = io.connect 'http://graphite:6001'
		@socket_.on 'config', (config) =>
			@config_ = config
			@app.vent.trigger 'Socket:Config', config
		@socket_.on 'pv', (data) =>
			@app.vent.trigger 'Socket:PV', data
		@socket_.on 'setsv', (data) =>
			@app.vent.trigger 'Socket:SV', data
		@socket_.on 'mode', (data) =>
			@app.vent.trigger 'Socket:Mode', data
		@socket_.on 'getgpio', (data) =>
			@app.vent.trigger 'Heater:State', data
		@socket_.on 'setgpio', (data) =>
			@app.vent.trigger 'Heater:Changed', data
		@socket_.on 'setpv', (data) =>
			@app.vent.trigger 'Sensor:PV', data
		@socket_.emit 'config'
