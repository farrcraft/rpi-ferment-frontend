# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

GraphModel = require 'models/graphModel'

module.exports = class GraphCollection extends Backbone.Collection
	model: GraphModel

