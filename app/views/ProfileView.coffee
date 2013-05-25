application = require 'application'
template = require './templates/profile'
ProfileModalView = require 'views/ProfileModalView'
FermentationStepModalView = require 'views/FermentationStepModalView'

module.exports = class ProfileView extends Backbone.Marionette.ItemView
		template: template
		events:
			'click .add-step': 'addStep'
			'click .edit': 'editProfile'
			'click .delete': 'deleteProfile'

		addStep: (e) ->
			modal = new FermentationStepModalView()
			application.layout.modal.show modal

		editProfile: (e) =>
			options =
				model: @model
				application: application
			modal = new ProfileModalView(options)
			application.layout.modal.show modal
			false

		deleteProfile: (e) =>
			@model.once 'sync', () -> 
				application.vent.trigger 'Profile:Modified'
			@model.destroy()
			false
