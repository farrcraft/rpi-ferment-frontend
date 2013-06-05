# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

template 	= require './templates/fermentationStepModal'
StepModel 	= require 'models/stepModel'

module.exports = class FermentationStepModalView extends Backbone.Marionette.ItemView
	id: 'step-modal-view'
	template: template
	profile_: { }
	events:
		'click #save-step': 'saveStep'
	ui:
		orderInput: '#step-input-order'

	initialize: (options) ->
		@profile_ = options.profile
		@app = options.application

	onRender: () ->
		spinOptions =
			minimum: 1
		@ui.orderInput.spinedit spinOptions

	saveStep: (e) =>
		step =
			name: $('#step-input-name').val()
			duration: $('#step-input-duration').val()
			temperature: $('#step-input-temperature').val()
			order: $('#step-input-order').val()			
		steps = @profile_.get 'steps'
		steps[step.order - 1] = step
		@profile_.set steps: steps
		@profile_.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		@profile_.save()
		@app.layout.modal.close()		

