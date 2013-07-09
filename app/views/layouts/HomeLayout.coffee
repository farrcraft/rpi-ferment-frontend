# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

GraphCollectionView = require 'views/collections/GraphCollectionView'
GraphCollection 	= require 'models/collections/graphCollection'
GraphModel 			= require 'models/graphModel'
template 			= require 'views/templates/layouts/homeLayout'

module.exports = class HomeLayout extends Backbone.Marionette.Layout
	template: template

	initialize: (options) =>
		@graphRegion = @addRegion 'graphs', '#graphs'
		@app = options.application

		@app.vent.on 'Socket:Config', (config) =>
			@createCollection config

	createCollection: (config) =>
		models = []
		sensor = for sensor in config.sensors
			if sensor.type is 'fermenter'

				options = 
					sample: 24
					gpio: sensor.gpio
					sensorName: sensor.name
					sensorLabel: sensor.label
					fermenterId: sensor.name
					fermenterName: sensor.label
					profileName: sensor.name
					heaterState: 'Off'
					sampleOptions: [2, 4, 6, 8, 12, 24]
					sampleRate:  24

				model = new GraphModel options
				models.push model
		collection = new GraphCollection models
		view = new GraphCollectionView { collection: collection }
		@graphRegion.show view
