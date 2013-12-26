// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('port', ['ProtoClass', 'path'], function(ProtoClass, Path) {
    var Port, _ref;

    Port = (function(_super) {
      __extends(Port, _super);

      function Port() {
        _ref = Port.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Port.prototype.initialize = function(o) {
        this.o = o != null ? o : {};
        this.o.parent && (this.set('parent', this.o.parent));
        this.set('connections', []);
        this.setIJ();
        this.on('change', _.bind(this.onChange, this));
        return this;
      };

      Port.prototype.onChange = function() {
        var connection, i, _i, _len, _ref1;

        _ref1 = this.get('connections');
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
          connection = _ref1[i];
          connection.path.set("" + connection.direction + "IJ", this.get('ij'));
        }
        return App.grid.refreshGrid();
      };

      Port.prototype.addConnection = function(path) {
        var connections, direction, point;

        direction = '';
        if (path == null) {
          path = new Path;
          path.set({
            'connectedTo': this.get('parent'),
            'startIJ': this.get('ij'),
            'endIJ': this.get('ij')
          });
          direction = 'start';
        } else {
          point = path.currentAddPoint || 'endIJ';
          direction = point === 'startIJ' ? 'start' : 'end';
          path.set(point, this.get('ij'));
        }
        connections = this.get('connections');
        connections.push({
          direction: direction,
          path: path,
          id: App.helpers.genHash()
        });
        this.set('connections', connections);
        return path;
      };

      Port.prototype.setIJ = function() {
        var i, j, parent, parentStartIJ;

        parent = this.get('parent');
        parentStartIJ = parent.get('startIJ');
        i = parentStartIJ.i + ~~(parent.get('w') / 2);
        j = parentStartIJ.j + ~~(parent.get('h') / 2);
        this.set('ij', {
          i: i,
          j: j
        });
        return this;
      };

      return Port;

    })(ProtoClass);
    return Port;
  });

}).call(this);
