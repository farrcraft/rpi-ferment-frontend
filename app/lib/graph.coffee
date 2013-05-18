Graphene = require 'lib/graphene'

# class for creating dashboard graphs
module.exports = class Graph
	description_: { }
	graphiteUrl_: 'http://graphite'
	graphene_: null

	constructor: ->
		@graphene_ = new Graphene()
		return

	createView: (name, gauge, sample) =>
		sampleRange = name + '&from=-' + sample + 'hours&until=now'
		targets = 'target=stats.gauges.' + gauge + '&target=stats.gauges.ambient'
		sourceUrl = @graphiteUrl_ + '/render?' + targets + '&title=' + sampleRange + '&format=json'
		div = '#' + gauge
		desc = { }

		model_opts = 
			source: sourceUrl
			refresh_interval: 10000
		ts = new Graphene.TimeSeries(model_opts)

		opts = 
			model: ts
			ymin: @graphene_.getUrlParam sourceUrl, "yMin"
			ymax: @graphene_.getUrlParam sourceUrl, "yMax"
		view = new Graphene.TimeSeriesView(_.extend(opts, desc))
		ts.start()
		view
