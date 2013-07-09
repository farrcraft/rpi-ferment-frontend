# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

template = require './templates/login'

module.exports = class LoginView extends Backbone.Marionette.ItemView
	template: template
	ui:
		email: '#login-input-email'
		password: '#login-input-password'
	events: 
		'click #login-button': 'login'

	initialize: (options) =>
		@app = options.application

	login: (e) =>
		email = @ui.email.val()
		password = @ui.password.val()
		loginSuccess = (model) =>
			error = model.get 'error_message'
			if error is undefined
				@app.redirect '/'
			else
				@app.alert 'error', 'Login Error!'
		@app.session.login email, password, loginSuccess
		false


