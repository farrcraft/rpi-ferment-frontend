# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

config 		 = require 'lib/config'
ProfileModel = require 'models/profileModel'

module.exports = class ProfileCollection extends Backbone.Collection
	url: config.modelRoot + '/profiles'
	model: ProfileModel	
