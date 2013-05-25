application = require 'application'
ModalRegion = require 'views/ModalRegion'
template = require 'views/templates/appLayout'

module.exports = class AppLayout extends Backbone.Marionette.Layout
	template: template
	el: "body"

	regions:
		nav: "#nav"
		content: "#content"
		modal: ModalRegion
