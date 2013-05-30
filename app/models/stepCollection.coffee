# rpi-ferment-frontend
# Copyright(c) Joshua  Farr <j.wgasa@gmail.com>

StepModel = require 'models/stepModel'

module.exports = class StepCollection extends Backbone.Collection
	model: StepModel	
