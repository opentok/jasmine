getJasmineRequireObj().util = function(j$) {
  var util = {};

  util.inherit = function(childClass, parentClass) {
    var Subclass = function() {};
    Subclass.prototype = parentClass.prototype;
    childClass.prototype = new Subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) {
      return str;
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) {
      arrayOfArgs.push(args[i]);
    }
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.arrayContains = function(array, search) {
    var i = array.length;
    while (i--) {
      if (array[i] === search) {
        return true;
      }
    }
    return false;
  };

  util.clone = function(obj) {
    if (Object.prototype.toString.apply(obj) === '[object Array]') {
      return obj.slice();
    }

    var cloned = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        cloned[prop] = obj[prop];
      }
    }

    return cloned;
  };

  util.cloneArgs = function(args) {
    var clonedArgs = [];
    var argsAsArray = j$.util.argsToArray(args);
    for (var i = 0; i < argsAsArray.length; i++) {
      var str = Object.prototype.toString.apply(argsAsArray[i]),
        primitives = /^\[object (Boolean|String|RegExp|Number)/;

      // All falsey values are either primitives, `null`, or `undefined.
      if (!argsAsArray[i] || str.match(primitives)) {
        clonedArgs.push(argsAsArray[i]);
      } else {
        clonedArgs.push(j$.util.clone(argsAsArray[i]));
      }
    }
    return clonedArgs;
  };

  util.getPropertyDescriptor = function(obj, methodName) {
    var descriptor,
      proto = obj;

    do {
      descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
      proto = Object.getPrototypeOf(proto);
    } while (!descriptor && proto);

    return descriptor;
  };

  util.objectDifference = function(obj, toRemove) {
    var diff = {};

    for (var key in obj) {
      if (util.has(obj, key) && !util.has(toRemove, key)) {
        diff[key] = obj[key];
      }
    }

    return diff;
  };

  util.has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  util.errorWithStack = function errorWithStack() {
    // Don't throw and catch if we don't have to, because it makes it harder
    // for users to debug their code with exception breakpoints.
    var error = new Error();

    if (error.stack) {
      return error;
    }

    // But some browsers (e.g. Phantom) only provide a stack trace if we throw.
    try {
      throw new Error();
    } catch (e) {
      return e;
    }
  };

  function callerFile() {
    var file = '';

    // ElectronJS versions 11.0.0-nightly.20200721 and beyond won't expose the
    // caller file for some reason.
    try {
      var trace = new j$.StackTrace(util.errorWithStack());
      file = trace.frames[2].file;
    } catch(err) {
      // The stack trace didn't expose call files for some reason.  If
      // we're using karma, we can extract jasmine's file location.
      if (window.__karma__) {
        var fileToIdMap = window.__karma__.files;

        for (var file in fileToIdMap) {
          var isJasmineFile = /jasmine\.js$/.test(file);

          if (isJasmineFile) {
            var origin = window.location.origin;
            var id = fileToIdMap[file];

            file = origin + file + '?' + id;

            // We found the jasmine file -- no need to keep iterating.
            break;
          }
        }
      }

      return file;
    }
  }

  util.jasmineFile = (function() {
    var result;

    return function() {
      if (!result) {
        result = callerFile();
      }

      return result;
    };
  })();

  function StopIteration() {}
  StopIteration.prototype = Object.create(Error.prototype);
  StopIteration.prototype.constructor = StopIteration;

  // useful for maps and sets since `forEach` is the only IE11-compatible way to iterate them
  util.forEachBreakable = function(iterable, iteratee) {
    function breakLoop() {
      throw new StopIteration();
    }

    try {
      iterable.forEach(function(value, key) {
        iteratee(breakLoop, value, key, iterable);
      });
    } catch (error) {
      if (!(error instanceof StopIteration)) throw error;
    }
  };

  return util;
};
