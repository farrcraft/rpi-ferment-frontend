(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("application", function(exports, require, module) {
  (function() {
    var Application, Graph, ProfileController,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    require('lib/view_helper');

    Graph = require('lib/graph');

    ProfileController = require('controllers/profile');

    Application = (function(_super) {

      __extends(Application, _super);

      function Application() {
        this.initialize = __bind(this.initialize, this);
        Application.__super__.constructor.apply(this, arguments);
      }

      Application.prototype.graph_ = null;

      Application.prototype.config_ = null;

      Application.prototype.controller_ = null;

      Application.prototype.initialize = function() {
        var _this = this;
        this.graph_ = new Graph();
        this.on("initialize:after", function(options) {
          options = {
            application: _this
          };
          _this.controller_ = new ProfileController(options);
          _this.controller_.setupSockets();
          Backbone.history.start();
          return typeof Object.freeze === "function" ? Object.freeze(_this) : void 0;
        });
        this.on('start', function() {});
        this.addInitializer(function(options) {
          var AppLayout;
          AppLayout = require('views/AppLayout');
          options = {
            application: _this
          };
          _this.layout = new AppLayout(options);
          return _this.layout.render();
        });
        this.addInitializer(function(options) {
          var Router;
          Router = require('lib/router');
          return _this.router = new Router();
        });
        return this.start();
      };

      return Application;

    })(Backbone.Marionette.Application);

    module.exports = new Application();

  }).call(this);
  
});
window.require.register("controllers/profile", function(exports, require, module) {
  (function() {
    var ProfileCollection, ProfileController, ProfileModalView, ProfileModel,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileModalView = require('views/ProfileModalView');

    ProfileModel = require('models/profileModel');

    ProfileCollection = require('models/profileCollection');

    module.exports = ProfileController = (function(_super) {

      __extends(ProfileController, _super);

      function ProfileController() {
        this.setupSockets = __bind(this.setupSockets, this);
        this.activateProfile = __bind(this.activateProfile, this);
        this.initialize = __bind(this.initialize, this);
        ProfileController.__super__.constructor.apply(this, arguments);
      }

      ProfileController.prototype.socket_ = null;

      ProfileController.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.application;
        this.profiles_ = new ProfileCollection();
        this.profiles_.fetch({
          add: true,
          success: function() {
            return _this.app.vent.trigger('Profiles:Loaded');
          }
        });
        $('#new-profile-nav').on('click', function() {
          _this.app.vent.trigger('Nav:NewProfile');
          return false;
        });
        return this.app.vent.on('Nav:NewProfile', function() {
          var modal, model;
          model = new ProfileModel();
          options = {
            application: _this.app,
            model: model
          };
          modal = new ProfileModalView(options);
          return _this.app.layout.modal.show(modal);
        });
      };

      ProfileController.prototype.activateProfile = function(id, state) {
        var activeSensor, oldState,
          _this = this;
        activeSensor = null;
        oldState = !state;
        this.profiles_.each(function(profile) {
          var thisId;
          thisId = profile.get('_id');
          if (id === thisId) return activeSensor = profile.get('sensor');
        });
        return this.profiles_.each(function(profile) {
          var save, thisId, thisSensor;
          thisId = profile.get('_id');
          thisSensor = profile.get('sensor');
          save = false;
          if (id === thisId) {
            profile.set('active', state);
            save = true;
          } else if (activeSensor === thisSensor) {
            profile.set('active', oldState);
            save = true;
          }
          if (save) {
            profile.once('sync', function() {
              return _this.app.vent.trigger('Profile:Modified');
            });
            return profile.save();
          }
        });
      };

      ProfileController.prototype.setupSockets = function() {
        var _this = this;
        this.socket_ = io.connect('http://graphite:6001');
        this.socket_.on('config', function(config) {
          _this.config_ = config;
          return _this.app.vent.trigger('Socket:Config', config);
        });
        this.socket_.on('pv', function(data) {
          return _this.app.vent.trigger('Socket:PV', data);
        });
        this.socket_.on('setsv', function(data) {
          return _this.app.vent.trigger('Socket:SV', data);
        });
        this.socket_.on('mode', function(data) {
          return _this.app.vent.trigger('Socket:Mode', data);
        });
        this.socket_.on('getgpio', function(data) {
          return _this.app.vent.trigger('Heater:State', data);
        });
        this.socket_.on('setgpio', function(data) {
          return _this.app.vent.trigger('Heater:Changed', data);
        });
        return this.socket_.emit('config');
      };

      return ProfileController;

    })(Backbone.Marionette.Controller);

  }).call(this);
  
});
window.require.register("initialize", function(exports, require, module) {
  (function() {
    var application;

    application = require('application');

    $(function() {
      window.RpiApp = application;
      return application.initialize();
    });

  }).call(this);
  
});
window.require.register("lib/config", function(exports, require, module) {
  (function() {

    module.exports = {
      modelRoot: 'http://graphite:3010'
    };

  }).call(this);
  
});
window.require.register("lib/graph", function(exports, require, module) {
  (function() {
    var Graph, Graphene,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    Graphene = require('lib/graphene');

    module.exports = Graph = (function() {

      Graph.prototype.description_ = {};

      Graph.prototype.graphiteUrl_ = 'http://graphite';

      Graph.prototype.graphene_ = null;

      function Graph() {
        this.createView = __bind(this.createView, this);      this.graphene_ = new Graphene();
        return;
      }

      Graph.prototype.createView = function(name, gauge, sample) {
        var desc, div, model_opts, opts, sampleRange, sourceUrl, targets, ts, view, ymin;
        sampleRange = name + '&from=-' + sample + 'hours&until=now';
        targets = 'target=stats.gauges.' + gauge + '&target=stats.gauges.ambient';
        sourceUrl = this.graphiteUrl_ + '/render?' + targets + '&title=' + sampleRange + '&format=json';
        div = '#' + gauge;
        desc = {};
        model_opts = {
          source: sourceUrl,
          refresh_interval: 10000
        };
        ts = new Graphene.TimeSeries(model_opts);
        ymin = 59;
        opts = {
          model: ts,
          ymin: ymin,
          ymax: this.graphene_.getUrlParam(sourceUrl, "yMax")
        };
        view = new Graphene.TimeSeriesView(_.extend(opts, desc));
        ts.start();
        return view;
      };

      return Graph;

    })();

  }).call(this);
  
});
window.require.register("lib/graphene", function(exports, require, module) {
  (function() {
    var Graphene,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = Graphene = (function() {

      function Graphene() {
        this.build = __bind(this.build, this);
      }

      Graphene.prototype.debug_ = false;

      Graphene.prototype.demo = function() {
        return this.is_demo = true;
      };

      Graphene.prototype.build = function(json) {
        var _this = this;
        return _.each(_.keys(json), function(k) {
          var klass, model_opts, ts;
          if (_this.debug_) console.log("building [" + k + "]");
          if (_this.is_demo) {
            klass = Graphene.DemoTimeSeries;
          } else {
            klass = Graphene.TimeSeries;
          }
          model_opts = {
            source: json[k].source
          };
          delete json[k].source;
          if (json[k].refresh_interval) {
            model_opts.refresh_interval = json[k].refresh_interval;
            delete json[k].refresh_interval;
          }
          ts = new klass(model_opts);
          return _.each(json[k], function(opts, view) {
            klass = eval("Graphene." + view + "View");
            if (_this.debug_) {
              console.log(_.extend({
                model: ts,
                ymin: _this.getUrlParam(model_opts.source, "yMin"),
                ymax: _this.getUrlParam(model_opts.source, "yMax")
              }, opts));
            }
            new klass(_.extend({
              model: ts,
              ymin: _this.getUrlParam(model_opts.source, "yMin"),
              ymax: _this.getUrlParam(model_opts.source, "yMax")
            }, opts));
            return ts.start();
          });
        });
      };

      Graphene.prototype.discover = function(url, dash, parent_specifier, cb) {
        return $.getJSON("" + url + "/dashboard/load/" + dash, function(data) {
          var desc, i;
          i = 0;
          desc = {};
          _.each(data['state']['graphs'], function(graph) {
            var conf, path, title;
            path = graph[2];
            conf = graph[1];
            title = conf.title ? conf.title : "n/a";
            desc["Graph " + i] = {
              source: "" + url + path + "&format=json",
              TimeSeries: {
                title: title,
                ymin: conf.yMin,
                parent: parent_specifier(i, url)
              }
            };
            return i++;
          });
          return cb(desc);
        });
      };

      Graphene.prototype.getUrlParam = function(url, variable) {
        var query, value, vars;
        value = '';
        query = url.split('?')[1];
        if (!query) return value;
        vars = query.split('&');
        if (!(vars && vars.length > 0)) return value;
        _.each(vars, function(v) {
          var pair;
          pair = v.split('=');
          if (decodeURIComponent(pair[0]) === variable) {
            return value = decodeURIComponent(pair[1]);
          }
        });
        return value;
      };

      return Graphene;

    })();

    this.Graphene = Graphene;

    Graphene.GraphiteModel = (function(_super) {

      __extends(GraphiteModel, _super);

      function GraphiteModel() {
        this.process_data = __bind(this.process_data, this);
        this.refresh = __bind(this.refresh, this);
        this.stop = __bind(this.stop, this);
        this.start = __bind(this.start, this);
        GraphiteModel.__super__.constructor.apply(this, arguments);
      }

      GraphiteModel.prototype.defaults = {
        source: '',
        data: null,
        ymin: 0,
        ymax: 0,
        refresh_interval: 10000
      };

      GraphiteModel.prototype.debug = function() {
        return console.log("" + (this.get('refresh_interval')));
      };

      GraphiteModel.prototype.start = function() {
        this.refresh();
        if (this.debug_) {
          console.log("Starting to poll at " + (this.get('refresh_interval')));
        }
        return this.t_index = setInterval(this.refresh, this.get('refresh_interval'));
      };

      GraphiteModel.prototype.stop = function() {
        return clearInterval(this.t_index);
      };

      GraphiteModel.prototype.refresh = function() {
        var options, url,
          _this = this;
        url = this.get('source');
        if (-1 === url.indexOf('&jsonp=?')) url = url + '&jsonp=?';
        options = {
          url: url,
          dataType: 'json',
          jsonp: 'jsonp',
          success: function(js) {
            if (_this.debug_) console.log("got data.");
            return _this.process_data(js);
          }
        };
        return $.ajax(options);
      };

      GraphiteModel.prototype.process_data = function() {
        return null;
      };

      return GraphiteModel;

    })(Backbone.Model);

    Graphene.DemoTimeSeries = (function(_super) {

      __extends(DemoTimeSeries, _super);

      function DemoTimeSeries() {
        this.add_points = __bind(this.add_points, this);
        this.refresh = __bind(this.refresh, this);
        this.stop = __bind(this.stop, this);
        this.start = __bind(this.start, this);
        DemoTimeSeries.__super__.constructor.apply(this, arguments);
      }

      DemoTimeSeries.prototype.defaults = {
        range: [0, 1000],
        num_points: 100,
        num_new_points: 1,
        num_series: 2,
        refresh_interval: 3000
      };

      DemoTimeSeries.prototype.debug = function() {
        return console.log("" + (this.get('refresh_interval')));
      };

      DemoTimeSeries.prototype.start = function() {
        var _this = this;
        if (this.debug_) {
          console.log("Starting to poll at " + (this.get('refresh_interval')));
        }
        this.data = [];
        _.each(_.range(this.get('num_series')), function(i) {
          return _this.data.push({
            label: "Series " + i,
            ymin: 0,
            ymax: 0,
            points: []
          });
        });
        this.point_interval = this.get('refresh_interval') / this.get('num_new_points');
        _.each(this.data, function(d) {
          return _this.add_points(new Date(), _this.get('range'), _this.get('num_points'), _this.point_interval, d);
        });
        this.set({
          data: this.data
        });
        return this.t_index = setInterval(this.refresh, this.get('refresh_interval'));
      };

      DemoTimeSeries.prototype.stop = function() {
        return clearInterval(this.t_index);
      };

      DemoTimeSeries.prototype.refresh = function() {
        var last, num_new_points, start_date,
          _this = this;
        this.data = _.map(this.data, function(d) {
          d = _.clone(d);
          d.points = _.map(d.points, function(p) {
            return [p[0], p[1]];
          });
          return d;
        });
        last = this.data[0].points.pop();
        this.data[0].points.push(last);
        start_date = last[1];
        num_new_points = this.get('num_new_points');
        _.each(this.data, function(d) {
          return _this.add_points(start_date, _this.get('range'), num_new_points, _this.point_interval, d);
        });
        return this.set({
          data: this.data
        });
      };

      DemoTimeSeries.prototype.add_points = function(start_date, range, num_new_points, point_interval, d) {
        var _this = this;
        _.each(_.range(num_new_points), function(i) {
          var new_point;
          new_point = [range[0] + Math.random() * (range[1] - range[0]), new Date(start_date.getTime() + (i + 1) * point_interval)];
          d.points.push(new_point);
          if (d.points.length > _this.get('num_points')) return d.points.shift();
        });
        d.ymin = d3.min(d.points, function(d) {
          return d[0];
        });
        return d.ymax = d3.max(d.points, function(d) {
          return d[0];
        });
      };

      return DemoTimeSeries;

    })(Backbone.Model);

    Graphene.BarChart = (function(_super) {

      __extends(BarChart, _super);

      function BarChart() {
        this.process_data = __bind(this.process_data, this);
        BarChart.__super__.constructor.apply(this, arguments);
      }

      BarChart.prototype.process_data = function(js) {
        var data;
        if (this.debug_) console.log('process data barchart');
        data = _.map(js, function(dp) {
          var max, min;
          min = d3.min(dp.datapoints, function(d) {
            return d[0];
          });
          if (min === void 0) return null;
          max = d3.max(dp.datapoints, function(d) {
            return d[0];
          });
          if (max === void 0) return null;
          _.each(dp.datapoints, function(d) {
            return d[1] = new Date(d[1] * 1000);
          });
          return {
            points: _.reject(dp.datapoints, function(d) {
              return d[0] === null;
            }),
            ymin: min,
            ymax: max,
            label: dp.target
          };
        });
        data = _.reject(data, function(d) {
          return d === null;
        });
        return this.set({
          data: data
        });
      };

      return BarChart;

    })(Graphene.GraphiteModel);

    Graphene.TimeSeries = (function(_super) {

      __extends(TimeSeries, _super);

      function TimeSeries() {
        this.process_data = __bind(this.process_data, this);
        TimeSeries.__super__.constructor.apply(this, arguments);
      }

      TimeSeries.prototype.process_data = function(js) {
        var data;
        data = _.map(js, function(dp) {
          var last, max, min, _ref;
          min = d3.min(dp.datapoints, function(d) {
            return d[0];
          });
          if (min === void 0) return null;
          max = d3.max(dp.datapoints, function(d) {
            return d[0];
          });
          if (max === void 0) return null;
          last = (_ref = _.last(dp.datapoints)[0]) != null ? _ref : 0;
          if (last === void 0) return null;
          _.each(dp.datapoints, function(d) {
            return d[1] = new Date(d[1] * 1000);
          });
          return {
            points: _.reject(dp.datapoints, function(d) {
              return d[0] === null;
            }),
            ymin: min,
            ymax: max,
            last: last,
            label: dp.target
          };
        });
        data = _.reject(data, function(d) {
          return d === null;
        });
        return this.set({
          data: data
        });
      };

      return TimeSeries;

    })(Graphene.GraphiteModel);

    Graphene.GaugeGadgetView = (function(_super) {

      __extends(GaugeGadgetView, _super);

      function GaugeGadgetView() {
        this.render = __bind(this.render, this);
        this.by_type = __bind(this.by_type, this);
        GaugeGadgetView.__super__.constructor.apply(this, arguments);
      }

      GaugeGadgetView.prototype.className = 'gauge-gadget-view';

      GaugeGadgetView.prototype.tagName = 'div';

      GaugeGadgetView.prototype.initialize = function() {
        var config;
        this.title = this.options.title;
        this.type = this.options.type;
        this.parent = this.options.parent || '#parent';
        this.value_format = this.options.value_format || ".3s";
        this.null_value = 0;
        this.from = this.options.from || 0;
        this.to = this.options.to || 100;
        this.observer = this.options.observer;
        this.vis = d3.select(this.parent).append("div").attr("class", "ggview").attr("id", this.title + "GaugeContainer");
        config = {
          size: this.options.size || 120,
          label: this.title,
          minorTicks: 5,
          min: this.from,
          max: this.to
        };
        config.redZones = [];
        config.redZones.push({
          from: this.options.red_from || 0.9 * this.to,
          to: this.options.red_to || this.to
        });
        config.yellowZones = [];
        config.yellowZones.push({
          from: this.options.yellow_from || 0.75 * this.to,
          to: this.options.yellow_to || 0.9 * this.to
        });
        this.gauge = new Gauge("" + this.title + "GaugeContainer", config);
        this.gauge.render();
        this.model.bind('change', this.render);
        return console.log("GG view ");
      };

      GaugeGadgetView.prototype.by_type = function(d) {
        switch (this.type) {
          case "min":
            return d.ymin;
          case "max":
            return d.ymax;
          case "current":
            return d.last;
          default:
            return d.points[0][0];
        }
      };

      GaugeGadgetView.prototype.render = function() {
        var data, datum;
        if (this.debug_) console.log("rendering.");
        data = this.model.get('data');
        datum = data && data.length > 0 ? data[0] : {
          ymax: this.null_value,
          ymin: this.null_value,
          points: [[this.null_value, 0]]
        };
        if (this.observer) this.observer(this.by_type(datum));
        return this.gauge.redraw(this.by_type(datum), this.value_format);
      };

      return GaugeGadgetView;

    })(Backbone.View);

    Graphene.GaugeLabelView = (function(_super) {

      __extends(GaugeLabelView, _super);

      function GaugeLabelView() {
        this.render = __bind(this.render, this);
        this.by_type = __bind(this.by_type, this);
        GaugeLabelView.__super__.constructor.apply(this, arguments);
      }

      GaugeLabelView.prototype.className = 'gauge-label-view';

      GaugeLabelView.prototype.tagName = 'div';

      GaugeLabelView.prototype.initialize = function() {
        this.unit = this.options.unit;
        this.title = this.options.title;
        this.type = this.options.type;
        this.parent = this.options.parent || '#parent';
        this.value_format = this.options.value_format || ".3s";
        this.value_format = d3.format(this.value_format);
        this.null_value = 0;
        this.observer = this.options.observer;
        this.vis = d3.select(this.parent).append("div").attr("class", "glview");
        if (this.title) {
          this.vis.append("div").attr("class", "label").text(this.title);
        }
        this.model.bind('change', this.render);
        if (this.debug_) return console.log("GL view ");
      };

      GaugeLabelView.prototype.by_type = function(d) {
        switch (this.type) {
          case "min":
            return d.ymin;
          case "max":
            return d.ymax;
          case "current":
            return d.last;
          default:
            return d.points[0][0];
        }
      };

      GaugeLabelView.prototype.render = function() {
        var data, datum, metric, metric_items, vis,
          _this = this;
        data = this.model.get('data');
        if (this.debug_) console.log(data);
        datum = data && data.length > 0 ? data[0] : {
          ymax: this.null_value,
          ymin: this.null_value,
          points: [[this.null_value, 0]]
        };
        if (this.observer) this.observer(this.by_type(datum));
        vis = this.vis;
        metric_items = vis.selectAll('div.metric').data([datum], function(d) {
          return _this.by_type(d);
        });
        metric_items.exit().remove();
        metric = metric_items.enter().insert('div', ":first-child").attr('class', "metric" + (this.type ? ' ' + this.type : ''));
        metric.append('span').attr('class', 'value').text(function(d) {
          return _this.value_format(_this.by_type(d));
        });
        if (this.unit) {
          return metric.append('span').attr('class', 'unit').text(this.unit);
        }
      };

      return GaugeLabelView;

    })(Backbone.View);

    Graphene.TimeSeriesView = (function(_super) {

      __extends(TimeSeriesView, _super);

      function TimeSeriesView() {
        this.render = __bind(this.render, this);
        TimeSeriesView.__super__.constructor.apply(this, arguments);
      }

      TimeSeriesView.prototype.tagName = 'div';

      TimeSeriesView.prototype.initialize = function() {
        this.line_height = this.options.line_height || 16;
        this.animate_ms = this.options.animate_ms || 500;
        this.num_labels = this.options.num_labels || 3;
        this.sort_labels = this.options.labels_sort;
        this.display_verticals = this.options.display_verticals || false;
        this.width = this.options.width || 400;
        this.height = this.options.height || 100;
        this.padding = this.options.padding || [this.line_height * 2, 32, this.line_height * (3 + this.num_labels), 32];
        this.title = this.options.title;
        this.label_formatter = this.options.label_formatter || function(label) {
          return label;
        };
        this.firstrun = true;
        this.parent = this.options.parent || '#parent';
        this.null_value = 0;
        this.show_current = this.options.show_current || false;
        this.observer = this.options.observer;
        this.vis = d3.select(this.el).append("svg").attr("class", "tsview").attr("width", this.width + (this.padding[1] + this.padding[3])).attr("height", this.height + (this.padding[0] + this.padding[2])).append("g").attr("transform", "translate(" + this.padding[3] + "," + this.padding[0] + ")");
        this.value_format = this.options.value_format || ".3s";
        this.value_format = d3.format(this.value_format);
        this.model.bind('change', this.render);
        if (this.debug_) {
          return console.log("TS view: " + this.width + "x" + this.height + " padding:" + this.padding + " animate: " + this.animate_ms + " labels: " + this.num_labels);
        }
      };

      TimeSeriesView.prototype.render = function() {
        var area, d, data, dmax, dmin, leg_items, line, litem_enters, litem_enters_text, order, points, title, vis, x, xAxis, xmax, xmin, xpoints, xtick_sz, y, yAxis, _ref,
          _this = this;
        if (this.debug_) console.log("rendering.");
        data = this.model.get('data');
        data = data && data.length > 0 ? data : [
          {
            ymax: this.null_value,
            ymin: this.null_value,
            points: [[this.null_value, 0], [this.null_value, 0]]
          }
        ];
        dmax = _.max(data, function(d) {
          return d.ymax;
        });
        dmax.ymax_graph = this.options.ymax || dmax.ymax;
        dmin = _.min(data, function(d) {
          return d.ymin;
        });
        dmin.ymin_graph = (_ref = this.options.ymin) != null ? _ref : dmin.ymin;
        xpoints = _.flatten((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            d = data[_i];
            _results.push(d.points.map(function(p) {
              return p[1];
            }));
          }
          return _results;
        })());
        xmin = _.min(xpoints, function(x) {
          return x.valueOf();
        });
        xmax = _.max(xpoints, function(x) {
          return x.valueOf();
        });
        x = d3.time.scale().domain([xmin, xmax]).range([0, this.width]);
        y = d3.scale.linear().domain([dmin.ymin_graph, dmax.ymax_graph]).range([this.height, 0]).nice();
        xtick_sz = this.display_verticals ? -this.height : 0;
        xAxis = d3.svg.axis().scale(x).ticks(4).tickSize(xtick_sz).tickSubdivide(true);
        yAxis = d3.svg.axis().scale(y).ticks(4).tickSize(-this.width).orient("left").tickFormat(d3.format("s"));
        vis = this.vis;
        line = d3.svg.line().x(function(d) {
          return x(d[1]);
        }).y(function(d) {
          return y(d[0]);
        });
        area = d3.svg.area().x(function(d) {
          return x(d[1]);
        }).y0(this.height - 1).y1(function(d) {
          return y(d[0]);
        });
        if (this.sort_labels) {
          order = this.sort_labels === 'desc' ? -1 : 1;
          data = _.sortBy(data, function(d) {
            return order * d.ymax;
          });
        }
        if (this.observer) this.observer(data);
        points = _.map(data, function(d) {
          return d.points;
        });
        if (this.firstrun) {
          this.firstrun = false;
          vis.append("svg:g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").transition().duration(this.animate_ms).call(xAxis);
          vis.append("svg:g").attr("class", "y axis").call(yAxis);
          vis.selectAll("path.line").data(points).enter().append('path').attr("d", line).attr('class', function(d, i) {
            return 'line ' + ("h-col-" + (i + 1));
          });
          vis.selectAll("path.area").data(points).enter().append('path').attr("d", area).attr('class', function(d, i) {
            return 'area ' + ("h-col-" + (i + 1));
          });
          if (this.title) {
            title = vis.append('svg:text').attr('class', 'title').attr('transform', "translate(0, -" + this.line_height + ")").text(this.title);
          }
          this.legend = vis.append('svg:g').attr('transform', "translate(0, " + (this.height + this.line_height * 2) + ")").attr('class', 'legend');
        }
        leg_items = this.legend.selectAll('g.l').data(_.first(data, this.num_labels), function(d) {
          return Math.random();
        });
        leg_items.exit().remove();
        litem_enters = leg_items.enter().append('svg:g').attr('transform', function(d, i) {
          return "translate(0, " + (i * _this.line_height) + ")";
        }).attr('class', 'l');
        litem_enters.append('svg:rect').attr('width', 5).attr('height', 5).attr('class', function(d, i) {
          return 'ts-color ' + ("h-col-" + (i + 1));
        });
        litem_enters_text = litem_enters.append('svg:text').attr('dx', 10).attr('dy', 6).attr('class', 'ts-text').text(function(d) {
          return _this.label_formatter(d.label);
        });
        litem_enters_text.append('svg:tspan').attr('class', 'min-tag').attr('dx', 10).text(function(d) {
          return _this.value_format(d.ymin) + "min";
        });
        litem_enters_text.append('svg:tspan').attr('class', 'max-tag').attr('dx', 2).text(function(d) {
          return _this.value_format(d.ymax) + "max";
        });
        if (this.show_current === true) {
          litem_enters_text.append('svg:tspan').attr('class', 'last-tag').attr('dx', 2).text(function(d) {
            return _this.value_format(d.last) + "last";
          });
        }
        vis.transition().ease("linear").duration(this.animate_ms).select(".x.axis").call(xAxis);
        vis.select(".y.axis").call(yAxis);
        vis.selectAll("path.area").data(points).attr("d", area).transition().ease("linear").duration(this.animate_ms);
        return vis.selectAll("path.line").data(points).attr("d", line).transition().ease("linear").duration(this.animate_ms);
      };

      return TimeSeriesView;

    })(Backbone.View);

    Graphene.BarChartView = (function(_super) {

      __extends(BarChartView, _super);

      function BarChartView() {
        this.render = __bind(this.render, this);
        BarChartView.__super__.constructor.apply(this, arguments);
      }

      BarChartView.prototype.tagName = 'div';

      BarChartView.prototype.initialize = function() {
        this.line_height = this.options.line_height || 16;
        this.animate_ms = this.options.animate_ms || 500;
        this.num_labels = this.options.labels || 3;
        this.sort_labels = this.options.labels_sort || 'desc';
        this.display_verticals = this.options.display_verticals || false;
        this.width = this.options.width || 400;
        this.height = this.options.height || 100;
        this.padding = this.options.padding || [this.line_height * 2, 32, this.line_height * (3 + this.num_labels), 32];
        this.title = this.options.title;
        this.label_formatter = this.options.label_formatter || function(label) {
          return label;
        };
        this.firstrun = true;
        this.parent = this.options.parent || '#parent';
        this.null_value = 0;
        this.vis = d3.select(this.parent).append("svg").attr("class", "tsview").attr("width", this.width + (this.padding[1] + this.padding[3])).attr("height", this.height + (this.padding[0] + this.padding[2])).append("g").attr("transform", "translate(" + this.padding[3] + "," + this.padding[0] + ")");
        this.bar_width = Math.min(this.options.bar_width, 1) || 0.50;
        return this.model.bind('change', this.render);
      };

      BarChartView.prototype.render = function() {
        var calculate_bar_width, canvas_height, data, dmax, dmin, points, vis, x, xAxis, xtick_sz, y, yAxis;
        data = this.model.get('data');
        dmax = _.max(data, function(d) {
          return d.ymax;
        });
        dmin = _.min(data, function(d) {
          return d.ymin;
        });
        data = _.sortBy(data, function(d) {
          return 1 * d.ymax;
        });
        points = _.map(data, function(d) {
          return d.points;
        });
        calculate_bar_width = function(points, width, scale) {
          if (scale == null) scale = 1;
          console.log(scale);
          return (width / points[0].length) * scale;
        };
        x = d3.time.scale().domain([data[0].points[0][1], data[0].points[data[0].points.length - 1][1]]).range([0, this.width - calculate_bar_width(points, this.width)]);
        y = d3.scale.linear().domain([dmin.ymin, dmax.ymax]).range([this.height, 0]).nice();
        xtick_sz = this.display_verticals ? -this.height : 0;
        xAxis = d3.svg.axis().scale(x).ticks(4).tickSize(xtick_sz).tickSubdivide(true);
        yAxis = d3.svg.axis().scale(y).ticks(4).tickSize(-this.width).orient("left").tickFormat(d3.format("s"));
        vis = this.vis;
        vis.append("svg:g").attr("class", "x axis").attr("transform", "translate(0," + this.height + ")").transition().duration(this.animate_ms).call(xAxis);
        vis.append("svg:g").attr("class", "y axis").call(yAxis);
        canvas_height = this.height;
        if (this.firstrun) {
          this.firstrun = false;
          vis.selectAll("rect").remove();
          vis.selectAll("rect").data(points[0]).enter().append("rect").attr("x", function(d, i) {
            console.log(x(d[1]));
            return x(d[1]);
          }).attr("y", function(d, i) {
            return canvas_height - (canvas_height - y(d[0]));
          }).attr("width", calculate_bar_width(points, this.width, this.bar_width)).attr("height", function(d, i) {
            return canvas_height - y(d[0]);
          }).attr("class", "h-col-1 area");
        }
        vis.selectAll("rect").data(points[0]).transition().ease("linear").duration(250).attr("x", function(d, i) {
          return x(d[1]);
        }).attr("y", function(d, i) {
          return canvas_height - (canvas_height - y(d[0]));
        }).attr("width", calculate_bar_width(points, this.width, this.bar_width)).attr("height", function(d, i) {
          return canvas_height - y(d[0]);
        }).attr("class", "h-col-1 area");
        vis.transition().ease("linear").duration(this.animate_ms).select(".x.axis").call(xAxis);
        vis.select(".y.axis").call(yAxis);
        if (this.debug_) return console.log("done drawing");
      };

      return BarChartView;

    })(Backbone.View);

  }).call(this);
  
});
window.require.register("lib/router", function(exports, require, module) {
  (function() {
    var HomeLayout, ProfileDetailView, ProfileModel, ProfilesLayout, Router,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    HomeLayout = require('views/HomeLayout');

    ProfilesLayout = require('views/ProfilesLayout');

    ProfileDetailView = require('views/ProfileDetailView');

    ProfileModel = require('models/profileModel');

    module.exports = Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        this.profile = __bind(this.profile, this);
        this.profiles = __bind(this.profiles, this);
        this.home = __bind(this.home, this);
        Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        '': 'home',
        'profiles': 'profiles',
        'profile/:id': 'profile'
      };

      Router.prototype.home = function() {
        var home, options;
        options = {
          application: window.RpiApp
        };
        home = new HomeLayout(options);
        window.RpiApp.layout.content.close();
        window.RpiApp.layout.content.show(home);
        if (window.RpiApp.controller_.config_ !== void 0) {
          return home.createCollection(window.RpiApp.controller_.config_);
        }
      };

      Router.prototype.profiles = function() {
        var options, profiles;
        options = {
          application: window.RpiApp
        };
        profiles = new ProfilesLayout(options);
        window.RpiApp.layout.content.close();
        window.RpiApp.layout.content.show(profiles);
        return profiles.showProfiles();
      };

      Router.prototype.profile = function(id) {
        var fetchSuccessHandler, model,
          _this = this;
        model = new ProfileModel({
          _id: id
        });
        fetchSuccessHandler = function(profile, res, opts) {
          var options, view;
          options = {
            application: window.RpiApp,
            model: profile
          };
          view = new ProfileDetailView(options);
          window.RpiApp.layout.content.close();
          return window.RpiApp.layout.content.show(view);
        };
        model.fetch({
          success: fetchSuccessHandler
        });
      };

      return Router;

    })(Backbone.Router);

  }).call(this);
  
});
window.require.register("lib/view_helper", function(exports, require, module) {
  (function() {

    Handlebars.registerHelper('pick', function(val, options) {
      return options.hash[val];
    });

    Handlebars.registerHelper('select', function(value, options) {
      var $el;
      $el = $('<select />').html(options.fn(this));
      $el.find('[value=' + value + ']').attr({
        'selected': 'selected'
      });
      return $el.html();
    });

    Handlebars.registerHelper('sensorList', function(value, options) {
      var markup, selected, sensor;
      markup = '';
      sensor = (function() {
        var _i, _len, _ref, _results;
        _ref = window.RpiApp.controller_.config_.sensors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sensor = _ref[_i];
          if (sensor.type === 'fermenter') {
            selected = '';
            if (value === sensor.name) selected = ' selected="selected"';
            _results.push(markup = markup + '<option value="' + sensor.name + '"' + selected + '>' + sensor.label + '</option>');
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      })();
      return markup;
    });

    Handlebars.registerHelper('profileList', function(value, options) {
      var markup,
        _this = this;
      markup = '';
      window.RpiApp.controller_.profiles_.each(function(profile) {
        var id, name, selected;
        id = profile.get('_id');
        name = profile.get('name');
        selected = '';
        if (value === id) selected = ' selected="selected"';
        return markup = markup + '<option value="' + id + '"' + selected + '>' + name + '</option>';
      });
      return markup;
    });

  }).call(this);
  
});
window.require.register("models/collection", function(exports, require, module) {
  (function() {
    var Collection,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      return Collection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("models/graphCollection", function(exports, require, module) {
  (function() {
    var GraphCollection, GraphModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    GraphModel = require('models/graphModel');

    module.exports = GraphCollection = (function(_super) {

      __extends(GraphCollection, _super);

      function GraphCollection() {
        GraphCollection.__super__.constructor.apply(this, arguments);
      }

      GraphCollection.prototype.model = GraphModel;

      return GraphCollection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("models/graphModel", function(exports, require, module) {
  (function() {
    var GraphModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = GraphModel = (function(_super) {

      __extends(GraphModel, _super);

      function GraphModel() {
        GraphModel.__super__.constructor.apply(this, arguments);
      }

      return GraphModel;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("models/heaterModel", function(exports, require, module) {
  (function() {
    var HeaterModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = HeaterModel = (function(_super) {

      __extends(HeaterModel, _super);

      function HeaterModel() {
        HeaterModel.__super__.constructor.apply(this, arguments);
      }

      HeaterModel.prototype.defaults = {
        fermenterId: '',
        state: 'off'
      };

      return HeaterModel;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("models/model", function(exports, require, module) {
  (function() {
    var Model,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      return Model;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("models/profileCollection", function(exports, require, module) {
  (function() {
    var ProfileCollection, ProfileModel, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    config = require('lib/config');

    ProfileModel = require('models/profileModel');

    module.exports = ProfileCollection = (function(_super) {

      __extends(ProfileCollection, _super);

      function ProfileCollection() {
        ProfileCollection.__super__.constructor.apply(this, arguments);
      }

      ProfileCollection.prototype.url = config.modelRoot + '/profiles';

      ProfileCollection.prototype.model = ProfileModel;

      return ProfileCollection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("models/profileModel", function(exports, require, module) {
  (function() {
    var ProfileModel, config,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    config = require('lib/config');

    module.exports = ProfileModel = (function(_super) {

      __extends(ProfileModel, _super);

      function ProfileModel() {
        ProfileModel.__super__.constructor.apply(this, arguments);
      }

      ProfileModel.prototype.urlRoot = config.modelRoot + '/profiles';

      ProfileModel.prototype.idAttribute = '_id';

      ProfileModel.prototype.defaults = {
        name: 'Fermentation Profile',
        control_mode: 'manual',
        sensor: 'fermenter_1',
        start_time: null,
        active: false,
        steps: [
          {
            name: 'Fermentation Step',
            duration: 7,
            temperature: 65,
            unit: 'days',
            order: 1
          }
        ],
        overrides: []
      };

      return ProfileModel;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("models/sampleModel", function(exports, require, module) {
  (function() {
    var SampleModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = SampleModel = (function(_super) {

      __extends(SampleModel, _super);

      function SampleModel() {
        SampleModel.__super__.constructor.apply(this, arguments);
      }

      SampleModel.prototype.defaults = {
        fermenterId: '',
        range: [72, 48, 24, 12, 8, 6, 4, 3, 2, 1],
        unit: 'H',
        current: 24
      };

      return SampleModel;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("models/stepCollection", function(exports, require, module) {
  (function() {
    var StepCollection, StepModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    StepModel = require('models/stepModel');

    module.exports = StepCollection = (function(_super) {

      __extends(StepCollection, _super);

      function StepCollection() {
        StepCollection.__super__.constructor.apply(this, arguments);
      }

      StepCollection.prototype.model = StepModel;

      return StepCollection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("models/stepModel", function(exports, require, module) {
  (function() {
    var StepModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = StepModel = (function(_super) {

      __extends(StepModel, _super);

      function StepModel() {
        StepModel.__super__.constructor.apply(this, arguments);
      }

      StepModel.prototype.idAttribute = '_id';

      StepModel.prototype.defaults = {
        name: 'Fermentation Step',
        duration: 7,
        temperature: 65,
        unit: 'days',
        order: 1,
        profile: {}
      };

      return StepModel;

    })(Backbone.Model);

  }).call(this);
  
});
window.require.register("views/AppLayout", function(exports, require, module) {
  (function() {
    var AppLayout, ModalRegion, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ModalRegion = require('views/ModalRegion');

    template = require('views/templates/appLayout');

    module.exports = AppLayout = (function(_super) {

      __extends(AppLayout, _super);

      function AppLayout() {
        AppLayout.__super__.constructor.apply(this, arguments);
      }

      AppLayout.prototype.template = template;

      AppLayout.prototype.el = "body";

      AppLayout.prototype.regions = {
        nav: "#nav",
        content: "#content",
        modal: ModalRegion
      };

      return AppLayout;

    })(Backbone.Marionette.Layout);

  }).call(this);
  
});
window.require.register("views/FermentationStepModalView", function(exports, require, module) {
  (function() {
    var FermentationStepModalView, StepModel, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/fermentationStepModal');

    StepModel = require('models/stepModel');

    module.exports = FermentationStepModalView = (function(_super) {

      __extends(FermentationStepModalView, _super);

      function FermentationStepModalView() {
        this.saveStep = __bind(this.saveStep, this);
        FermentationStepModalView.__super__.constructor.apply(this, arguments);
      }

      FermentationStepModalView.prototype.id = 'step-modal-view';

      FermentationStepModalView.prototype.template = template;

      FermentationStepModalView.prototype.profile_ = {};

      FermentationStepModalView.prototype.events = {
        'click #save-step': 'saveStep'
      };

      FermentationStepModalView.prototype.initialize = function(options) {
        this.profile_ = options.profile;
        return this.app = options.application;
      };

      FermentationStepModalView.prototype.saveStep = function(e) {
        var step, steps,
          _this = this;
        step = {
          name: $('#step-input-name').val(),
          duration: $('#step-input-duration').val(),
          temperature: $('#step-input-temperature').val(),
          order: $('#step-input-order').val()
        };
        steps = this.profile_.get('steps');
        steps[step.order - 1] = step;
        this.profile_.set({
          steps: steps
        });
        this.profile_.once('sync', function() {
          return _this.app.vent.trigger('Profile:Modified');
        });
        this.profile_.save();
        return this.app.layout.modal.close();
      };

      return FermentationStepModalView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/FermentationStepView", function(exports, require, module) {
  (function() {
    var FermentationStepModalView, FermentationStepView, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/step');

    FermentationStepModalView = require('views/FermentationStepModalView');

    module.exports = FermentationStepView = (function(_super) {

      __extends(FermentationStepView, _super);

      function FermentationStepView() {
        this.deleteStep = __bind(this.deleteStep, this);
        this.editStep = __bind(this.editStep, this);
        this.initialize = __bind(this.initialize, this);
        FermentationStepView.__super__.constructor.apply(this, arguments);
      }

      FermentationStepView.prototype.template = template;

      FermentationStepView.prototype.events = {
        'click .edit-step': 'editStep',
        'click .delete-step': 'deleteStep'
      };

      FermentationStepView.prototype.initialize = function(options) {
        return this.app = options.application;
      };

      FermentationStepView.prototype.editStep = function(e) {
        var modal, options;
        options = {
          profile: this.model.get('profile'),
          model: this.model,
          application: this.app
        };
        modal = new FermentationStepModalView(options);
        this.app.layout.modal.show(modal);
        return false;
      };

      FermentationStepView.prototype.deleteStep = function(e) {
        var position, profile, steps,
          _this = this;
        profile = this.model.get('profile');
        steps = profile.get('steps');
        position = this.model.get('order');
        steps.splice(position - 1, 1);
        profile.set('steps', steps);
        profile.once('sync', function() {
          return _this.app.vent.trigger('Profile:Modified');
        });
        profile.save();
        return false;
      };

      return FermentationStepView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/GraphCollectionView", function(exports, require, module) {
  (function() {
    var GraphCollectionView, GraphLayout, application,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    GraphLayout = require('views/GraphLayout');

    module.exports = GraphCollectionView = (function(_super) {

      __extends(GraphCollectionView, _super);

      function GraphCollectionView() {
        GraphCollectionView.__super__.constructor.apply(this, arguments);
      }

      GraphCollectionView.prototype.tagName = 'div';

      GraphCollectionView.prototype.itemView = GraphLayout;

      return GraphCollectionView;

    })(Backbone.Marionette.CollectionView);

  }).call(this);
  
});
window.require.register("views/GraphLayout", function(exports, require, module) {
  (function() {
    var GraphLayout, HeaterView, ProfileModalView, ProfileSelectorView, SampleView, application,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    HeaterView = require('views/HeaterView');

    SampleView = require('views/SampleView');

    ProfileModalView = require('views/ProfileModalView');

    ProfileSelectorView = require('views/ProfileSelectorView');

    module.exports = GraphLayout = (function(_super) {

      __extends(GraphLayout, _super);

      function GraphLayout() {
        this.showHistory = __bind(this.showHistory, this);
        this.changeProfile = __bind(this.changeProfile, this);
        this.editProfile = __bind(this.editProfile, this);
        this.onClose = __bind(this.onClose, this);
        this.renderGraph = __bind(this.renderGraph, this);
        this.onRender = __bind(this.onRender, this);
        this.updateProfileData = __bind(this.updateProfileData, this);
        this.initialize = __bind(this.initialize, this);
        GraphLayout.__super__.constructor.apply(this, arguments);
      }

      GraphLayout.prototype.template = require('views/templates/graphLayout');

      GraphLayout.prototype.events = {
        'click .changeProfile': 'changeProfile',
        'click .editProfile': 'editProfile',
        'click .history': 'showHistory'
      };

      GraphLayout.prototype.ui = {
        profileLabel: '.activeProfile',
        profileButton: '.changeProfile',
        editButton: '.editProfile'
      };

      GraphLayout.prototype.initialize = function(options) {
        var updateProfileCallback,
          _this = this;
        updateProfileCallback = function() {
          return _this.updateProfileData(true);
        };
        application.vent.on('Profiles:Loaded', updateProfileCallback);
        application.vent.on('Profile:Modified', updateProfileCallback);
        this.updateProfileData(false);
      };

      GraphLayout.prototype.updateProfileData = function(rerender) {
        var activeProfile, fermenterId, label,
          _this = this;
        fermenterId = this.model.get('fermenterId');
        activeProfile = null;
        application.controller_.profiles_.each(function(profile) {
          var active, sensor;
          sensor = profile.get('sensor');
          active = profile.get('active');
          if (sensor === fermenterId && active === true) {
            _this.model.set('profile', profile);
            _this.model.set('profileName', profile.get('name'));
            return activeProfile = profile;
          }
        });
        if (activeProfile === null) {
          label = this.model.get('sensorLabel');
          this.model.set('profileName', label);
          this.model.set('profile', null);
        }
        if (rerender === true) return this.render();
      };

      GraphLayout.prototype.onRender = function() {
        var fermenterId, gpio, graphRegionId, heaterRegionId, heaterView, options, profile, sampleRegionId, sampleView;
        fermenterId = this.model.get('fermenterId');
        graphRegionId = fermenterId + '_graphRegion';
        sampleRegionId = fermenterId + '_sampleRegion';
        heaterRegionId = fermenterId + '_heaterRegion';
        this.graphRegion = this.addRegion(graphRegionId, '#' + graphRegionId);
        this.sampleRegion = this.addRegion(sampleRegionId, '#' + sampleRegionId);
        this.heaterRegion = this.addRegion(heaterRegionId, '#' + heaterRegionId);
        this.renderGraph();
        gpio = this.model.get('gpio');
        options = {
          fermenterId: fermenterId,
          layout: this,
          application: application,
          graphModel: this.model,
          gpio: gpio
        };
        heaterView = new HeaterView(options);
        this.heaterRegion.show(heaterView);
        sampleView = new SampleView(options);
        this.sampleRegion.show(sampleView);
        profile = this.model.get('profile');
        if (profile === void 0 || profile === null) {
          this.ui.editButton.hide();
          this.ui.profileButton.text('[set profile]');
        }
      };

      GraphLayout.prototype.renderGraph = function() {
        var el, fermenterId, sample;
        fermenterId = this.model.get('fermenterId');
        sample = this.model.get('sample');
        el = fermenterId;
        this.graphView = application.graph_.createView(fermenterId, el, sample);
        this.graphRegion.show(this.graphView);
        return this.graphView.render();
      };

      GraphLayout.prototype.onClose = function() {
        this.graphView.model.stop();
      };

      GraphLayout.prototype.editProfile = function(e) {
        var modal, model, options;
        model = this.model.get('profile');
        options = {
          model: model,
          application: application
        };
        modal = new ProfileModalView(options);
        application.layout.modal.show(modal);
        return false;
      };

      GraphLayout.prototype.changeProfile = function(e) {
        var fermenterId, modal, options;
        fermenterId = this.model.get('fermenterId');
        options = {
          application: application,
          fermenterId: fermenterId
        };
        modal = new ProfileSelectorView(options);
        application.layout.modal.show(modal);
        return false;
      };

      GraphLayout.prototype.showHistory = function(e) {
        console.log('show history');
        return false;
      };

      return GraphLayout;

    })(Backbone.Marionette.Layout);

  }).call(this);
  
});
window.require.register("views/HeaterView", function(exports, require, module) {
  (function() {
    var HeaterModel, HeaterView, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/heater');

    HeaterModel = require('models/heaterModel');

    module.exports = HeaterView = (function(_super) {

      __extends(HeaterView, _super);

      function HeaterView() {
        this.overrideResume = __bind(this.overrideResume, this);
        this.heaterOverride = __bind(this.heaterOverride, this);
        this.setHeaterState = __bind(this.setHeaterState, this);
        this.initialize = __bind(this.initialize, this);
        HeaterView.__super__.constructor.apply(this, arguments);
      }

      HeaterView.prototype.fermenterId = null;

      HeaterView.prototype.app = null;

      HeaterView.prototype.graphModel = null;

      HeaterView.prototype.template = template;

      HeaterView.prototype.events = {
        'click .heaterOverride': 'heaterOverride',
        'click .overrideResume': 'overrideResume'
      };

      HeaterView.prototype.ui = {
        heaterLight: '.heaterLight',
        heaterState: '.heaterState',
        overrideResume: '.overrideResume'
      };

      HeaterView.prototype.initialize = function(options) {
        var modelOptions,
          _this = this;
        this.fermenterId = options.fermenterId;
        this.app = options.application;
        this.graphModel = options.graphModel;
        modelOptions = {
          fermenterId: this.fermenterId,
          gpio: options.gpio
        };
        this.model = new HeaterModel(modelOptions);
        this.app.vent.on('Heater:State', function(data) {
          if (data.sensor === _this.fermenterId) {
            return _this.setHeaterState(data.state);
          }
        });
        this.app.vent.on('Heater:Changed', function(data) {
          if (data.sensor === _this.fermenterId) {
            return _this.setHeaterState(data.state);
          }
        });
        this.app.controller_.socket_.emit('getgpio', this.fermenterId);
      };

      HeaterView.prototype.onRender = function() {
        var overrides, profile;
        profile = this.graphModel.get('profile');
        if (profile === void 0 || profile === null) {
          this.ui.overrideResume.hide();
          return;
        }
        overrides = profile.get('overrides');
        if (overrides.length > 0 && overrides[overrides.length - 1].action === 'resume') {
          return this.ui.overrideResume.hide();
        } else {
          return this.ui.overrideResume.show();
        }
      };

      HeaterView.prototype.setHeaterState = function(state) {
        var newClass, newState, oldClass;
        newState = 'on';
        newClass = 'green';
        oldClass = 'red';
        if (state !== true) {
          newState = 'off';
          newClass = 'red';
          oldClass = 'green';
        }
        this.model.set('state', newState);
        this.ui.heaterLight.removeClass(oldClass);
        this.ui.heaterLight.addClass(newClass);
        return this.ui.heaterState.text('Heater ' + newState);
      };

      HeaterView.prototype.heaterOverride = function(e) {
        var newState, oldState, override, overrides, profile, value;
        oldState = this.model.get('state');
        newState = 'on';
        value = true;
        if (oldState === 'on') {
          newState = 'off';
          value = false;
        }
        profile = this.graphModel.get('profile');
        if (profile !== void 0 && profile !== null) {
          overrides = profile.get('overrides');
          override = {
            action: newState,
            time: new Date()
          };
          overrides.push(override);
          profile.set('overrides', overrides);
          profile.save();
        }
        this.setHeaterState(value);
        this.app.controller_.socket_.emit('setgpio', this.fermenterId, value);
        return false;
      };

      HeaterView.prototype.overrideResume = function(e) {
        var override, overrides, profile;
        profile = this.graphModel.get('profile');
        overrides = profile.get('overrides');
        override = {
          action: 'resume',
          time: new Date()
        };
        overrides.push(override);
        profile.set('overrides', overrides);
        profile.save();
        this.ui.overrideResume.hide();
        return false;
      };

      return HeaterView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/HomeLayout", function(exports, require, module) {
  (function() {
    var GraphCollection, GraphCollectionView, GraphModel, HomeLayout,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    GraphCollectionView = require('views/GraphCollectionView');

    GraphCollection = require('models/graphCollection');

    GraphModel = require('models/graphModel');

    module.exports = HomeLayout = (function(_super) {

      __extends(HomeLayout, _super);

      function HomeLayout() {
        this.createCollection = __bind(this.createCollection, this);
        this.initialize = __bind(this.initialize, this);
        HomeLayout.__super__.constructor.apply(this, arguments);
      }

      HomeLayout.prototype.template = require('views/templates/homeLayout');

      HomeLayout.prototype.initialize = function(options) {
        var _this = this;
        this.graphRegion = this.addRegion('graphs', '#graphs');
        this.app = options.application;
        return this.app.vent.on('Socket:Config', function(config) {
          return _this.createCollection(config);
        });
      };

      HomeLayout.prototype.createCollection = function(config) {
        var collection, model, models, options, sensor, view;
        models = [];
        sensor = (function() {
          var _i, _len, _ref, _results;
          _ref = config.sensors;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            sensor = _ref[_i];
            if (sensor.type === 'fermenter') {
              options = {
                sample: 24,
                gpio: sensor.gpio,
                sensorName: sensor.name,
                sensorLabel: sensor.label,
                fermenterId: sensor.name,
                fermenterName: sensor.label,
                profileName: sensor.name,
                heaterState: 'Off',
                sampleOptions: [2, 4, 6, 8, 12, 24],
                sampleRate: 24
              };
              model = new GraphModel(options);
              _results.push(models.push(model));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        })();
        collection = new GraphCollection(models);
        view = new GraphCollectionView({
          collection: collection
        });
        return this.graphRegion.show(view);
      };

      return HomeLayout;

    })(Backbone.Marionette.Layout);

  }).call(this);
  
});
window.require.register("views/HomeView", function(exports, require, module) {
  (function() {
    var HomeView, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/home');

    module.exports = HomeView = (function(_super) {

      __extends(HomeView, _super);

      function HomeView() {
        HomeView.__super__.constructor.apply(this, arguments);
      }

      HomeView.prototype.id = 'home-view';

      HomeView.prototype.template = template;

      return HomeView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/ModalRegion", function(exports, require, module) {
  (function() {
    var ModalRegion,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = ModalRegion = (function(_super) {

      __extends(ModalRegion, _super);

      ModalRegion.prototype.el = '#modal';

      function ModalRegion() {
        this.hideModal = __bind(this.hideModal, this);
        this.showModal = __bind(this.showModal, this);
        this.getEl = __bind(this.getEl, this);      this.on('show', this.showModal, this);
      }

      ModalRegion.prototype.getEl = function(selector) {
        var $el;
        $el = $(selector);
        $el.on('hidden', this.close);
        return $el;
      };

      ModalRegion.prototype.showModal = function(view) {
        view.on('close', this.hideModal, this);
        this.$el.modal('show');
        this.$el.css('margin-top', (this.$el.outerHeight() / 2) * -1);
        this.$el.css('margin-left', (this.$el.outerWidth() / 2) * -1);
        return this.$el.css('top', '50%');
      };

      ModalRegion.prototype.hideModal = function() {
        return this.$el.modal('hide');
      };

      return ModalRegion;

    })(Backbone.Marionette.Region);

  }).call(this);
  
});
window.require.register("views/ProfileCollectionView", function(exports, require, module) {
  (function() {
    var ProfileCollectionView, ProfileView,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileView = require('views/ProfileView');

    module.exports = ProfileCollectionView = (function(_super) {

      __extends(ProfileCollectionView, _super);

      function ProfileCollectionView() {
        this.initialize = __bind(this.initialize, this);
        ProfileCollectionView.__super__.constructor.apply(this, arguments);
      }

      ProfileCollectionView.prototype.tagName = 'div';

      ProfileCollectionView.prototype.itemView = ProfileView;

      ProfileCollectionView.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.application;
        return this.app.vent.on('Profile:Modified', function() {
          return _this.collection.fetch({
            add: true,
            success: function() {
              return _this.render();
            }
          });
        });
      };

      return ProfileCollectionView;

    })(Backbone.Marionette.CollectionView);

  }).call(this);
  
});
window.require.register("views/ProfileDetailView", function(exports, require, module) {
  (function() {
    var FermentationStepModalView, FermentationStepView, ProfileDetailView, ProfileModalView, StepCollection, StepModel, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/profileDetail');

    ProfileModalView = require('views/ProfileModalView');

    FermentationStepModalView = require('views/FermentationStepModalView');

    StepModel = require('models/stepModel');

    StepCollection = require('models/stepCollection');

    FermentationStepView = require('views/FermentationStepView');

    module.exports = ProfileDetailView = (function(_super) {

      __extends(ProfileDetailView, _super);

      function ProfileDetailView() {
        this.editProfile = __bind(this.editProfile, this);
        this.initialize = __bind(this.initialize, this);
        ProfileDetailView.__super__.constructor.apply(this, arguments);
      }

      ProfileDetailView.prototype.template = template;

      ProfileDetailView.prototype.events = {
        'click .add-step': 'addStep',
        'click .edit': 'editProfile'
      };

      ProfileDetailView.prototype.itemView = FermentationStepView;

      ProfileDetailView.prototype.itemViewContainer = '#steps';

      ProfileDetailView.prototype.itemViewOptions = function(model, index) {
        var options;
        options = {
          application: this.app
        };
        return options;
      };

      ProfileDetailView.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.application;
        this.loadSteps();
        return this.app.vent.on('Profile:Modified', function() {
          return _this.model.fetch({
            success: function() {
              _this.app.controller_.profiles_.fetch();
              _this.loadSteps();
              return _this.render();
            }
          });
        });
      };

      ProfileDetailView.prototype.loadSteps = function() {
        var model, step, steps;
        this.collection = new StepCollection();
        steps = this.model.get('steps');
        if (steps !== void 0) {
          return step = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = steps.length; _i < _len; _i++) {
              step = steps[_i];
              model = new StepModel(step);
              model.set('profile', this.model);
              _results.push(this.collection.add(model));
            }
            return _results;
          }).call(this);
        }
      };

      ProfileDetailView.prototype.addStep = function(e) {
        var modal, options;
        options = {
          profile: this.model,
          application: this.app
        };
        modal = new FermentationStepModalView(options);
        return this.app.layout.modal.show(modal);
      };

      ProfileDetailView.prototype.editProfile = function(e) {
        var modal, options;
        options = {
          model: this.model,
          application: this.app
        };
        modal = new ProfileModalView(options);
        this.app.layout.modal.show(modal);
        return false;
      };

      return ProfileDetailView;

    })(Backbone.Marionette.CompositeView);

  }).call(this);
  
});
window.require.register("views/ProfileModalView", function(exports, require, module) {
  (function() {
    var ProfileModalView, ProfileModel, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/profileModal');

    ProfileModel = require('models/profileModel');

    module.exports = ProfileModalView = (function(_super) {

      __extends(ProfileModalView, _super);

      function ProfileModalView() {
        this.saveProfile = __bind(this.saveProfile, this);
        this.initialize = __bind(this.initialize, this);
        ProfileModalView.__super__.constructor.apply(this, arguments);
      }

      ProfileModalView.prototype.id = 'profile-modal-view';

      ProfileModalView.prototype.template = template;

      ProfileModalView.prototype.events = {
        'click #save-profile': 'saveProfile'
      };

      ProfileModalView.prototype.initialize = function(options) {
        return this.app = options.application;
      };

      ProfileModalView.prototype.saveProfile = function(e) {
        var controlMode, name, sensor,
          _this = this;
        name = $('#profile-input-name').val();
        controlMode = $('#profile-input-mode').val();
        sensor = $('#profile-input-sensor').val();
        this.model.set('name', name);
        this.model.set('control_mode', controlMode);
        this.model.set('sensor', sensor);
        this.model.once('sync', function() {
          return _this.app.vent.trigger('Profile:Modified');
        });
        this.model.save();
        this.app.layout.modal.close();
        return false;
      };

      return ProfileModalView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/ProfileSelectorView", function(exports, require, module) {
  (function() {
    var ProfileModel, ProfileSelectorView, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/profileSelector');

    ProfileModel = require('models/profileModel');

    module.exports = ProfileSelectorView = (function(_super) {

      __extends(ProfileSelectorView, _super);

      function ProfileSelectorView() {
        this.saveActiveProfile = __bind(this.saveActiveProfile, this);
        this.initialize = __bind(this.initialize, this);
        ProfileSelectorView.__super__.constructor.apply(this, arguments);
      }

      ProfileSelectorView.prototype.id = 'profile-modal-view';

      ProfileSelectorView.prototype.fermenterId = null;

      ProfileSelectorView.prototype.template = template;

      ProfileSelectorView.prototype.events = {
        'click #save-active-profile': 'saveActiveProfile'
      };

      ProfileSelectorView.prototype.initialize = function(options) {
        this.app = options.application;
        return this.fermenterId = options.fermenterId;
      };

      ProfileSelectorView.prototype.saveActiveProfile = function(e) {
        var activeId,
          _this = this;
        activeId = $('#profile-input-id').val();
        console.log('active id:');
        console.log(activeId);
        this.app.controller_.profiles_.each(function(profile) {
          var id, modified, oldState, sensor;
          id = profile.get('_id');
          modified = false;
          oldState = profile.get('active');
          sensor = profile.get('sensor');
          console.log('old state:');
          console.log(oldState);
          console.log('id:');
          console.log(id);
          console.log('profile:');
          console.log(profile);
          if (id === activeId) {
            if (oldState !== true || sensor !== _this.fermenterId) {
              profile.set('active', true);
              profile.set('sensor', _this.fermenterId);
              modified = true;
            }
          } else {
            if (oldState === true && sensor === _this.fermenterId) {
              profile.set('active', false);
              modified = true;
            }
          }
          if (modified === true) {
            console.log('was modified');
            profile.once('sync', function() {
              return _this.app.vent.trigger('Profile:Modified');
            });
            return profile.save();
          }
        });
        this.app.layout.modal.close();
        return false;
      };

      return ProfileSelectorView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/ProfileView", function(exports, require, module) {
  (function() {
    var FermentationStepModalView, FermentationStepView, ProfileModalView, ProfileView, StepCollection, StepModel, application, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    template = require('./templates/profile');

    ProfileModalView = require('views/ProfileModalView');

    FermentationStepModalView = require('views/FermentationStepModalView');

    StepModel = require('models/stepModel');

    StepCollection = require('models/stepCollection');

    FermentationStepView = require('views/FermentationStepView');

    module.exports = ProfileView = (function(_super) {

      __extends(ProfileView, _super);

      function ProfileView() {
        this.deleteProfile = __bind(this.deleteProfile, this);
        this.editProfile = __bind(this.editProfile, this);
        this.initialize = __bind(this.initialize, this);
        ProfileView.__super__.constructor.apply(this, arguments);
      }

      ProfileView.prototype.template = template;

      ProfileView.prototype.events = {
        'click .edit': 'editProfile',
        'click .delete': 'deleteProfile',
        'click .activate': 'activateProfile'
      };

      ProfileView.prototype.ui = {
        activateButton: '.activate'
      };

      ProfileView.prototype.initialize = function(options) {};

      ProfileView.prototype.onRender = function() {
        var state;
        state = this.model.get('active');
        if (state) return this.ui.activateButton.text('deactivate');
      };

      ProfileView.prototype.activateProfile = function(e) {
        var id, newState, state;
        state = this.model.get('active');
        newState = false;
        if (state === true) {
          this.model.set('active', false);
          this.ui.activateButton.text('activate');
        } else {
          newState = true;
          this.model.set('active', true);
          this.ui.activateButton.text('deactivate');
        }
        id = this.model.get('_id');
        application.controller_.activateProfile(id, newState);
        return false;
      };

      ProfileView.prototype.editProfile = function(e) {
        var modal, options;
        options = {
          model: this.model,
          application: application
        };
        modal = new ProfileModalView(options);
        application.layout.modal.show(modal);
        return false;
      };

      ProfileView.prototype.deleteProfile = function(e) {
        this.model.once('sync', function() {
          return application.vent.trigger('Profile:Modified');
        });
        this.model.destroy();
        return false;
      };

      return ProfileView;

    })(Backbone.Marionette.CompositeView);

  }).call(this);
  
});
window.require.register("views/ProfilesLayout", function(exports, require, module) {
  (function() {
    var ProfileCollectionView, ProfileModel, ProfilesLayout, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileCollectionView = require('views/ProfileCollectionView');

    ProfileModel = require('models/profileModel');

    template = require('views/templates/profilesLayout');

    module.exports = ProfilesLayout = (function(_super) {

      __extends(ProfilesLayout, _super);

      function ProfilesLayout() {
        this.showProfiles = __bind(this.showProfiles, this);
        this.initialize = __bind(this.initialize, this);
        ProfilesLayout.__super__.constructor.apply(this, arguments);
      }

      ProfilesLayout.prototype.template = template;

      ProfilesLayout.prototype.regions = {
        profiles: "#profiles-table"
      };

      ProfilesLayout.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.application;
        return this.app.vent.on('Profiles:Loaded', function() {
          return _this.showProfiles();
        });
      };

      ProfilesLayout.prototype.showProfiles = function() {
        var options, view;
        options = {
          application: this.app,
          collection: this.app.controller_.profiles_
        };
        view = new ProfileCollectionView(options);
        this.profiles.close();
        return this.profiles.show(view);
      };

      return ProfilesLayout;

    })(Backbone.Marionette.Layout);

  }).call(this);
  
});
window.require.register("views/SampleView", function(exports, require, module) {
  (function() {
    var SampleModel, SampleView, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/sample');

    SampleModel = require('models/sampleModel');

    module.exports = SampleView = (function(_super) {

      __extends(SampleView, _super);

      function SampleView() {
        this.changeSampleRate = __bind(this.changeSampleRate, this);
        SampleView.__super__.constructor.apply(this, arguments);
      }

      SampleView.prototype.template = template;

      SampleView.prototype.ui = {
        currentSample: '.currentSample'
      };

      SampleView.prototype.events = {
        'click .sampleRate': 'changeSampleRate'
      };

      SampleView.prototype.initialize = function(options) {
        var modelOptions;
        this.fermenterId = options.fermenterId;
        this.layout = options.layout;
        modelOptions = {
          fermenterId: this.fermenterId
        };
        this.model = new SampleModel(modelOptions);
      };

      SampleView.prototype.changeSampleRate = function(e) {
        var newRate, unit, value;
        newRate = $(e.target).text();
        unit = newRate.substr(newRate.length - 1, 1);
        value = newRate.substring(0, newRate.indexOf(unit));
        this.model.set('current', value);
        this.model.set('unit', unit);
        this.ui.currentSample.text(newRate);
        this.layout.model.set('sample', value);
        this.layout.renderGraph();
        return false;
      };

      return SampleView;

    })(Backbone.Marionette.ItemView);

  }).call(this);
  
});
window.require.register("views/templates/appLayout", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"nav\" class=\"navbar navbar-fixed-top\">\n	<div class=\"navbar-inner\">\n		<div class=\"container\">\n			<a class=\"brand\" href=\"#\">RPi Ferment</a>\n			<ul class=\"nav\">\n				<li><a id=\"profiles-nav\" href=\"#profiles\">Profiles</a></li>\n				<li><a id=\"new-profile-nav\" href=\"#\">New Profile</a></li>\n			</ul>\n		</div>\n	</div>\n</div>\n\n<div id=\"content\" class=\"container\"></div>\n<div id=\"modal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"profileModalLabel\" aria-hidden=\"true\">\n</div>";});
});
window.require.register("views/templates/fermentationStepModal", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n						<option value=\"days\">Days</option>\n						<option value=\"hours\">Hours</option>\n						";}

    buffer += "<div id=\"step-modal\">\n	<div class=\"modal-header\">\n		<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n		<h3 id=\"stepModalLabel\">Fermentation Step</h3>\n	</div>\n	<div class=\"modal-body\">\n		<form class=\"form-horizontal\" id=\"step-form\">\n			<input type=\"hidden\" name=\"step-input-id\" value=\"\">\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"step-input-name\">Name</label>\n				<div class=\"controls\">\n					<input type=\"text\" id=\"step-input-name\" placeholder=\"Name\" value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n				</div>\n			</div>\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"step-input-duration\">Duration</label>\n				<div class=\"controls\">\n					<input type=\"text\" id=\"step-input-duration\" placeholder=\"Duration\" value=\"";
    foundHelper = helpers.duration;
    stack1 = foundHelper || depth0.duration;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "duration", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n					<select id=\"step-input-unit\" class=\"span1\">\n						";
    foundHelper = helpers.unit;
    stack1 = foundHelper || depth0.unit;
    foundHelper = helpers.select;
    stack2 = foundHelper || depth0.select;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n					</select>\n				</div>\n			</div>\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"step-input-temperature\">Temperature</label>\n				<div class=\"controls\">\n					<input type=\"text\" id=\"step-input-temperature\" placeholder=\"Temperature\" value=\"";
    foundHelper = helpers.temperature;
    stack1 = foundHelper || depth0.temperature;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "temperature", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n				</div>\n			</div>\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"step-input-order\">Order</label>\n				<div class=\"controls\">\n					<input type=\"text\" id=\"step-input-order\" placeholder=\"Order\" value=\"";
    foundHelper = helpers.order;
    stack1 = foundHelper || depth0.order;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "order", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n				</div>\n			</div>\n		</form>\n	</div>\n	<div class=\"modal-footer\">\n		<button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n		<button id=\"save-step\" class=\"btn btn-primary\">Save changes</button>\n	</div>\n</div>";
    return buffer;});
});
window.require.register("views/templates/graphLayout", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"row\">\n	<div class=\"span9\">\n		<h3>";
    foundHelper = helpers.fermenterName;
    stack1 = foundHelper || depth0.fermenterName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h3>\n		<div id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_graphRegion\"></div>\n		<h4 class=\"activeProfile\">Fermenting: ";
    foundHelper = helpers.profileName;
    stack1 = foundHelper || depth0.profileName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "profileName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n		<div>\n			<a class=\"editProfile\" href=\"#\">[edit profile]</a>\n			<a class=\"changeProfile\" href=\"#\">[change profile]</a>\n		</div>\n		<br />\n		<div id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_heaterRegion\"></div>\n		<br />\n		<!--<a id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_history\" class=\"history\" href=\"#\">History...</a>-->\n	</div>\n</div>\n\n<div id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_sampleRegion\"></div>\n<hr />";
    return buffer;});
});
window.require.register("views/templates/heater", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<div id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_heaterLight\" class=\"heaterLight red\"></div> <strong class=\"heaterState\">Heater ";
    foundHelper = helpers.state;
    stack1 = foundHelper || depth0.state;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "state", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</strong> <a id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_heaterOverride\" class=\"heaterOverride\" href=\"#\">[override]</a> <a class=\"overrideResume\" href=\"#\">[resume]</a>\n";
    return buffer;});
});
window.require.register("views/templates/home", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"row\">\n	<div class=\"span12\">\n		<h2>Active Fermentations</h2>\n		<hr />\n	</div>\n</div>\n";});
});
window.require.register("views/templates/homeLayout", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div class=\"row\">\n	<div class=\"span12\">\n		<h2>Active Fermentations</h2>\n		<hr />\n	</div>\n</div>\n<div id=\"graphs\">\n</div>\n";});
});
window.require.register("views/templates/profile", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<tr>\n	<td>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td>\n	<td><a class=\"edit\" href=\"#\">edit</a></td>\n	<td><a class=\"delete\" href=\"#\">delete</a></td>\n	<td><a class=\"activate\" href=\"#\">activate</a></td>\n	<td><a class=\"details\" href=\"#profile/";
    foundHelper = helpers._id;
    stack1 = foundHelper || depth0._id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "_id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">details</a></td>\n</tr>\n";
    return buffer;});
});
window.require.register("views/templates/profileDetail", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<h2>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h2>\n<hr />\n<div class=\"row\">\n	<div class=\"span1\">\n		<strong>Sensor:</strong><br />\n		<strong>Control Mode:</strong><br />\n	</div>\n	<div class=\"span2\">\n		";
    foundHelper = helpers.sensor;
    stack1 = foundHelper || depth0.sensor;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "sensor", { hash: {} }); }
    buffer += escapeExpression(stack1) + "<br />\n		";
    foundHelper = helpers.control_mode;
    stack1 = foundHelper || depth0.control_mode;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "control_mode", { hash: {} }); }
    buffer += escapeExpression(stack1) + "<br />\n	</div>\n</div>\n<br />\n<button class=\"edit\" href=\"#\">Edit Profile</button>\n<hr />\n<h4>Steps</h4>\n<ol id=\"steps\">\n</ol>\n<br />\n<button class=\"add-step\" class=\"btn btn-mini\">Add Step</button>\n";
    return buffer;});
});
window.require.register("views/templates/profileModal", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n						";}

  function program3(depth0,data) {
    
    
    return "\n						<option value=\"none\">None</option>\n						<option value=\"pid\">PID</option>\n						<option value=\"auto\">Auto</option>\n						<option value=\"manual\">Manual</option>\n					";}

    buffer += "<div id=\"profile-modal\">\n	<div class=\"modal-header\">\n		<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n		<h3 id=\"profileModalLabel\">Fermentation Profile</h3>\n	</div>\n	<div class=\"modal-body\">\n		<form class=\"form-horizontal\" id=\"profile-form\">\n			<input type=\"hidden\" id=\"profile-input-id\" value=\"\">\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"profile-input-name\">Name</label>\n				<div class=\"controls\">\n					<input type=\"text\" id=\"profile-input-name\" placeholder=\"Name\" value=\"";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\n				</div>\n			</div>\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"profile-input-sensor\">Sensor</label>\n				<div class=\"controls\">\n					<select id=\"profile-input-sensor\">\n						";
    foundHelper = helpers.sensor;
    stack1 = foundHelper || depth0.sensor;
    foundHelper = helpers.sensorList;
    stack2 = foundHelper || depth0.sensorList;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n					</select>\n				</div>\n			</div>\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"profile-input-mode\">Control Mode</label>\n				<div class=\"controls\">\n					<select id=\"profile-input-mode\">\n					";
    foundHelper = helpers.control_mode;
    stack1 = foundHelper || depth0.control_mode;
    foundHelper = helpers.select;
    stack2 = foundHelper || depth0.select;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n					</select>\n				</div>\n			</div>\n		</form>\n	</div>\n	<div class=\"modal-footer\">\n		<button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n		<button id=\"save-profile\" class=\"btn btn-primary\">Save changes</button>\n	</div>\n</div>";
    return buffer;});
});
window.require.register("views/templates/profileSelector", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n						";}

    buffer += "<div id=\"profile-selector-modal\">\n	<div class=\"modal-header\">\n		<button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n		<h3 id=\"profileSelectorModalLabel\">Select Fermentation Profile</h3>\n	</div>\n	<div class=\"modal-body\">\n		<form class=\"form-horizontal\" id=\"profile-selector-form\">\n			<div class=\"control-group\">\n				<label class=\"control-label\" for=\"profile-input-id\">Profile</label>\n				<div class=\"controls\">\n					<select id=\"profile-input-id\">\n						";
    foundHelper = helpers.profile;
    stack1 = foundHelper || depth0.profile;
    foundHelper = helpers.profileList;
    stack2 = foundHelper || depth0.profileList;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    if(foundHelper && typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
    else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n					</select>\n				</div>\n			</div>\n	</div>\n	<div class=\"modal-footer\">\n		<button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n		<button id=\"save-active-profile\" class=\"btn\">Save changes</button>\n	</div>\n</div>";
    return buffer;});
});
window.require.register("views/templates/profilesLayout", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h2>Fermentation Profiles</h2>\n<hr />\n<table id=\"profiles-table\" class=\"table\">\n</table>\n";});
});
window.require.register("views/templates/sample", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n		<a id=\"";
    foundHelper = helpers.fermenterId;
    stack1 = foundHelper || depth0.fermenterId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "fermenterId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "_sampleRate";
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" class=\"sampleRate\" href=\"#\">";
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + "H</a> \n	";
    return buffer;}

    buffer += "<p>\n	Viewing Last <strong class=\"currentSample\">";
    foundHelper = helpers.current;
    stack1 = foundHelper || depth0.current;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "current", { hash: {} }); }
    buffer += escapeExpression(stack1) + "H</strong> \n	[\n	";
    foundHelper = helpers.range;
    stack1 = foundHelper || depth0.range;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\n	]\n</p>\n";
    return buffer;});
});
window.require.register("views/templates/step", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<li>";
    foundHelper = helpers.name;
    stack1 = foundHelper || depth0.name;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
    buffer += escapeExpression(stack1) + " <a class=\"edit-step\" href=\"#\">edit</a> <a class=\"delete-step\" href=\"#\">delete</a></li>\n";
    return buffer;});
});
