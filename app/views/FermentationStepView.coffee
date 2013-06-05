# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

template 					= require './templates/step'
FermentationStepModalView 	= require 'views/FermentationStepModalView'

module.exports = class FermentationStepView extends Backbone.Marionette.ItemView
	template: template
	events:
		'click .edit-step': 'editStep'
		'click .delete-step': 'deleteStep'

	initialize: (options) =>
		@app = options.application

	editStep: (e) =>
		options =
			profile: @model.get 'profile'
			model: @model
			application: @app
		modal = new FermentationStepModalView(options)
		@app.layout.modal.show modal
		false

	deleteStep: (e) =>
		profile = @model.get 'profile'
		steps = profile.get 'steps'
		position = @model.get 'order'
		steps.splice position - 1, 1
		profile.set 'steps', steps
		profile.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		profile.save()			
		false
