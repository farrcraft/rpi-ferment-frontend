ProfileView = require 'views/ProfileView'

module.exports = class ProfileCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: ProfileView

