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
		# enable numeric spinner control for step order form input
		spinOptions =
			minimum: 1
		@ui.orderInput.spinedit spinOptions

	saveStep: (e) =>
		oldOrder = $('step-input-old-order').val()
		steps = @profile_.get 'steps'
		step = {}

		# preserve non-modifiable properties of old step if updating
		if $.isNumeric oldOrder
			step = steps[oldOrder - 1]

		step.name = $('#step-input-name').val()
		step.duration = $('#step-input-duration').val()
		step.temperature = $('#step-input-temperature').val()
		step.order = orderInput.val()

		steps[step.order - 1] = step

		# remove old step if updating to a new position
		if step.order isnt oldOrder
			steps.splice oldOrder - 1, 1

		@profile_.set steps: steps
		@profile_.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		@profile_.save()
		@app.layout.modal.close()		

