application = require 'application'

module.exports = class GraphLayout extends Backbone.Marionette.Layout
	template: require('views/templates/graphLayout')

	initialize: (options) =>
		return

	onRender: () =>
		fermenterId = @model.get 'fermenterId'
		graphRegionId = '#' + fermenterId + '_rgn'
		@graphRegion = @addRegion fermenterId, graphRegionId
		sample = @model.get 'sample'
		el = fermenterId
		@graphView = application.graph_.createView fermenterId, el, sample
		@graphRegion.show @graphView
		@graphView.render()
		return

	onClose: () =>
		@graphView.model.stop()
		return
