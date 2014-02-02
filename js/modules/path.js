// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('path', ['jquery', 'helpers', 'ProtoClass', 'line', 'underscore', 'hammer'], function($, helpers, ProtoClass, Line, _, hammer) {
    var Path, _ref;

    Path = (function(_super) {
      __extends(Path, _super);

      function Path() {
        _ref = Path.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Path.prototype.type = 'path';

      Path.prototype.initialize = function(o) {
        this.o = o != null ? o : {};
        this.set('id', helpers.genHash());
        if (this.o.coords) {
          this.set({
            'startIJ': App.grid.toIJ(this.o.coords),
            'endIJ': App.grid.toIJ(this.o.coords)
          });
        }
        this.on('change:startIJ', _.bind(this.onChange, this));
        return this.on('change:endIJ', _.bind(this.onChange, this));
      };

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
        this.makeSvgPath();
        return App.grid.refreshGrid();
      };

      Path.prototype.pushPoint = function(ij, i) {
        var node, point, xy, _ref1;

        xy = App.grid.fromIJ(ij);
        node = App.grid.atIJ(ij);
        if ((_ref1 = node.holders) == null) {
          node.holders = {};
        }
        node.holders[this.get('id')] = this;
        point = {
          x: xy.x,
          y: xy.y,
          curve: null,
          i: i
        };
        this.points.push(point);
        return this.points;
      };

      Path.prototype.getOrientation = function(block, point, tobj) {
        var b1, b2, orient, point1;

        if (tobj) {
          point1 = this.transform(tobj, point);
          b1 = this.transform(tobj, block.get('startIJ'));
          b2 = this.transform(tobj, block.get('endIJ'));
        } else {
          point1 = point;
          b1 = block.get('startIJ');
          b2 = block.get('endIJ');
        }
        if (point1.i === b1.i - 1) {
          orient = 'W';
        } else {
          if (point1.j === b1.j - 1) {
            orient = 'N';
          } else {
            if (point1.i === b2.i) {
              orient = 'E';
            } else {
              orient = 'S';
            }
          }
        }
        return orient;
      };

      Path.prototype.transfObject = function(origin, orientation) {
        var tobj;

        tobj = {};
        tobj.i0 = origin.i;
        tobj.j0 = origin.j;
        tobj.ki = 1;
        tobj.kj = 1;
        if (orientation === 'W' || orientation === 'E') {
          tobj.x = 'i';
          tobj.y = 'j';
        } else {
          tobj.x = 'j';
          tobj.y = 'i';
        }
        if (orientation === 'W') {
          tobj.ki = -1;
        }
        if (orientation === 'S') {
          tobj.kj = -1;
        }
        return tobj;
      };

      Path.prototype.transform = function(tobj, point, back) {
        var newPoint;

        newPoint = {};
        if (back) {
          newPoint[tobj.x] = tobj[tobj.x + '0'] + point.i * tobj.ki;
          newPoint[tobj.y] = tobj[tobj.y + '0'] + point.j * tobj.kj;
        } else {
          newPoint.i = (-tobj[tobj.x + '0'] + point[tobj.x]) / tobj.ki;
          newPoint.j = (-tobj[tobj.y + '0'] + point[tobj.y]) / tobj.kj;
        }
        return newPoint;
      };

      Path.prototype.recalcPath = function() {
        var cur, endBlock, endBlock1, endBlock2, endIJ, endPoint, intX, oEnd, oStart, sb, startBlock, startIJ, t, xy, xy1;

        this.points = [];
        startIJ = this.get('startIJ');
        endIJ = this.get('endIJ');
        startBlock = this.get('connectedStart');
        endBlock = this.get('connectedEnd');
        sb = startBlock.get('startIJ');
        oStart = "E";
        oEnd = "W";
        if (startBlock) {
          oStart = this.getOrientation(startBlock, startIJ);
        }
        t = this.transfObject(startIJ, oStart);
        endPoint = this.transform(t, endIJ);
        if (endBlock) {
          oEnd = this.getOrientation(endBlock, endIJ, t);
          endBlock1 = this.transform(t, endBlock.get('startIJ'));
          endBlock2 = this.transform(t, endBlock.get('endIJ'));
        }
        this.pushPoint(startIJ, 0);
        if (endPoint.i > 0) {
          if (oEnd === 'W') {
            intX = Math.round(endPoint.i / 2);
            xy = {
              i: intX,
              j: 0
            };
            this.pushPoint(this.transform(t, xy, true), 1);
            xy1 = {
              i: intX,
              j: endPoint.j
            };
            this.pushPoint(this.transform(t, xy1, true), 2);
          }
          if (oEnd === 'S') {
            if (endPoint.j < 0) {
              xy = {
                i: endPoint.i,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
            } else {
              intX = Math.round(endPoint.i / 2);
              xy = {
                i: intX,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
              xy1 = {
                i: intX,
                j: endPoint.j
              };
              this.pushPoint(this.transform(t, xy1, true), 2);
            }
          }
          if (oEnd === 'N') {
            if (endPoint.j > 0) {
              xy = {
                i: endPoint.i,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
            } else {
              intX = Math.round(endPoint.i / 2);
              xy = {
                i: intX,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
              xy1 = {
                i: intX,
                j: endPoint.j
              };
              this.pushPoint(this.transform(t, xy1, true), 2);
            }
          }
          if (oEnd === 'E') {
            if (endBlock && endBlock1.j < 1 && endBlock2.j > 0) {
              xy = {
                i: endBlock1.i - 1,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
              xy = {
                i: endBlock1.i - 1,
                j: endBlock1.j - 1
              };
              this.pushPoint(this.transform(t, xy, true), 2);
              xy = {
                i: endBlock2.i,
                j: endBlock1.j - 1
              };
              this.pushPoint(this.transform(t, xy, true), 3);
            } else {
              xy = {
                i: endPoint.i,
                j: 0
              };
              this.pushPoint(this.transform(t, xy, true), 1);
            }
          }
        }
        this.pushPoint(endIJ, 33);
        cur = startIJ;
        this.set('points', this.points);
        helpers.timeOut('path recalc');
        return this;
      };

      Path.prototype.makeGlimps = function() {
        var baseDirection, end, endBlock, endBlockH, endBlockW, endIJ, returnValue, start, startBlock, startBlockH, startBlockW, startIJ, xBase, xDifference, yBase, yDifference;

        startIJ = this.get('startIJ');
        endIJ = this.get('endIJ');
        startBlock = this.get('connectedStart');
        endBlock = this.get('connectedEnd');
        startBlockW = !startBlock ? 0 : startBlock.get('w') / 2;
        startBlockH = !startBlock ? 0 : startBlock.get('h') / 2;
        endBlockW = !endBlock ? 0 : endBlock.get('w') / 2;
        endBlockH = !endBlock ? 0 : endBlock.get('h') / 2;
        if (startIJ.i < endIJ.i) {
          end = startIJ.i + startBlockW;
          xDifference = (endIJ.i - endBlockW) - end;
          xBase = end + (xDifference / 2);
        } else {
          start = endIJ.i + endBlockW;
          xDifference = (startIJ.i - startBlockW) - start;
          xBase = start + (xDifference / 2);
        }
        if (startIJ.j < endIJ.j) {
          end = startIJ.j + startBlockH;
          yDifference = (endIJ.j - endBlockH) - end;
          yBase = end + (yDifference / 2);
        } else {
          start = endIJ.j + endBlockH;
          yDifference = (startIJ.j - startBlockH) - start;
          yBase = start + (yDifference / 2);
        }
        baseDirection = xDifference >= yDifference ? 'i' : 'j';
        return returnValue = {
          direction: baseDirection,
          base: baseDirection === 'i' ? xBase : yBase,
          startBlock: startBlock,
          endBlock: endBlock
        };
      };

      Path.prototype.calcPolar = function() {
        var firstPoint, lastPoint, points;

        points = this.get('points');
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
        var myDirection, name, node, path, point, _i, _len, _ref1, _results,
          _this = this;

        this.set('intersects', {});
        _ref1 = this.get('points');
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          point = _ref1[_i];
          myDirection = this.directionAt(point);
          node = App.grid.at(point);
          if (_.size(node.holders) > 1) {
            _.chain(node.holders).where({
              type: 'path'
            }).each(function(holder) {
              return _this.set('intersects', (_this.get('intersects')[holder.id] = holder));
            });
            _results.push((function() {
              var _ref2, _results1;

              _ref2 = this.get('intersects');
              _results1 = [];
              for (name in _ref2) {
                path = _ref2[name];
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
        var direction, point, points, _ref1, _ref2, _ref3, _ref4;

        points = this.get('points');
        point = _.where(points, {
          x: xy.x,
          y: xy.y
        })[0];
        if (!point) {
          return 'corner';
        }
        if (((_ref1 = points[point.i - 1]) != null ? _ref1.x : void 0) === point.x && ((_ref2 = points[point.i + 1]) != null ? _ref2.x : void 0) === point.x) {
          direction = 'vertical';
        } else if (((_ref3 = points[point.i - 1]) != null ? _ref3.y : void 0) === point.y && ((_ref4 = points[point.i + 1]) != null ? _ref4.y : void 0) === point.y) {
          direction = 'horizontal';
        } else {
          direction = 'corner';
        }
        return direction;
      };

      Path.prototype.makeSvgPath = function() {
        var _this = this;

        if (this.line == null) {
          this.line = new Line({
            path: this
          });
          return hammer(this.line.line).on('touch', function() {
            return console.log('touch');
          });
        } else {
          return this.line.resetPoints(this.get('points'));
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
        var _ref1;

        return ((_ref1 = this.line) != null ? _ref1.get('points').length : void 0) <= 2;
      };

      return Path;

    })(ProtoClass);
    return Path;
  });

}).call(this);

/*
//@ sourceMappingURL=path.map
*/
