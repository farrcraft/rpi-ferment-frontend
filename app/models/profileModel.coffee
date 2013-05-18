module.exports = class ProfileModel extends Backbone.Model
	urlRoot: '/profiles'
	idAttribute: '_id'
	defaults:
		name: 'Fermentation Profile'
		control_mode: 'manual'
		sensor: 'fermenter_1'
		start_time: null
		active: false
		steps: [
			{
				name: 'Fermentation Step'
				duration: 7
				temperature: 65
				order: 1
			}
		]

