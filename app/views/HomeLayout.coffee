GraphCollectionView = require 'views/GraphCollectionView'
GraphCollection = require 'models/graphCollection'
GraphModel = require 'models/graphModel'

module.exports = class HomeLayout extends Backbone.Marionette.Layout
	template: require('views/templates/homeLayout')

	initialize: () =>
		graphRegion = @addRegion 'graphs', '#graphs'
		socket = io.connect 'http://graphite:6001'
		socket.on 'config', (config) =>
			models = []
			sensor = for sensor in config.sensors
				if sensor.type is 'fermenter'

					# TODO - need to query the active profile from the frontend server

					options = 
						sample: 24
						sensorName: sensor.name
						sensorLabel: sensor.label
						fermenterId: sensor.name
						fermenterName: sensor.label
						profileName: sensor.name
						heaterState: 'On'
						sampleOptions: [2, 4, 6, 8, 12, 24]
						sampleRate:  24

					model = new GraphModel options
					models.push model
			collection = new GraphCollection models
			view = new GraphCollectionView { collection: collection }
			graphRegion.show view

		socket.on 'pv', (data) =>
			console.log 'new pv'
		socket.on 'sv', (data) =>
			console.log 'new sv'
		socket.on 'mode', (data) =>

		socket.emit 'config'
