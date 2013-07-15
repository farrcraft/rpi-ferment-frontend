# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

Graphene = require 'lib/graphene'
config 	 = require 'lib/config'

# class for creating dashboard graphs
module.exports = class Graph
	description_: { }
	graphiteUrl_: config.graphiteRoot
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

		# [TODO] - graph ymin should be configurable
		ymin = 59
		#ymin = @graphene_.getUrlParam sourceUrl, "yMin"

		opts = 
			model: ts
			ymin: ymin
			ymax: @graphene_.getUrlParam sourceUrl, "yMax"
		view = new Graphene.TimeSeriesView(_.extend(opts, desc))
		ts.start()
		view
