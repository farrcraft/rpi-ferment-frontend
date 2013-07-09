# rpi-ferment-frontend
# Copyright(c) Joshua Farr <j.wgasa@gmail.com>

# Put your handlebars.js helpers here.

Handlebars.registerHelper 'pick', (val, options) ->
	return options.hash[val]

# mark the active option in a select list
# usage:
# <select>{{#select selectedOption}}<option>...</option>... {{/select}}</select>
Handlebars.registerHelper 'select', (value, options) ->
	$el = $('<select />').html options.fn @
	$el.find('[value=' + value + ']').attr {'selected': 'selected'}
	$el.html()

# render all of the select options for the configured sensors
Handlebars.registerHelper 'sensorList', (value, options) ->
	markup = ''
	sensor = for sensor in window.RpiApp.controller_.config_.sensors
		if sensor.type is 'fermenter'
			selected = ''
			if value is sensor.name
				selected = ' selected="selected"'
			markup = markup + '<option value="' + sensor.name + '"' + selected + '>' + sensor.label  + '</option>'
	markup

# render all of the select options for the available profiles
Handlebars.registerHelper 'profileList', (value, options) ->
	markup = ''
	window.RpiApp.controller_.profiles_.each (profile) =>
		id = profile.get '_id'
		name = profile.get 'name'
		selected = ''
		if value is id
			selected = ' selected="selected"'
		markup = markup + '<option value="' + id + '"' + selected + '>' + name + '</option>'
	markup

# render the temperature range of a step only if start and end represent a range and not a fixed temperature
# usage: {{stepTemperature start_temperature end_temperature}}
Handlebars.registerHelper 'stepTemperature', (start, end) ->
	markup = ''
	if start is end
		markup = start
	else
		markup = start + '-' + end
	markup

# format an ISO date using Moment.js
# http://momentjs.com/
# moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
# usage: {{dateFormat creation_date format="MMMM YYYY"}}
Handlebars.registerHelper 'dateFormat', (context, block) ->
	if window.moment
		f = block.hash.format || "MMM Do, YYYY"
		return moment(context).format(f)
	else
		#  moment plugin not available. return data as is.
		return context
