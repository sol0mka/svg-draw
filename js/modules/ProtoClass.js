// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('ProtoClass', ['backbone'], function(B) {
    var ProtoClass, _ref;

    ProtoClass = (function(_super) {
      __extends(ProtoClass, _super);

      function ProtoClass() {
        _ref = ProtoClass.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return ProtoClass;

    })(B.Model);
    return ProtoClass;
  });

}).call(this);
