# rpi-ferment-frontend
# Copyright(c) Josh Farr <j.wgasa@gmail.com>

nodeStatic 	= require 'node-static'
http 		= require 'http'
path 		= require 'path'

publicDir = path.resolve __dirname, '/../public'
file = new nodeStatic.Server publicDir

server = http.createServer (request, response) ->
	request.addListener 'end', () ->
		file.serve request, response
	request.resume()

server.listen 3030
