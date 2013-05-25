ProfileView = require 'views/ProfileView'
application = require 'application'

module.exports = class ProfileCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: ProfileView
	initialize: =>
		application.vent.on 'Profile:Modified', =>
			@collection.fetch
				add: true
				success: () =>
					@render()