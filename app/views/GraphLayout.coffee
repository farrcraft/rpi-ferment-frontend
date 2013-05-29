application = require 'application'
HeaterView 	= require 'views/HeaterView'
SampleView 	= require 'views/SampleView'

module.exports = class GraphLayout extends Backbone.Marionette.Layout
	template: require('views/templates/graphLayout')

	events:
		'click .changeProfile': 'changeProfile'
		'click .history': 'showHistory'

	ui:
		profileLabel: '.changeProfile'

	initialize: (options) =>
		return

	onRender: () =>
		fermenterId = @model.get 'fermenterId'

		graphRegionId = fermenterId + '_graphRegion'
		sampleRegionId = fermenterId + '_sampleRegion'
		heaterRegionId = fermenterId + '_heaterRegion'

		@graphRegion = @addRegion graphRegionId, '#' + graphRegionId
		@sampleRegion = @addRegion sampleRegionId, '#' + sampleRegionId
		@heaterRegion = @addRegion heaterRegionId, '#' + heaterRegionId

		sample = @model.get 'sample'
		el = fermenterId
		@graphView = application.graph_.createView fermenterId, el, sample
		@graphRegion.show @graphView
		@graphView.render()

		options =
			fermenterId: fermenterId

		heaterView = new HeaterView options
		@heaterRegion.show heaterView

		sampleView = new SampleView options
		@sampleRegion.show sampleView

		return

	onClose: () =>
		@graphView.model.stop()
		return

	changeProfile: (e) =>
		console.log 'change profile'
		false

	showHistory: (e) =>
		console.log 'show history'
		false