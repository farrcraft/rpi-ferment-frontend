application = require 'application'
template = require './templates/profile'
ProfileModalView = require 'views/ProfileModalView'
FermentationStepModalView = require 'views/FermentationStepModalView'

module.exports = class ProfileView extends Backbone.Marionette.ItemView
		template: template
		events:
			'click .add-step': 'addStep'
		addStep: (e) ->
			modal = new FermentationStepModalView()
			application.layout.modal.show modal
