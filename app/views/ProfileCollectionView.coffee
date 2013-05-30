ProfileView = require 'views/ProfileView'

module.exports = class ProfileCollectionView extends Backbone.Marionette.CollectionView
	tagName: 'div'
	itemView: ProfileView
	initialize: (options) =>
		@app = options.application
		@app.vent.on 'Profile:Modified', () =>
			@collection.fetch
				add: true
				success: () =>
					@render()