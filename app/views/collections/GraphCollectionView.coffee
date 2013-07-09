# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

GraphLayout = require 'views/layouts/GraphLayout'

module.exports = class GraphCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: GraphLayout

	initialize: (options) ->
		@app = options.application

	itemViewOptions: (model, index) ->
		options =
			application: @app
		options

