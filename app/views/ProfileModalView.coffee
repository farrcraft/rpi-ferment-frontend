template = require './templates/profileModal'
ProfileModel = require 'models/profileModel'

module.exports = class ProfileModalView extends Backbone.Marionette.ItemView
	id: 'profile-modal-view'
	template: template
	events:
		'click #save-profile': 'saveProfile'

	initialize: (options) =>
		@app = options.application
		console.log @app.config_

	saveProfile: (e) =>
		name = $('#profile-input-name').val()
		controlMode = $('#profile-input-mode').val()
		sensor = $('#profile-input-sensor').val()

		@model.set 'name', name
		@model.set 'control_mode', controlMode
		@model.set 'sensor', sensor

		@model.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		@model.save()
		@app.layout.modal.close()		
