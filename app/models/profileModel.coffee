# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

config = require 'lib/config'

module.exports = class ProfileModel extends Backbone.Model
	urlRoot: config.modelRoot + '/profiles'
	idAttribute: '_id'
	defaults:
		name: 'Fermentation Profile'
		control_mode: 'manual'
		sensor: 'fermenter_1'
		start_time: null
		active: false
		steps: [
			{
				name: 'Fermentation Step'
				duration: 7
				temperature: 65
				unit: 'days'
				order: 1
			}
		]
		overrides: [
		]

