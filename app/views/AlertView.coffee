# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template = require './templates/alert'

module.exports = class AlertView extends Backbone.Marionette.ItemView
	template: template
	ui:
		box: '#alert-view'

	initialize: (options) ->
		message = ''
		if options.message isnt undefined
			message = options.message
		type = 'info'
		if options.type isnt undefined
			type = options.type
		className = ''
		if options.message isnt undefined and options.message isnt 'warning'
			className = 'alert-' + type
		attrs = 
			message: message
			type: type
			className: className
		@model = new Backbone.Model attrs

	message: (msg) ->
		@model.set 'message', msg
		@render()

	info: (msg) ->
		@setAlertType 'info'
		@message msg

	success: (msg) ->
		@setAlertType 'success'
		@message msg

	error: (msg) ->
		@setAlertType 'error'
		@message msg

	warning: (msg) ->
		@setAlertType 'warning'
		@message msg

	setAlertType: (type) ->
		oldType = @model.get 'type'
		oldClass = 'alert-' + oldType
		@model.set 'type', type
		newClass = ''
		@ui.box.removeClass oldClass
		if type isnt 'warning'
			newClass = 'alert-' + type
			@ui.box.addClass newClass
		@model.set 'className', newClass
