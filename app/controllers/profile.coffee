ProfileModalView = require 'views/ProfileModalView'

module.exports = class ProfileController extends Backbone.Marionette.Controller
	initialize: (options) =>
		@app = options.application

		$('#new-profile-nav').on 'click', () =>
			@app.vent.trigger 'Nav:NewProfile'
			false

		@app.vent.on 'Nav:NewProfile', () =>
			modal = new ProfileModalView()
			@app.layout.modal.show modal
