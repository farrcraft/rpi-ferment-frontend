# Put your handlebars.js helpers here.


Handlebars.registerHelper 'pick', (val, options) ->
	return options.hash[val]

Handlebars.registerHelper 'select', (value, options) ->
	$el = $('<select />').html options.fn @
	$el.find('[value=' + value + ']').attr {'selected': 'selected'}
	$el.html()
