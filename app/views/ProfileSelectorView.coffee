# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

template = require './templates/profileSelector'

module.exports = class ProfileSelectorView extends Backbone.Marionette.ItemView
	id: 'profile-modal-view'
	fermenterId: null
	template: template
	events:
		'click #save-active-profile': 'saveActiveProfile'

	initialize: (options) =>
		@app = options.application
		@fermenterId = options.fermenterId

	saveActiveProfile: (e) =>
		activeId = $('#profile-input-id').val()
		@app.controller_.profiles_.each (profile) =>
			id = profile.get '_id'
			modified = false
			oldState = profile.get 'active'
			sensor = profile.get 'sensor'
			if id is activeId
				# enable new profile for this sensor
				if oldState isnt true or sensor isnt @fermenterId
					profile.set 'active', true
					profile.set 'sensor', @fermenterId
					modified = true
			else
				# disable previously active profile for this sensor
				if oldState is true and sensor is @fermenterId
					profile.set 'active', false
					modified = true
			# sync change
			if modified is true
				profile.once 'sync', () =>
					@app.vent.trigger 'Profile:Modified'
				profile.save()

		@app.layout.modal.close()
		false
