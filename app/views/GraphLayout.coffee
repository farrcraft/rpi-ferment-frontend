# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

application = require 'application'
HeaterView 	= require 'views/HeaterView'
SampleView 	= require 'views/SampleView'

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


	initialize: (options) =>
		application.vent.on 'Profiles:Loaded', @updateProfileData

		fermenterId = @model.get 'fermenterId'
		application.controller_.profiles_.each (profile) =>
			sensor = profile.get 'sensor'
			active = profile.get 'active'
			if sensor is fermenterId and active is true
				@model.set 'profile', profile
				@model.set 'profileName', profile.get 'name'
		return

	updateProfileData: () =>
		console.log 'update profile data'

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
		if profile is undefined
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
		console.log 'edit profile'
		false

	changeProfile: (e) =>
		console.log 'change profile'
		false

	showHistory: (e) =>
		console.log 'show history'
		false