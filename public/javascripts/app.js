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
        this.setupSockets = __bind(this.setupSockets, this);
        this.initialize = __bind(this.initialize, this);
        Application.__super__.constructor.apply(this, arguments);
      }

      Application.prototype.graph_ = {};

      Application.prototype.config_ = {};

      Application.prototype.initialize = function() {
        var _this = this;
        this.graph_ = new Graph();
        this.socket_ = io.connect('http://graphite:6001');
        this.on("initialize:after", function(options) {
          options = {
            application: _this
          };
          _this.controller_ = new ProfileController(options);
          _this.setupSockets();
          Backbone.history.start();
          return typeof Object.freeze === "function" ? Object.freeze(_this) : void 0;
        });
        this.on('start', function() {});
        this.addInitializer(function(options) {
          var AppLayout;
          AppLayout = require('views/AppLayout');
          _this.layout = new AppLayout();
          return _this.layout.render();
        });
        this.addInitializer(function(options) {
          var Router;
          Router = require('lib/router');
          return _this.router = new Router();
        });
        return this.start();
      };

      Application.prototype.setupSockets = function() {
        var _this = this;
        this.socket_.on('config', function(config) {
          _this.controller_.config_ = config;
          return _this.vent.trigger('Socket:Config', config);
        });
        this.socket_.on('pv', function(data) {
          _this.vent.trigger('Socket:PV');
          return console.log('new pv');
        });
        this.socket_.on('sv', function(data) {
          _this.vent.trigger('Socket:SV');
          return console.log('new sv');
        });
        this.socket_.on('mode', function(data) {
          return _this.vent.trigger('Socket:Mode', config);
        });
        return this.socket_.emit('config');
      };

      return Application;

    })(Backbone.Marionette.Application);

    module.exports = new Application();

  }).call(this);
  
});
window.require.register("controllers/profile", function(exports, require, module) {
  (function() {
    var ProfileController, ProfileModalView, ProfileModel,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileModalView = require('views/ProfileModalView');

    ProfileModel = require('models/profileModel');

    module.exports = ProfileController = (function(_super) {

      __extends(ProfileController, _super);

      function ProfileController() {
        this.initialize = __bind(this.initialize, this);
        ProfileController.__super__.constructor.apply(this, arguments);
      }

      ProfileController.prototype.initialize = function(options) {
        var _this = this;
        this.app = options.application;
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
        var desc, div, model_opts, opts, sampleRange, sourceUrl, targets, ts, view;
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
        opts = {
          model: ts,
          ymin: this.graphene_.getUrlParam(sourceUrl, "yMin"),
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

      Graphene.prototype.demo = function() {
        return this.is_demo = true;
      };

      Graphene.prototype.build = function(json) {
        var _this = this;
        return _.each(_.keys(json), function(k) {
          var klass, model_opts, ts;
          console.log("building [" + k + "]");
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
            console.log(_.extend({
              model: ts,
              ymin: _this.getUrlParam(model_opts.source, "yMin"),
              ymax: _this.getUrlParam(model_opts.source, "yMax")
            }, opts));
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
        console.log("Starting to poll at " + (this.get('refresh_interval')));
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
            console.log("got data.");
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
        console.log("Starting to poll at " + (this.get('refresh_interval')));
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
        console.log('process data barchart');
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
        console.log("rendering.");
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
        return console.log("GL view ");
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
        console.log(data);
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
        return console.log("TS view: " + this.width + "x" + this.height + " padding:" + this.padding + " animate: " + this.animate_ms + " labels: " + this.num_labels);
      };

      TimeSeriesView.prototype.render = function() {
        var area, d, data, dmax, dmin, leg_items, line, litem_enters, litem_enters_text, order, points, title, vis, x, xAxis, xmax, xmin, xpoints, xtick_sz, y, yAxis, _ref,
          _this = this;
        console.log("rendering.");
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
        return console.log("done drawing");
      };

      return BarChartView;

    })(Backbone.View);

  }).call(this);
  
});
window.require.register("lib/router", function(exports, require, module) {
  (function() {
    var HomeLayout, ProfilesLayout, Router, application,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    HomeLayout = require('views/HomeLayout');

    ProfilesLayout = require('views/ProfilesLayout');

    module.exports = Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        this.profiles = __bind(this.profiles, this);
        this.home = __bind(this.home, this);
        Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        '': 'home',
        'profiles': 'profiles'
      };

      Router.prototype.home = function() {
        var home;
        home = new HomeLayout();
        application.layout.content.close();
        return application.layout.content.show(home);
      };

      Router.prototype.profiles = function() {
        var profiles;
        profiles = new ProfilesLayout();
        application.layout.content.close();
        return application.layout.content.show(profiles);
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
    var ProfileCollection, ProfileModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileModel = require('models/profileModel');

    module.exports = ProfileCollection = (function(_super) {

      __extends(ProfileCollection, _super);

      function ProfileCollection() {
        ProfileCollection.__super__.constructor.apply(this, arguments);
      }

      ProfileCollection.prototype.url = '/profiles';

      ProfileCollection.prototype.model = ProfileModel;

      return ProfileCollection;

    })(Backbone.Collection);

  }).call(this);
  
});
window.require.register("models/profileModel", function(exports, require, module) {
  (function() {
    var ProfileModel,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    module.exports = ProfileModel = (function(_super) {

      __extends(ProfileModel, _super);

      function ProfileModel() {
        ProfileModel.__super__.constructor.apply(this, arguments);
      }

      ProfileModel.prototype.urlRoot = '/profiles';

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
        ]
      };

      return ProfileModel;

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
    var AppLayout, ModalRegion, application, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

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
        steps.push(step);
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
    var FermentationStepModalView, FermentationStepView, application, template,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    template = require('./templates/step');

    FermentationStepModalView = require('views/FermentationStepModalView');

    module.exports = FermentationStepView = (function(_super) {

      __extends(FermentationStepView, _super);

      function FermentationStepView() {
        this.deleteStep = __bind(this.deleteStep, this);
        this.editStep = __bind(this.editStep, this);
        FermentationStepView.__super__.constructor.apply(this, arguments);
      }

      FermentationStepView.prototype.template = template;

      FermentationStepView.prototype.events = {
        'click .edit-step': 'editStep',
        'click .delete-step': 'deleteStep'
      };

      FermentationStepView.prototype.editStep = function(e) {
        return false;
      };

      FermentationStepView.prototype.deleteStep = function(e) {
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
    var GraphLayout, application,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    application = require('application');

    module.exports = GraphLayout = (function(_super) {

      __extends(GraphLayout, _super);

      function GraphLayout() {
        this.onClose = __bind(this.onClose, this);
        this.onRender = __bind(this.onRender, this);
        this.initialize = __bind(this.initialize, this);
        GraphLayout.__super__.constructor.apply(this, arguments);
      }

      GraphLayout.prototype.template = require('views/templates/graphLayout');

      GraphLayout.prototype.initialize = function(options) {};

      GraphLayout.prototype.onRender = function() {
        var el, fermenterId, graphRegionId, sample;
        fermenterId = this.model.get('fermenterId');
        graphRegionId = '#' + fermenterId + '_rgn';
        this.graphRegion = this.addRegion(fermenterId, graphRegionId);
        sample = this.model.get('sample');
        el = fermenterId;
        this.graphView = application.graph_.createView(fermenterId, el, sample);
        this.graphRegion.show(this.graphView);
        this.graphView.render();
      };

      GraphLayout.prototype.onClose = function() {
        this.graphView.model.stop();
      };

      return GraphLayout;

    })(Backbone.Marionette.Layout);

  }).call(this);
  
});
window.require.register("views/HomeLayout", function(exports, require, module) {
  (function() {
    var GraphCollection, GraphCollectionView, GraphModel, HomeLayout, application,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    GraphCollectionView = require('views/GraphCollectionView');

    GraphCollection = require('models/graphCollection');

    GraphModel = require('models/graphModel');

    application = require('application');

    module.exports = HomeLayout = (function(_super) {

      __extends(HomeLayout, _super);

      function HomeLayout() {
        this.initialize = __bind(this.initialize, this);
        HomeLayout.__super__.constructor.apply(this, arguments);
      }

      HomeLayout.prototype.template = require('views/templates/homeLayout');

      HomeLayout.prototype.initialize = function() {
        var graphRegion,
          _this = this;
        graphRegion = this.addRegion('graphs', '#graphs');
        return application.vent.on('Socket:Config', function(config) {
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
                  sensorName: sensor.name,
                  sensorLabel: sensor.label,
                  fermenterId: sensor.name,
                  fermenterName: sensor.label,
                  profileName: sensor.name,
                  heaterState: 'On',
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
          return graphRegion.show(view);
        });
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
    var ProfileCollectionView, ProfileView, application,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileView = require('views/ProfileView');

    application = require('application');

    module.exports = ProfileCollectionView = (function(_super) {

      __extends(ProfileCollectionView, _super);

      function ProfileCollectionView() {
        this.initialize = __bind(this.initialize, this);
        ProfileCollectionView.__super__.constructor.apply(this, arguments);
      }

      ProfileCollectionView.prototype.tagName = 'div';

      ProfileCollectionView.prototype.itemView = ProfileView;

      ProfileCollectionView.prototype.initialize = function() {
        var _this = this;
        return application.vent.on('Profile:Modified', function() {
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
        return this.app.layout.modal.close();
      };

      return ProfileModalView;

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
        'click .add-step': 'addStep',
        'click .edit': 'editProfile',
        'click .delete': 'deleteProfile'
      };

      ProfileView.prototype.itemView = FermentationStepView;

      ProfileView.prototype.itemViewContainer = '#steps';

      ProfileView.prototype.initialize = function(options) {
        var collection, model, step, steps;
        collection = new StepCollection();
        steps = this.model.get('steps');
        if (steps !== void 0) {
          step = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = steps.length; _i < _len; _i++) {
              step = steps[_i];
              model = new StepModel(step);
              model.set('profile', this.model);
              _results.push(collection.add(model));
            }
            return _results;
          }).call(this);
        }
        return this.collection = collection;
      };

      ProfileView.prototype.addStep = function(e) {
        var modal, options;
        options = {
          profile: this.model,
          application: application
        };
        modal = new FermentationStepModalView(options);
        return application.layout.modal.show(modal);
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
    var ProfileCollection, ProfileCollectionView, ProfileModel, ProfilesLayout,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    ProfileCollectionView = require('views/ProfileCollectionView');

    ProfileCollection = require('models/profileCollection');

    ProfileModel = require('models/profileModel');

    module.exports = ProfilesLayout = (function(_super) {

      __extends(ProfilesLayout, _super);

      function ProfilesLayout() {
        this.initialize = __bind(this.initialize, this);
        ProfilesLayout.__super__.constructor.apply(this, arguments);
      }

      ProfilesLayout.prototype.template = require('views/templates/profilesLayout');

      ProfilesLayout.prototype.regions = {
        profiles: "#profiles-table"
      };

      ProfilesLayout.prototype.initialize = function() {
        var collection,
          _this = this;
        collection = new ProfileCollection();
        return collection.fetch({
          add: true,
          success: function() {
            var view;
            view = new ProfileCollectionView({
              collection: collection
            });
            return _this.profiles.show(view);
          }
        });
      };

      return ProfilesLayout;

    })(Backbone.Marionette.Layout);

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
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\n		<a id=\"sampleRate";
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\" href=\"/?sample=";
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">";
    stack1 = depth0;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
    buffer += escapeExpression(stack1) + "H</a> \n	";
    return buffer;}

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
    buffer += escapeExpression(stack1) + "_rgn\">\n		</div>\n		<h4>Fermenting: ";
    foundHelper = helpers.profileName;
    stack1 = foundHelper || depth0.profileName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "profileName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\n		<br />\n		<div>\n			<div id=\"heaterLight\" class=\"red\"></div> <strong>Heater ";
    foundHelper = helpers.heaterState;
    stack1 = foundHelper || depth0.heaterState;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "heaterState", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</strong> <a id=\"heaterOverride\" href=\"#\">[override]</a>\n		</div>\n		<br />\n		<a id=\"fermenterHistory\" class=\"history\" href=\"#\">History...</a>\n	</div>\n</div>\n\n<p>\n	Viewing Last <strong>";
    foundHelper = helpers.sampleRate;
    stack1 = foundHelper || depth0.sampleRate;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "sampleRate", { hash: {} }); }
    buffer += escapeExpression(stack1) + "H</strong> \n	[\n	";
    foundHelper = helpers.sampleOptions;
    stack1 = foundHelper || depth0.sampleOptions;
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
    buffer += escapeExpression(stack1) + "</td>\n	<td><a class=\"edit\" href=\"#\">edit</a></td>\n	<td><a class=\"delete\" href=\"#\">delete</a></td>\n</tr>\n<tr>\n	<td colspan=\"3\">Steps <button class=\"add-step\" class=\"btn btn-mini\">Add Step</button></td>\n	<td>\n		<ol id=\"steps\">\n		</ol>\n	<td>\n</tr>";
    return buffer;});
});
window.require.register("views/templates/profileModal", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

  function program1(depth0,data) {
    
    
    return "\n						";}

  function program3(depth0,data) {
    
    
    return "\n						<option value=\"none\">None</option>\n						<option value=\"pid\">PID</option>\n						<option value=\"manual\">Manual</option>\n					";}

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
window.require.register("views/templates/profilesLayout", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<h2>Fermentation Profiles</h2>\n<hr />\n<table id=\"profiles-table\" class=\"table\">\n</table>\n";});
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
