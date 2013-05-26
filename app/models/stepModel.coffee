module.exports = class StepModel extends Backbone.Model
	idAttribute: '_id'
	defaults:
		name: 'Fermentation Step'
		duration: 7
		temperature: 65
		unit: 'days'
		order: 1
		profile: {}

