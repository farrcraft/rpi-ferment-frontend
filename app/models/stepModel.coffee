# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

module.exports = class StepModel extends Backbone.Model
	idAttribute: '_id'
	defaults:
		name: 'Fermentation Step'
		duration: 7
		start_temperature: 65
		end_temperature: 65
		unit: 'days'
		order: 1
		profile: {}

