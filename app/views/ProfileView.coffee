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

		itemView: FermentationStepView
		itemViewContainer: '#steps'

		initialize: (options) =>
			collection = new StepCollection()
			steps = @model.get 'steps'
			if steps isnt undefined
				step = for step in steps
					model = new StepModel step
					model.set 'profile', @model
					collection.add model
			@collection = collection


		addStep: (e) ->
			options =
				profile: @model
				application: application
			modal = new FermentationStepModalView(options)
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
