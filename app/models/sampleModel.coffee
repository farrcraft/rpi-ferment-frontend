# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

module.exports = class SampleModel extends Backbone.Model
	defaults:
		fermenterId: ''
		range: [ 72, 48, 24, 12, 8, 6, 4, 3, 2, 1 ]
		unit: 'H'
		current: 24

