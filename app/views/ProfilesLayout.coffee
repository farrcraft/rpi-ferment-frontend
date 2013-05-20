ProfileCollectionView = require 'views/ProfileCollectionView'
ProfileCollection = require 'models/profileCollection'
ProfileModel = require 'models/profileModel'

module.exports = class ProfilesLayout extends Backbone.Marionette.Layout
	template: require('views/templates/profilesLayout')

	regions:
		profiles: "#profiles-table"

	initialize: () =>
			collection = new ProfileCollection()
			collection.fetch
				add: true
				success: () =>
					view = new ProfileCollectionView { collection: collection }
					@profiles.show view

