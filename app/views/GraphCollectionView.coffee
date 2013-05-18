application = require 'application'
GraphLayout = require 'views/GraphLayout'

module.exports = class GraphCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: GraphLayout

