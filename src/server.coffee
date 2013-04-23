# rpi-ferment-frontend
# Copyright(c) Josh Farr

cluster = require 'cluster'
numCPUs = require('os').cpus().length;

if cluster.isMaster
  # Fork workers.
  for i in [1..numCPUs]
    cluster.fork()

  cluster.on 'death', (worker) ->
    console.log 'worker ' + worker.pid + ' died'
    return
  return
else
  app = require './app'
  app.listen 3020
  return
