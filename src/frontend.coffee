# rpi-ferment-frontend
# Copyright(c) Josh Farr <j.wgasa@gmail.com>

nodeStatic 	= require 'node-static'
http 		= require 'http'

file = new nodeStatic.Server '../public'

server = http.createServer (request, response) ->
	request.addListener 'end', () ->
		file.serve request, response
	request.resume()

server.listen 3030
