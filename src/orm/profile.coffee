mongoose	= require 'mongoose'
Schema		= mongoose.Schema


# Schema for mongo fermentation profile collection
Profile = new Schema

Profile.add
	name: 
		type: String
		required: true
	control_mode: String
	sensor: String
	start_time: Date
	steps: [
		name: String
		duration: Number
		temperature: Number
		order: Number
	]
	overrides: [
		action: String
		time: Date
	]
	updated_at: Boolean
	active: Boolean
	created_at:
		type: Date, 
		default: Date.now


mongoose.model 'Profile', Profile
