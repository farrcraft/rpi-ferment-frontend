# Put your handlebars.js helpers here.
#application = require 'application'


Handlebars.registerHelper 'pick', (val, options) ->
	return options.hash[val]

Handlebars.registerHelper 'select', (value, options) ->
	$el = $('<select />').html options.fn @
	$el.find('[value=' + value + ']').attr {'selected': 'selected'}
	$el.html()

Handlebars.registerHelper 'sensorList', (value, options) ->
	markup = ''
	sensor = for sensor in window.RpiApp.controller_.config_.sensors
		if sensor.type is 'fermenter'
			selected = ''
			if value is sensor.name
				selected = ' selected="selected"'
			markup = markup + '<option value="' + sensor.name + '"' + selected + '>' + sensor.label  + '</option>'
	markup