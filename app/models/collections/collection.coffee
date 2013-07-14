# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

# Base class for all collections.
module.exports = class Collection extends Backbone.Collection
	# Override default sync to append an authorization header with the access_token
	# if it is set in the session model.
	sync: (method, model, options) ->
		token = window.session.get 'access_token'
		if token isnt null
			options.beforeSend = (jqXHR) ->
				jqXHR.setRequestHeader 'Authorization', 'Bearer ' + $.base64.encode token
		Backbone.sync.call @, method, model, options
	

