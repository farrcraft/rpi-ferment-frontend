g = new Graphene

description =
	"Fermenter 1":
		source: 'http://graphite/render?target=stats.gauges.fermenter_1&target=stats.gauges.ambient&title=fermenter%201&from-12hours&until=now&format=json'
		TimeSeries: 
			parent: '#fermenter-1'
	"Fermenter 2":
		source: 'http://graphite/render?target=stats.gauges.fermenter_2&target=stats.gauges.ambient&title=fermenter%202&from-12hours&until=now&format=json'
		TimeSeries: 
			parent: '#fermenter-2'

g.build description
