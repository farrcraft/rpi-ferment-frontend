# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

application = require 'application'
GraphLayout = require 'views/layouts/GraphLayout'

module.exports = class GraphCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: GraphLayout

