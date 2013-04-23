# rpi-ferment-frontend
# Copyright(c) Josh Farr <j.wgasa@gmail.com>
# This file provides database services

# system includes
mongoose = require 'mongoose'

exports.establishConnection = () ->
  # establish db connection
  mongoose.connect 'mongodb://localhost:27017/brewtheory'
  return

