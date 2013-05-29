ProfileCollectionView 	= require 'views/ProfileCollectionView'
ProfileModel 			= require 'models/profileModel'

module.exports = class ProfilesLayout extends Backbone.Marionette.Layout
	template: require('views/templates/profilesLayout')

	regions:
		profiles: "#profiles-table"

	initialize: (options) =>
		@app = options.application

		@app.vent.on 'Profiles:Loaded', () =>
			@showProfiles()

	showProfiles: () =>
		view = new ProfileCollectionView { collection: @app.controller_.profiles_ }
		@profiles.close()
		@profiles.show view
