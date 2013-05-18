# rpi-ferment-frontend
# Copyright(c) Josh Farr <j.wgasa@gmail.com>

express       = require 'express'
connectMongo  = require 'connect-mongo'
MongoStore    = connectMongo express
logger        = require('./services/logger.js').logger

# route files
dashboardRouter   = require './routes/dashboard.js'
#profileRouter     = require './routes/profile.js'

mongoose      = require 'mongoose'
hbs           = require 'hbs'
db = require './services/db.js'

exports.configure = (Express, app) ->
  app.configure ->
    logger.info 'Configuring application...'

    # Log responses to the terminal using Common Log Format.
    app.use Express.logger { buffer: true }
    app.use Express.methodOverride()
    app.use Express.bodyParser()

    # need cookie parser for session support
    app.use Express.cookieParser()

    # use mongodb for session store
    app.use Express.session({
        secret: 'thirstier thirster',
        store: new MongoStore({
        db: 'brewtheory'
        })
    })

    # Add a special header with timing information.
    app.use Express.responseTime()
    #app.router can cause problems when using everyauth so we don't explicitly use it
    #app.use app.router
    # routes
    dashboardRouter.routes app
    #profileRouter.routes app

    # use handlebars for view templates
    app.set "view engine", "hbs"
    app.set "views", "../views/"

    # register a custom helper for rendering objects (handy for debugging)
    hbs.registerHelper 'json', (context) ->
      return JSON.stringify context

    app.set 'log', 'logs/rpi-ferment-frontend.log'
    db.establishConnection()
    return


  # Dev config
  app.configure 'development', () ->
    logger.info 'Configuring development mode...'
    app.use Express.static __dirname + '/../public'
    app.use Express.errorHandler { dumpExceptions: true, showStack: true }
    return

  # Production config
  app.configure 'production', () ->
    logger.info 'Configuring production mode...'
    oneYear = 31557600000
    app.use Express.static __dirname + '/../public', { maxAge: oneYear }
    app.use Express.errorHandler
    return


  # setup error handling

  NotFound = (msg) ->
    @name = 'NotFound'
    logger.info 'Not Found - ' + msg
    Error.call this, msg
    Error.captureStackTrace this, arguments.callee
    return


  NotFound.prototype.__proto__ = Error.prototype

  app.get '/404', (req, res) ->
    throw new NotFound 'page not found'
    return


  app.get '/500', (req, res) ->
    throw new Error 'keyboard cat!'
    return

  # error handler
  app.use (err, req, res, next) ->
    logger.error err
    if err instanceof NotFound
      res.render '404.hbs'
    else
      res.render '500.hbs', {
        error: err
      }
    return
