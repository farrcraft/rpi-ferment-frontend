# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

application 				= require 'application'
template 					= require './templates/profileDetail'
ProfileModalView 			= require 'views/ProfileModalView'
FermentationStepModalView 	= require 'views/FermentationStepModalView'
StepModel					= require 'models/stepModel'
StepCollection				= require 'models/stepCollection'
FermentationStepView 		= require 'views/FermentationStepView'

module.exports = class ProfileDetailView extends Backbone.Marionette.CompositeView
		template: template
		events:
			'click .add-step': 'addStep'
			'click .edit': 'editProfile'

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
