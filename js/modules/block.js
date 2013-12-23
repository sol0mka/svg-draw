// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('block', ['helpers', 'ProtoClass', 'hammer', 'path', 'port'], function(helpers, ProtoClass, hammer, Path, Port) {
    var Block;

    Block = (function(_super) {
      __extends(Block, _super);

      Block.prototype.type = 'block';

      function Block(o) {
        var coords;

        this.o = o != null ? o : {};
        this.id = helpers.genHash();
        this.isValid = false;
        this.startIJ = {
          i: 0,
          j: 0
        };
        this.endIJ = {
          i: 0,
          j: 0
        };
        this.isDragMode = true;
        this.isValidPosition = true;
        this.isValidSize = false;
        if (this.o.coords) {
          coords = App.grid.normalizeCoords(App.grid.getNearestCell(this.o.coords || {
            x: 0,
            y: 0
          }));
          this.set({
            'startIJ': coords,
            'endIJ': coords
          });
        }
        this.createPort();
        this.render();
        this.onChange = this.render;
        this;
      }

      Block.prototype.createPort = function() {
        return this.port = new Port({
          parent: this
        });
      };

      Block.prototype.render = function() {
        this.calcDimentions();
        this.removeOldSelfFromGrid();
        if (this.$el == null) {
          this.$el = $('<div>').addClass('block-e').append($('<div>'));
          App.$main.append(this.$el);
          this.listenEvents();
        }
        this.$el.css({
          'width': this.w * App.gs,
          'height': this.h * App.gs,
          'top': this.startIJ.j * App.gs,
          'left': this.startIJ.i * App.gs
        }).toggleClass('is-invalid', !this.isValid || (this.w * App.gs < App.gs) || (this.h * App.gs < App.gs));
        return this;
      };

      Block.prototype.calcDimentions = function() {
        this.w = this.endIJ.i - this.startIJ.i;
        this.h = this.endIJ.j - this.startIJ.j;
        return this.refreshPort();
      };

      Block.prototype.listenEvents = function() {
        var _this = this;

        hammer(this.$el[0]).on('touch', function(e) {
          var coords;

          coords = helpers.getEventCoords(e);
          if (App.currTool === 'path') {
            App.isBlockToPath = _this.port.addConnection();
          }
          return helpers.stopEvent(e);
        });
        hammer(this.$el[0]).on('drag', function(e) {
          var coords;

          if (App.blockDrag) {
            return true;
          }
          coords = helpers.getEventCoords(e);
          if (App.currTool === 'block') {
            _this.moveTo({
              x: e.gesture.deltaX,
              y: e.gesture.deltaY
            });
            return helpers.stopEvent(e);
          }
        });
        hammer(this.$el[0]).on('release', function(e) {
          var coords;

          coords = helpers.getEventCoords(e);
          if (App.currTool === 'path') {
            if (App.currPath && App.currBlock) {
              App.currBlock.port.addConnection(App.currPath);
              App.isBlockToPath = null;
            }
          } else {
            _this.removeOldSelfFromGrid();
            _this.addFinilize();
            return false;
          }
          return helpers.stopEvent(e);
        });
        this.$el.on('mouseenter', function() {
          if (_this.isDragMode) {
            return;
          }
          App.currBlock = _this;
          if (App.currTool === 'path') {
            return _this.$el.addClass('is-connect-path');
          } else {
            return _this.$el.addClass('is-drag');
          }
        });
        return this.$el.on('mouseleave', function() {
          if (_this.isDragMode) {
            return;
          }
          App.currBlock = null;
          if (App.currTool === 'path') {
            return _this.$el.removeClass('is-connect-path');
          } else {
            return _this.$el.removeClass('is-drag');
          }
        });
      };

      Block.prototype.moveTo = function(coords) {
        var bottom, left, right, shift, top;

        coords = App.grid.normalizeCoords(coords);
        if (!this.isMoveTo) {
          this.buffStartIJ = helpers.cloneObj(this.startIJ);
          this.buffEndIJ = helpers.cloneObj(this.endIJ);
          this.isMoveTo = true;
        }
        top = this.buffStartIJ.j + coords.j;
        bottom = this.buffEndIJ.j + coords.j;
        left = this.buffStartIJ.i + coords.i;
        right = this.buffEndIJ.i + coords.i;
        if (top < 0) {
          shift = top;
          top = 0;
          bottom = top + this.h;
        }
        if (left < 0) {
          shift = left;
          left = 0;
          right = left + this.w;
        }
        return this.set({
          'startIJ': {
            i: left,
            j: top
          },
          'endIJ': {
            i: right,
            j: bottom
          },
          'isValid': this.isSuiteSize()
        });
      };

      Block.prototype.setSizeDelta = function(deltas) {
        return this.set({
          'endIJ': {
            i: this.startIJ.i + deltas.i,
            j: this.startIJ.j + deltas.j
          },
          'isValid': this.isSuiteSize()
        });
      };

      Block.prototype.isSuiteSize = function() {
        var i, j, node, _i, _j, _ref, _ref1, _ref2, _ref3;

        this.isValidPosition = true;
        for (i = _i = _ref = this.startIJ.i, _ref1 = this.endIJ.i; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          for (j = _j = _ref2 = this.startIJ.j, _ref3 = this.endIJ.j; _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
            node = App.grid.grid.getNodeAt(i, j);
            if ((node.block != null) && (node.block.id !== this.id)) {
              return this.isValidPosition = false;
            }
          }
        }
        this.calcDimentions();
        return this.isValidSize = this.w > 0 && this.h > 0;
      };

      Block.prototype.addFinilize = function() {
        this.isMoveTo = false;
        if (!this.isValid && !this.isValidSize) {
          this.removeSelf();
          return false;
        } else if (!this.isValidPosition) {
          this.set({
            'startIJ': helpers.cloneObj(this.buffStartIJ),
            'endIJ': helpers.cloneObj(this.buffEndIJ),
            'isValid': true
          }, this.isValidPosition = true);
        }
        this.isDragMode = false;
        return this.setToGrid();
      };

      Block.prototype.refreshPort = function() {
        return this.port.setIJ();
      };

      Block.prototype.setToGrid = function() {
        var i, j, _i, _j, _ref, _ref1, _ref2, _ref3;

        for (i = _i = _ref = this.startIJ.i, _ref1 = this.endIJ.i; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          for (j = _j = _ref2 = this.startIJ.j, _ref3 = this.endIJ.j; _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
            if (!App.grid.holdCell({
              i: i,
              j: j
            }, this)) {
              this.set('isValid', false);
              return false;
            }
          }
        }
        App.grid.refreshGrid();
        return true;
      };

      Block.prototype.removeSelf = function() {
        this.removeSelfFromGrid();
        return this.removeSelfFromDom();
      };

      Block.prototype.removeSelfFromGrid = function() {
        var i, j, _i, _j, _ref, _ref1, _ref2, _ref3;

        for (i = _i = _ref = this.startIJ.i, _ref1 = this.endIJ.i; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          for (j = _j = _ref2 = this.startIJ.j, _ref3 = this.endIJ.j; _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
            App.grid.releaseCell({
              i: i,
              j: j
            }, this);
          }
        }
        return App.grid.refreshGrid();
      };

      Block.prototype.removeSelfFromDom = function() {
        return this.$el.remove();
      };

      Block.prototype.removeOldSelfFromGrid = function() {
        var i, j, _i, _j, _ref, _ref1, _ref2, _ref3;

        if (this.buffStartIJ == null) {
          return;
        }
        for (i = _i = _ref = this.buffStartIJ.i, _ref1 = this.buffEndIJ.i; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          for (j = _j = _ref2 = this.buffStartIJ.j, _ref3 = this.buffEndIJ.j; _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; j = _ref2 <= _ref3 ? ++_j : --_j) {
            App.grid.releaseCell({
              i: i,
              j: j
            }, this);
          }
        }
        return App.grid.refreshGrid();
      };

      return Block;

    })(ProtoClass);
    return Block;
  });

}).call(this);
