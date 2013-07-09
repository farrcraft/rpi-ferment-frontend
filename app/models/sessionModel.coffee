# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

config = require 'lib/config'

module.exports = class SessionModel extends Backbone.Model
	urlRoot: config.modelRoot + '/session'
	defaults:
		auth: false
		access_token: null

	initialize: () ->
		$.cookie.json = true
		session = $.cookie 'session'
		if session isnt undefined
			@set 'auth', session.auth
			@set 'user_id', session.user_id
			@set 'access_token', session.access_token

	login: (email, password, next) =>
		creds = 
			email: email
			password: password
			client_id: config.oauthSecret
		loginSuccessHandler = (model) =>
			error = model.get 'error_message'
			auth = false
			if error is undefined
				auth = true
			@set 'auth', auth
			@set 'id', null
			if auth is true
				session = 
					auth: auth
					user_id: model.get 'user_id'
					access_token: model.get 'access_token'
				$.cookie 'session', session
			next model
		@save creds, { success: loginSuccessHandler }

	logout: ->
		@set 'auth', false
		@set 'user_id', null
		@set 'access_token', null
		@save()
		$.removeCookie 'session'

	authenticated: ->
		Boolean @get 'auth'
