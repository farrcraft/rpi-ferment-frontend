# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template 					= require './templates/profileDetail'
ProfileModalView 			= require 'views/modals/ProfileModalView'
FermentationStepModalView 	= require 'views/modals/FermentationStepModalView'
StepModel					= require 'models/stepModel'
StepCollection				= require 'models/collections/stepCollection'
FermentationStepView 		= require 'views/FermentationStepView'

module.exports = class ProfileDetailView extends Backbone.Marionette.CompositeView
	template: template
	events:
		'click .add-step': 'addStep'
		'click .edit': 'editProfile'

	itemView: FermentationStepView
	itemViewContainer: '#steps'
	itemViewOptions: (model, index) ->
		options =
			application: @app
		options

	initialize: (options) =>
		@app = options.application
		@loadSteps()
		@app.vent.on 'Profile:Modified', () =>
			@model.fetch
				success: () =>
					@app.controller_.profiles_.fetch()
					@loadSteps()
					@render()

	loadSteps: () ->
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
			application: @app
		modal = new FermentationStepModalView options
		@app.layout.modal.show modal

	editProfile: (e) =>
		options =
			model: @model
			application: @app
		modal = new ProfileModalView(options)
		@app.layout.modal.show modal
		false
