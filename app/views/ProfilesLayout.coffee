ProfileCollectionView 	= require 'views/ProfileCollectionView'
ProfileModel 			= require 'models/profileModel'
template 				= require 'views/templates/profilesLayout'

module.exports = class ProfilesLayout extends Backbone.Marionette.Layout
	template: template

	regions:
		profiles: "#profiles-table"

	initialize: (options) =>
		@app = options.application

		@app.vent.on 'Profiles:Loaded', () =>
			@showProfiles()

	showProfiles: () =>
		options =
			application: @app
			collection: @app.controller_.profiles_
		view = new ProfileCollectionView options
		@profiles.close()
		@profiles.show view
