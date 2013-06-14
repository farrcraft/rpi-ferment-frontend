# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

application 	 	= require 'application'
HeaterView 		 	= require 'views/HeaterView'
SampleView 		 	= require 'views/SampleView'
ProfileModalView 	= require 'views/ProfileModalView'
ProfileSelectorView = require 'views/ProfileSelectorView'

module.exports = class GraphLayout extends Backbone.Marionette.Layout
	template: require('views/templates/graphLayout')

	events:
		'click .changeProfile': 'changeProfile'
		'click .editProfile': 'editProfile'
		'click .history': 'showHistory'

	ui:
		profileLabel: '.activeProfile'
		profileButton: '.changeProfile'
		editButton: '.editProfile'
		stepLabel: '.activeStep'


	initialize: (options) =>
		updateProfileCallback = () =>
			@updateProfileData true			
		application.vent.on 'Profiles:Loaded', @updateProfileCallback
		application.vent.on 'Profile:Modified', @updateProfileCallback
		@updateProfileData false
		application.vent.on 'Sensor:PV', @updateSensorDisplay
		return

	updateSensorDisplay: (data) =>
		fermenterId = @model.get 'fermenterId'
		if data.sensor is fermenterId
			selector = '#' + fermenterId + '_sensorPV'
			display = data.pv.toFixed 2
			display = display + '&deg;'
			$(selector).html display

	updateProfileData: (rerender) =>
		fermenterId = @model.get 'fermenterId'
		activeProfile = null
		application.controller_.profiles_.each (profile) =>
			sensor = profile.get 'sensor'
			active = profile.get 'active'
			if sensor is fermenterId and active is true
				@model.set 'profile', profile
				@model.set 'profileName', profile.get 'name'
				activeProfile = profile
				activeStep = false
				steps = profile.get 'steps'
				step = for step in steps
					if step.active is true
						@model.set 'activeStep', step.name
						activeStep = true
						break
				if activeStep is false
					@model.set 'activeStep', '[No Active Step]'
				return
		if activeProfile is null
			label = @model.get 'sensorLabel'
			@model.set 'profileName', label
			@model.set 'profile', null
		if rerender is true
			@render()

	onRender: () =>
		fermenterId = @model.get 'fermenterId'

		graphRegionId = fermenterId + '_graphRegion'
		sampleRegionId = fermenterId + '_sampleRegion'
		heaterRegionId = fermenterId + '_heaterRegion'

		@graphRegion = @addRegion graphRegionId, '#' + graphRegionId
		@sampleRegion = @addRegion sampleRegionId, '#' + sampleRegionId
		@heaterRegion = @addRegion heaterRegionId, '#' + heaterRegionId

		@renderGraph()

		gpio = @model.get 'gpio'

		options =
			fermenterId: fermenterId
			layout: @
			application: application
			graphModel: @model
			gpio: gpio

		heaterView = new HeaterView options
		@heaterRegion.show heaterView

		sampleView = new SampleView options
		@sampleRegion.show sampleView

		profile = @model.get 'profile'
		if profile is undefined or profile is null
			@ui.editButton.hide()
			@ui.profileButton.text '[set profile]'
		return

	renderGraph: () =>
		fermenterId = @model.get 'fermenterId'
		sample = @model.get 'sample'
		el = fermenterId
		@graphView = application.graph_.createView fermenterId, el, sample
		@graphRegion.show @graphView
		@graphView.render()

	onClose: () =>
		@graphView.model.stop()
		return

	editProfile: (e) =>
		model = @model.get 'profile'
		options =
			model: model
			application: application
		modal = new ProfileModalView options
		application.layout.modal.show modal
		false

	changeProfile: (e) =>
		fermenterId = @model.get 'fermenterId'
		options = 
			application: application
			fermenterId: fermenterId
		modal = new ProfileSelectorView options
		application.layout.modal.show modal
		false

	# Not implemented...
	showHistory: (e) =>
		console.log 'show history'
		false
