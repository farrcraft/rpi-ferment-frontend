ProfileCollectionView = require 'views/ProfileCollectionView'
ProfileCollection = require 'models/profileCollection'
ProfileModel = require 'models/profileModel'

module.exports = class ProfilesLayout extends Backbone.Marionette.Layout
	template: require('views/templates/profilesLayout')

	regions:
		profiles: "#profiles-table"

	initialize: () =>
			collection = new ProfileCollection()
			view = new ProfileCollectionView { collection: collection }
			collection.fetch
				add: true
				success: () ->
					profiles.each (item) -> view.appendItem item
			@profiles.show view

