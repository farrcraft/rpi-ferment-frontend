application 				= require 'application'
template 					= require './templates/profile'
ProfileModalView 			= require 'views/ProfileModalView'
FermentationStepModalView 	= require 'views/FermentationStepModalView'
StepModel					= require 'models/stepModel'
StepCollection				= require 'models/stepCollection'
FermentationStepView 		= require 'views/FermentationStepView'

module.exports = class ProfileView extends Backbone.Marionette.CompositeView
		template: template
		events:
			'click .add-step': 'addStep'
			'click .edit': 'editProfile'
			'click .delete': 'deleteProfile'
			'click .activate': 'activateProfile'

		ui:
			activateButton: '.activate'

		itemView: FermentationStepView
		itemViewContainer: '#steps'

		initialize: (options) =>
			@collection = new StepCollection()
			steps = @model.get 'steps'
			if steps isnt undefined
				step = for step in steps
					model = new StepModel step
					model.set 'profile', @model
					@collection.add model


		onRender: () ->
			state = @model.get 'active'
			if state
				@ui.activateButton.text 'deactivate'

		activateProfile: (e) ->
			state = @model.get 'active'
			newState = false
			if state is true
				@model.set 'active', false
				@ui.activateButton.text 'activate'
			else
				newState = true
				@model.set 'active', true
				@ui.activateButton.text 'deactivate'
			id = @model.get '_id'
			application.controller_.activateProfile id, newState
			false

		addStep: (e) ->
			options =
				profile: @model
				application: application
			modal = new FermentationStepModalView options
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
