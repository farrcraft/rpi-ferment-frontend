# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template 					= require './templates/profile'
ProfileModalView 			= require 'views/modals/ProfileModalView'
FermentationStepModalView 	= require 'views/modals/FermentationStepModalView'
StepModel					= require 'models/stepModel'
StepCollection				= require 'models/collections/stepCollection'
FermentationStepView 		= require 'views/FermentationStepView'

module.exports = class ProfileView extends Backbone.Marionette.CompositeView
		template: template
		tagName: 'tr'
		events:
			'click .edit': 'editProfile'
			'click .delete': 'deleteProfile'
			'click .activate': 'activateProfile'

		ui:
			activateButton: '.activate'

		initialize: (options) =>
			@app = options.application
			return

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
