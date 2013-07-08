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
		oldOrderInput: '#step-input-old-order'

	initialize: (options) ->
		@profile_ = options.profile
		@app = options.application

	onRender: () ->
		# set spinner to current order if updating or the next order value sequence if adding
		oldOrder = @ui.oldOrderInput.val()
		if $.isNumeric oldOrder
			nextOrder = oldOrder
		else
			steps = @profile_.get 'steps'
			nextOrder = steps.length + 1
		# enable numeric spinner control for step order form input
		spinOptions =
			minimum: 1
			value: nextOrder
		@ui.orderInput.spinedit spinOptions

	saveStep: (e) =>
		oldOrder = @ui.oldOrderInput.val()
		steps = @profile_.get 'steps'
		step = {}

		# preserve non-modifiable properties of old step if updating
		if $.isNumeric oldOrder
			step = steps[oldOrder - 1]

		step.name = $('#step-input-name').val()
		step.duration = $('#step-input-duration').val()
		step.start_temperature = $('#step-input-start-temperature').val()
		step.end_temperature = $('#step-input-end-temperature').val()
		step.order = @ui.orderInput.val()

		steps[step.order - 1] = step

		# remove old step if updating to a new position
		if $.isNumeric oldOrder and step.order isnt oldOrder
			steps.splice oldOrder - 1, 1

		@profile_.set steps: steps
		@profile_.once 'sync', () => 
			@app.vent.trigger 'Profile:Modified'
		@profile_.save()
		@app.layout.modal.close()		

