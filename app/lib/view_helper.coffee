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