ProfileModel = require 'models/profileModel'

module.exports = class ProfileCollection extends Backbone.Collection
	url: '/profiles'
	model: ProfileModel	
