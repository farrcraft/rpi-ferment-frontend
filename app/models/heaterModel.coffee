# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

module.exports = class HeaterModel extends Backbone.Model
	defaults:
		fermenterId: ''
		state: 'off'

