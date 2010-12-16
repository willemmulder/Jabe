(function($) {

  var addMethods = function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = $.keys(source);

    if (!$.keys({ toString: true }).length) properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && $.isFunction(value) && $.argumentNames(value)[0] == "$super") {

        var method = value, value = $.extend($.wrap((function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property), method), {
          valueOf:  function() { return method },
          toString: function() { return method.toString() }
        });
      }
      this.prototype[property] = value;
    }

    return this;
  }

  $.extend({
    keys: function(obj) {
      var keys = [];
      for (var key in obj) keys.push(key);
      return keys;
    },

    argumentNames: function(func) {
      var names = func.toString().match(/^[\s\(]*function[^(]*\((.*?)\)/)[1].split(/, ?/);
      return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function(func, scope) {
      return function() {
        return func.apply(scope, $.makeArray(arguments));
      }
    },

    wrap: function(func, wrapper) {
      var __method = func;
      return function() {
        return wrapper.apply(this, [$.bind(__method, this)].concat($.makeArray(arguments)));
      }
    },

    klass: function() {
      var parent = null, properties = $.makeArray(arguments);
      if ($.isFunction(properties[0])) parent = properties.shift();

      var klass = function() {
        this.initialize.apply(this, arguments);
      };

      klass.superclass = parent;
      klass.subclasses = [];
      klass.addMethods = addMethods;

      if (parent) {
        var subclass = function() { };
        subclass.prototype = parent.prototype;
        klass.prototype = new subclass;
        parent.subclasses.push(klass);
      }

      for (var i = 0; i < properties.length; i++)
        klass.addMethods(properties[i]);

      if (!klass.prototype.initialize)
        klass.prototype.initialize = function() {};

      klass.prototype.constructor = klass;

      return klass;
    },
    delegate: function(rules) {
      return function(e) {
        var target = $(e.target), parent = null;
        for (var selector in rules) {
          if (target.is(selector) || ((parent = target.parents(selector)) && parent.length > 0)) {
            return rules[selector].apply(this, [parent || target].concat($.makeArray(arguments)));
          }
          parent = null;
        }
      }
    }
  });

})(jQuery);
