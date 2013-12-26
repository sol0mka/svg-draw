// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('path', ['jquery', 'helpers', 'ProtoClass', 'line'], function($, helpers, ProtoClass, Line) {
    var Path;

    Path = (function(_super) {
      __extends(Path, _super);

      Path.prototype.type = 'path';

      function Path(o) {
        this.o = o != null ? o : {};
        this.set('id', helpers.genHash());
        if (this.o.coords) {
          this.set({
            'startIJ': App.grid.toIJ(this.o.coords),
            'endIJ': App.grid.toIJ(this.o.coords)
          });
        }
        this.on('change', 'onChange');
      }

      Path.prototype.onChange = function() {
        this.set('oldIntersects', helpers.cloneObj(this.get('intersects')));
        return this.render();
      };

      Path.prototype.render = function(isRepaintIntersects) {
        if (isRepaintIntersects == null) {
          isRepaintIntersects = false;
        }
        this.removeFromGrid();
        this.recalcPath();
        this.makeLine();
        return App.grid.refreshGrid();
      };

      Path.prototype.recalcPath = function() {
        var i, ij, node, path, point, xy, _i, _len, _ref;

        path = App.grid.getGapPolyfill({
          from: this.get('startIJ'),
          to: this.get('endIJ')
        });
        this.set('points', []);
        for (i = _i = 0, _len = path.length; _i < _len; i = ++_i) {
          point = path[i];
          ij = {
            i: point[0],
            j: point[1]
          };
          xy = App.grid.fromIJ(ij);
          node = App.grid.atIJ(ij);
          if ((_ref = node.holders) == null) {
            node.holders = {};
          }
          node.holders[this.id] = this;
          point = {
            x: xy.x,
            y: xy.y,
            curve: null,
            i: i
          };
          this.set('points', this.get('points').push(point));
        }
        this.calcPolar();
        return this;
      };

      Path.prototype.calcPolar = function() {
        var firstPoint, lastPoint, points;

        points = this.points;
        firstPoint = points[0];
        lastPoint = points[points.length - 1];
        this.set('xPolar', firstPoint.x < lastPoint.x ? 'plus' : 'minus');
        return this.set('yPolar', firstPoint.y < lastPoint.y ? 'plus' : 'minus');
      };

      Path.prototype.repaintIntersects = function(intersects) {
        var name, path;

        for (name in intersects) {
          path = intersects[name];
          if (path.id === this.id) {
            continue;
          }
          path.render([path.id]);
        }
        return this.set('oldIntersects', {});
      };

      Path.prototype.detectCollisions = function() {
        var myDirection, name, node, path, point, _i, _len, _ref, _results,
          _this = this;

        this.set('intersects', {});
        _ref = this.get('points');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          point = _ref[_i];
          myDirection = this.directionAt(point);
          node = App.grid.at(point);
          if (_.size(node.holders) > 1) {
            _.chain(node.holders).where({
              type: 'path'
            }).each(function(holder) {
              return _this.set('intersects', (_this.get('intersects')[holder.id] = holder));
            });
            _results.push((function() {
              var _ref1, _results1;

              _ref1 = this.get('intersects');
              _results1 = [];
              for (name in _ref1) {
                path = _ref1[name];
                if (path.get('id' === this.get('id'))) {
                  continue;
                }
                if (myDirection !== path.directionAt(point) && path.directionAt(point) !== 'corner' && myDirection !== 'corner') {
                  _results1.push(point.curve = "" + myDirection);
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      Path.prototype.directionAt = function(xy) {
        var direction, point, points, _ref, _ref1, _ref2, _ref3;

        points = this.get('points');
        point = _.where(points, {
          x: xy.x,
          y: xy.y
        })[0];
        if (!point) {
          return 'corner';
        }
        if (((_ref = points[point.i - 1]) != null ? _ref.x : void 0) === point.x && ((_ref1 = points[point.i + 1]) != null ? _ref1.x : void 0) === point.x) {
          direction = 'vertical';
        } else if (((_ref2 = points[point.i - 1]) != null ? _ref2.y : void 0) === point.y && ((_ref3 = points[point.i + 1]) != null ? _ref3.y : void 0) === point.y) {
          direction = 'horizontal';
        } else {
          direction = 'corner';
        }
        return direction;
      };

      Path.prototype.makeLine = function() {
        if (this.line == null) {
          return this.line = new Line({
            path: this
          });
        } else {
          return this.line.resetPoints(this.points);
        }
      };

      Path.prototype.removeFromGrid = function() {
        var node, point, points, _i, _len, _results;

        points = this.get('points');
        if (points == null) {
          return;
        }
        _results = [];
        for (_i = 0, _len = points.length; _i < _len; _i++) {
          point = points[_i];
          node = App.grid.at(point);
          _results.push(delete node.holders[this.get('id')]);
        }
        return _results;
      };

      Path.prototype.removeIfEmpty = function() {
        if (this.isEmpty()) {
          this.line.remove();
          this.removeFromGrid();
        }
        return App.grid.refreshGrid();
      };

      Path.prototype.isEmpty = function() {
        return this.line.get('points').length <= 2;
      };

      return Path;

    })(ProtoClass);
    return Path;
  });

}).call(this);
