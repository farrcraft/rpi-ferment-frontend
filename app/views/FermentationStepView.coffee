application 				= require 'application'
template 					= require './templates/step'
FermentationStepModalView 	= require 'views/FermentationStepModalView'

module.exports = class FermentationStepView extends Backbone.Marionette.ItemView
		template: template
		events:
			'click .edit-step': 'editStep'
			'click .delete-step': 'deleteStep'

		editStep: (e) =>
			false

		deleteStep: (e) =>
			false
