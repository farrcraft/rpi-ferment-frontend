# Raspberry Pi Fermentation temperature logging & control application
# (c) Joshua Farr <j.wgasa@gmail.com>

# routes
# @param app the connect app
module.exports.routes = (app) ->
	# GET method
	app.get '/', (req, res) ->
		locals =
			title: 'rpi-ferment dashboard'
		res.render 'dashboard.hbs', locals
		return

	# end of route definitions
	return
