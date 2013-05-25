template = require './templates/profileModal'
ProfileModel = require 'models/profileModel'

module.exports = class ProfileModalView extends Backbone.Marionette.ItemView
	id: 'profile-modal-view'
	template: template
	events:
		'click #save-profile': 'saveProfile'

	initialize: (options) =>
		@app = options.application

	saveProfile: (e) =>
		name = $('#profile-input-name').val()
		@model.set 'name', name
		@model.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		@model.save()
		@app.layout.modal.close()		
