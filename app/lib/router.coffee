application = require('application')
HomeLayout = require('views/HomeLayout')
ProfilesLayout = require('views/ProfilesLayout')

module.exports = class Router extends Backbone.Router

	routes:
		'': 'home'
		'profiles': 'profiles'

	home: =>
		home = new HomeLayout()
		application.layout.content.close()
		application.layout.content.show(home)

	profiles: =>
		profiles = new ProfilesLayout()
		application.layout.content.close()
		application.layout.content.show(profiles)
