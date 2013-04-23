
# routes
# @param app the connect app
module.exports.routes = (app) ->
   # GET method
  app.get '/', (req, res) ->
    res.render 'dashboard.hbs', { title: 'rpi-ferment dashboard', req: req }
    return

  # end of route definitions
  return
