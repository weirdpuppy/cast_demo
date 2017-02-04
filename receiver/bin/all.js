// Copyright 2015 Google Inc. All Rights Reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var goog = goog || {};
goog.global = this;
goog.isDef = function(val) {
  return void 0 !== val;
};
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split("."), cur = opt_objectToExportTo || goog.global;
  parts[0] in cur || !cur.execScript || cur.execScript("var " + parts[0]);
  for (var part;parts.length && (part = parts.shift());) {
    !parts.length && goog.isDef(opt_object) ? cur[part] = opt_object : cur = cur[part] ? cur[part] : cur[part] = {};
  }
};
goog.define = function(name, defaultValue) {
  goog.exportPath_(name, defaultValue);
};
goog.DEBUG = !0;
goog.LOCALE = "en";
goog.TRUSTED_SITE = !0;
goog.STRICT_MODE_COMPATIBLE = !1;
goog.DISALLOW_TEST_ONLY_CODE = !goog.DEBUG;
goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1;
goog.provide = function(name) {
  goog.constructNamespace_(name);
};
goog.constructNamespace_ = function(name, opt_obj) {
  goog.exportPath_(name, opt_obj);
};
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
goog.module = function(name) {
  if (!goog.isString(name) || !name || -1 == name.search(goog.VALID_MODULE_RE_)) {
    throw Error("Invalid module identifier");
  }
  if (!goog.isInModuleLoader_()) {
    throw Error("Module " + name + " has been loaded incorrectly.");
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error("goog.module may only be called once per module.");
  }
  goog.moduleLoaderState_.moduleName = name;
};
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};
goog.module.getInternal_ = function() {
};
goog.moduleLoaderState_ = null;
goog.isInModuleLoader_ = function() {
  return null != goog.moduleLoaderState_;
};
goog.module.declareTestMethods = function() {
  if (!goog.isInModuleLoader_()) {
    throw Error("goog.module.declareTestMethods must be called from within a goog.module");
  }
  goog.moduleLoaderState_.declareTestMethods = !0;
};
goog.module.declareLegacyNamespace = function() {
  goog.moduleLoaderState_.declareLegacyNamespace = !0;
};
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    throw opt_message = opt_message || "", Error("Importing test-only code into non-debug environment" + (opt_message ? ": " + opt_message : "."));
  }
};
goog.forwardDeclare = function() {
};
goog.getObjectByName = function(name, opt_obj) {
  for (var parts = name.split("."), cur = opt_obj || goog.global, part;part = parts.shift();) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global, x;
  for (x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires, opt_isModule) {
  if (goog.DEPENDENCIES_ENABLED) {
    for (var provide, require, path = relPath.replace(/\\/g, "/"), deps = goog.dependencies_, i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path, deps.pathIsModule[path] = !!opt_isModule;
    }
    for (var j = 0;require = requires[j];j++) {
      path in deps.requires || (deps.requires[path] = {}), deps.requires[path][require] = !0;
    }
  }
};
goog.useStrictRequires = !1;
goog.ENABLE_DEBUG_LOADER = !0;
goog.logToConsole_ = function(msg) {
  goog.global.console && goog.global.console.error(msg);
};
goog.require = function() {
};
goog.basePath = "";
goog.nullFunction = function() {
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor);
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
goog.LOAD_MODULE_USING_EVAL = !0;
goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
goog.loadedModules_ = {};
goog.DEPENDENCIES_ENABLED = !1;
goog.DEPENDENCIES_ENABLED && (goog.included_ = {}, goog.dependencies_ = {pathIsModule:{}, nameToPath:{}, requires:{}, visited:{}, written:{}, deferred:{}}, goog.inHtmlDocument_ = function() {
  var doc = goog.global.document;
  return "undefined" != typeof doc && "write" in doc;
}, goog.findBasePath_ = function() {
  if (goog.global.CLOSURE_BASE_PATH) {
    goog.basePath = goog.global.CLOSURE_BASE_PATH;
  } else {
    if (goog.inHtmlDocument_()) {
      for (var scripts = goog.global.document.getElementsByTagName("SCRIPT"), i = scripts.length - 1;0 <= i;--i) {
        var src = scripts[i].src, qmark = src.lastIndexOf("?"), l = -1 == qmark ? src.length : qmark;
        if ("base.js" == src.substr(l - 7, 7)) {
          goog.basePath = src.substr(0, l - 7);
          break;
        }
      }
    }
  }
}, goog.importScript_ = function(src, opt_sourceText) {
  (goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_)(src, opt_sourceText) && (goog.dependencies_.written[src] = !0);
}, goog.IS_OLD_IE_ = !goog.global.atob && goog.global.document && goog.global.document.all, goog.importModule_ = function(src) {
  goog.importScript_("", 'goog.retrieveAndExecModule_("' + src + '");') && (goog.dependencies_.written[src] = !0);
}, goog.queuedModules_ = [], goog.wrapModule_ = function(srcUrl, scriptText) {
  return goog.LOAD_MODULE_USING_EVAL && goog.isDef(goog.global.JSON) ? "goog.loadModule(" + goog.global.JSON.stringify(scriptText + "\n//# sourceURL=" + srcUrl + "\n") + ");" : 'goog.loadModule(function(exports) {"use strict";' + scriptText + "\n;return exports});\n//# sourceURL=" + srcUrl + "\n";
}, goog.loadQueuedModules_ = function() {
  var count = goog.queuedModules_.length;
  if (0 < count) {
    var queue = goog.queuedModules_;
    goog.queuedModules_ = [];
    for (var i = 0;i < count;i++) {
      goog.maybeProcessDeferredPath_(queue[i]);
    }
  }
}, goog.maybeProcessDeferredDep_ = function(name) {
  goog.isDeferredModule_(name) && goog.allDepsAreAvailable_(name) && goog.maybeProcessDeferredPath_(goog.basePath + goog.getPathFromDeps_(name));
}, goog.isDeferredModule_ = function(name) {
  var path = goog.getPathFromDeps_(name);
  return path && goog.dependencies_.pathIsModule[path] ? goog.basePath + path in goog.dependencies_.deferred : !1;
}, goog.allDepsAreAvailable_ = function(name) {
  var path = goog.getPathFromDeps_(name);
  if (path && path in goog.dependencies_.requires) {
    for (var requireName in goog.dependencies_.requires[path]) {
      if (!goog.isProvided_(requireName) && !goog.isDeferredModule_(requireName)) {
        return !1;
      }
    }
  }
  return !0;
}, goog.maybeProcessDeferredPath_ = function(abspath) {
  if (abspath in goog.dependencies_.deferred) {
    var src = goog.dependencies_.deferred[abspath];
    delete goog.dependencies_.deferred[abspath];
    goog.globalEval(src);
  }
}, goog.loadModule = function(moduleDef) {
  var previousState = goog.moduleLoaderState_;
  try {
    goog.moduleLoaderState_ = {moduleName:void 0, declareTestMethods:!1};
    var exports;
    if (goog.isFunction(moduleDef)) {
      exports = moduleDef.call(goog.global, {});
    } else {
      if (goog.isString(moduleDef)) {
        exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
      } else {
        throw Error("Invalid module definition");
      }
    }
    var moduleName = goog.moduleLoaderState_.moduleName;
    if (!goog.isString(moduleName) || !moduleName) {
      throw Error('Invalid module name "' + moduleName + '"');
    }
    goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(moduleName, exports) : goog.SEAL_MODULE_EXPORTS && Object.seal && Object.seal(exports);
    goog.loadedModules_[moduleName] = exports;
    if (goog.moduleLoaderState_.declareTestMethods) {
      for (var entry in exports) {
        if (0 === entry.indexOf("test", 0) || "tearDown" == entry || "setUp" == entry || "setUpPage" == entry || "tearDownPage" == entry) {
          goog.global[entry] = exports[entry];
        }
      }
    }
  } finally {
    goog.moduleLoaderState_ = previousState;
  }
}, goog.loadModuleFromSource_ = function(source) {
  eval(source);
  return {};
}, goog.writeScriptSrcNode_ = function(src) {
  goog.global.document.write('<script type="text/javascript" src="' + src + '">\x3c/script>');
}, goog.appendScriptSrcNode_ = function(src) {
  var doc = goog.global.document, scriptEl = doc.createElement("script");
  scriptEl.type = "text/javascript";
  scriptEl.src = src;
  scriptEl.defer = !1;
  scriptEl.async = !1;
  doc.head.appendChild(scriptEl);
}, goog.writeScriptTag_ = function(src, opt_sourceText) {
  if (goog.inHtmlDocument_()) {
    var doc = goog.global.document;
    if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && "complete" == doc.readyState) {
      if (/\bdeps.js$/.test(src)) {
        return !1;
      }
      throw Error('Cannot write "' + src + '" after document load');
    }
    var isOldIE = goog.IS_OLD_IE_;
    if (void 0 === opt_sourceText) {
      if (isOldIE) {
        var state = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ";
        doc.write('<script type="text/javascript" src="' + src + '"' + state + ">\x3c/script>");
      } else {
        goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING ? goog.appendScriptSrcNode_(src) : goog.writeScriptSrcNode_(src);
      }
    } else {
      doc.write('<script type="text/javascript">' + opt_sourceText + "\x3c/script>");
    }
    return !0;
  }
  return !1;
}, goog.lastNonModuleScriptIndex_ = 0, goog.onScriptLoad_ = function(script, scriptIndex) {
  "complete" == script.readyState && goog.lastNonModuleScriptIndex_ == scriptIndex && goog.loadQueuedModules_();
  return !0;
}, goog.writeScripts_ = function() {
  function visitNode(path) {
    if (!(path in deps.written)) {
      if (!(path in deps.visited) && (deps.visited[path] = !0, path in deps.requires)) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      path in seenScript || (seenScript[path] = !0, scripts.push(path));
    }
  }
  var scripts = [], seenScript = {}, deps = goog.dependencies_, path$$0;
  for (path$$0 in goog.included_) {
    deps.written[path$$0] || visitNode(path$$0);
  }
  for (var i = 0;i < scripts.length;i++) {
    path$$0 = scripts[i], goog.dependencies_.written[path$$0] = !0;
  }
  var moduleState = goog.moduleLoaderState_;
  goog.moduleLoaderState_ = null;
  for (i = 0;i < scripts.length;i++) {
    if (path$$0 = scripts[i]) {
      deps.pathIsModule[path$$0] ? goog.importModule_(goog.basePath + path$$0) : goog.importScript_(goog.basePath + path$$0);
    } else {
      throw goog.moduleLoaderState_ = moduleState, Error("Undefined script input");
    }
  }
  goog.moduleLoaderState_ = moduleState;
}, goog.getPathFromDeps_ = function(rule) {
  return rule in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[rule] : null;
}, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
goog.normalizePath_ = function(path) {
  for (var components = path.split("/"), i = 0;i < components.length;) {
    "." == components[i] ? components.splice(i, 1) : i && ".." == components[i] && components[i - 1] && ".." != components[i - 1] ? components.splice(--i, 2) : i++;
  }
  return components.join("/");
};
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  }
  var xhr = new goog.global.XMLHttpRequest;
  xhr.open("get", src, !1);
  xhr.send();
  return xhr.responseText;
};
goog.retrieveAndExecModule_ = function() {
};
goog.typeOf = function(value) {
  var s = typeof value;
  if ("object" == s) {
    if (value) {
      if (value instanceof Array) {
        return "array";
      }
      if (value instanceof Object) {
        return s;
      }
      var className = Object.prototype.toString.call(value);
      if ("[object Window]" == className) {
        return "object";
      }
      if ("[object Array]" == className || "number" == typeof value.length && "undefined" != typeof value.splice && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("splice")) {
        return "array";
      }
      if ("[object Function]" == className || "undefined" != typeof value.call && "undefined" != typeof value.propertyIsEnumerable && !value.propertyIsEnumerable("call")) {
        return "function";
      }
    } else {
      return "null";
    }
  } else {
    if ("function" == s && "undefined" == typeof value.call) {
      return "object";
    }
  }
  return s;
};
goog.isNull = function(val) {
  return null === val;
};
goog.isDefAndNotNull = function(val) {
  return null != val;
};
goog.isArray = function(val) {
  return "array" == goog.typeOf(val);
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return "array" == type || "object" == type && "number" == typeof val.length;
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && "function" == typeof val.getFullYear;
};
goog.isString = function(val) {
  return "string" == typeof val;
};
goog.isBoolean = function(val) {
  return "boolean" == typeof val;
};
goog.isNumber = function(val) {
  return "number" == typeof val;
};
goog.isFunction = function(val) {
  return "function" == goog.typeOf(val);
};
goog.isObject = function(val) {
  var type = typeof val;
  return "object" == type && null != val || "function" == type;
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};
goog.removeUid = function(obj) {
  "removeAttribute" in obj && obj.removeAttribute(goog.UID_PROPERTY_);
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + (1E9 * Math.random() >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if ("object" == type || "array" == type) {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = "array" == type ? [] : {}, key;
    for (key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments);
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw Error();
  }
  if (2 < arguments.length) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  }
  return function() {
    return fn.apply(selfObj, arguments);
  };
};
goog.bind = function(fn, selfObj, var_args) {
  goog.bind = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bindNative_ : goog.bindJs_;
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
  return +new Date;
};
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, "JavaScript");
  } else {
    if (goog.global.eval) {
      if (null == goog.evalWorksForGlobals_) {
        if (goog.global.eval("var _evalTest_ = 1;"), "undefined" != typeof goog.global._evalTest_) {
          try {
            delete goog.global._evalTest_;
          } catch (ignore) {
          }
          goog.evalWorksForGlobals_ = !0;
        } else {
          goog.evalWorksForGlobals_ = !1;
        }
      }
      if (goog.evalWorksForGlobals_) {
        goog.global.eval(script);
      } else {
        var doc = goog.global.document, scriptElt = doc.createElement("SCRIPT");
        scriptElt.type = "text/javascript";
        scriptElt.defer = !1;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  }, renameByParts = function(cssName) {
    for (var parts = cssName.split("-"), mapped = [], i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join("-");
  }, rename;
  rename = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? getMapping : renameByParts : function(a) {
    return a;
  };
  return opt_modifier ? className + "-" + rename(opt_modifier) : rename(className);
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.getMsg = function(str, opt_values) {
  opt_values && (str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
    return key in opt_values ? opt_values[key] : match;
  }));
  return str;
};
goog.getMsgWithFallback = function(a) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor;
  childCtor.base = function(me, methodName, var_args) {
    for (var args = Array(arguments.length - 2), i = 2;i < arguments.length;i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !caller) {
    throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
  }
  if (caller.superClass_) {
    for (var ctorArgs = Array(arguments.length - 1), i = 1;i < arguments.length;i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }
  for (var args = Array(arguments.length - 2), i = 2;i < arguments.length;i++) {
    args[i - 2] = arguments[i];
  }
  for (var foundCaller = !1, ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = !0;
    } else {
      if (foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args);
      }
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  }
  throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(fn) {
  fn.call(goog.global);
};
goog.MODIFY_FUNCTION_PROTOTYPES = !0;
goog.MODIFY_FUNCTION_PROTOTYPES && (Function.prototype.bind = Function.prototype.bind || function(selfObj, var_args) {
  if (1 < arguments.length) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.unshift(this, selfObj);
    return goog.bind.apply(null, args);
  }
  return goog.bind(this, selfObj);
}, Function.prototype.partial = function(var_args) {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(this, null);
  return goog.bind.apply(null, args);
}, Function.prototype.inherits = function(parentCtor) {
  goog.inherits(this, parentCtor);
});
goog.defineClass = function(superClass, def) {
  var constructor = def.constructor, statics = def.statics;
  constructor && constructor != Object.prototype.constructor || (constructor = function() {
    throw Error("cannot instantiate an interface (no constructor defined).");
  });
  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  superClass && goog.inherits(cls, superClass);
  delete def.constructor;
  delete def.statics;
  goog.defineClass.applyProperties_(cls.prototype, def);
  null != statics && (statics instanceof Function ? statics(cls) : goog.defineClass.applyProperties_(cls, statics));
  return cls;
};
goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
    if (superClass && superClass.prototype && superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return ctr;
    }
    var wrappedCtr = function() {
      var instance = ctr.apply(this, arguments) || this;
      instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
      this.constructor === wrappedCtr && Object.seal(instance);
      return instance;
    };
    return wrappedCtr;
  }
  return ctr;
};
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.defineClass.applyProperties_ = function(target, source) {
  for (var key in source) {
    Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
  }
  for (var i = 0;i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length;i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i], Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
  }
};
goog.tagUnsealableClass = function() {
};
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
var cast = cast || {}; cast.games = cast.games || {};
cast.games.spellcast = {};
cast.games.spellcast.Action = function() {
};
cast.games.spellcast.messages = {};
cast.games.spellcast.messages.DifficultySetting = {UNKNOWN:0, EASY:1, NORMAL:2, HARD:3};
goog.exportSymbol("cast.games.spellcast.messages.DifficultySetting", cast.games.spellcast.messages.DifficultySetting);
cast.games.spellcast.messages.PlayerBonus = {UNKNOWN:0, NONE:1, ATTACK:2, HEAL:3, SHIELD:4};
goog.exportSymbol("cast.games.spellcast.messages.PlayerBonus", cast.games.spellcast.messages.PlayerBonus);
cast.games.spellcast.messages.SpellType = {UNKNOWN:0, BASIC_ATTACK:1, HEAL:2, SHIELD:3};
goog.exportSymbol("cast.games.spellcast.messages.SpellType", cast.games.spellcast.messages.SpellType);
cast.games.spellcast.messages.SpellElement = {UNKNOWN:0, NONE:1, AIR:2, WATER:3, FIRE:4, EARTH:5};
goog.exportSymbol("cast.games.spellcast.messages.SpellElement", cast.games.spellcast.messages.SpellElement);
cast.games.spellcast.messages.SpellAccuracy = {UNKNOWN:0, PERFECT:1, GREAT:2, GOOD:3};
goog.exportSymbol("cast.games.spellcast.messages.SpellAccuracy", cast.games.spellcast.messages.SpellAccuracy);
cast.games.spellcast.messages.GameStateId = {UNKNOWN:0, WAITING_FOR_PLAYERS:1, INSTRUCTIONS:2, PLAYER_ACTION:3, PLAYER_RESOLUTION:4, ENEMY_RESOLUTION:5, PLAYER_VICTORY:6, ENEMY_VICTORY:7, PAUSED:8};
goog.exportSymbol("cast.games.spellcast.messages.GameStateId", cast.games.spellcast.messages.GameStateId);
cast.games.spellcast.messages.GameData = function() {
  this.gameStateId = cast.games.spellcast.messages.GameStateId.UNKNOWN;
};
goog.exportSymbol("cast.games.spellcast.messages.GameData", cast.games.spellcast.messages.GameData);
cast.games.spellcast.messages.PlayerReadyData = function() {
  this.playerName = "";
  this.avatarIndex = 0;
};
goog.exportSymbol("cast.games.spellcast.messages.PlayerReadyData", cast.games.spellcast.messages.PlayerReadyData);
cast.games.spellcast.messages.PlayerPlayingData = function() {
  this.difficultySetting = cast.games.spellcast.messages.DifficultySetting.EASY;
};
goog.exportSymbol("cast.games.spellcast.messages.PlayerPlayingData", cast.games.spellcast.messages.PlayerPlayingData);
cast.games.spellcast.messages.PlayerMessage = function() {
  this.playerBonus = cast.games.spellcast.messages.PlayerBonus.NONE;
  this.castSpellsDurationMillis = 0;
};
goog.exportSymbol("cast.games.spellcast.messages.PlayerMessage", cast.games.spellcast.messages.PlayerMessage);
cast.games.spellcast.messages.Spell = function() {
  this.spellType = cast.games.spellcast.messages.SpellType.UNKNOWN;
  this.spellElement = cast.games.spellcast.messages.SpellElement.NONE;
  this.spellAccuracy = cast.games.spellcast.messages.SpellAccuracy.GOOD;
};
goog.exportSymbol("cast.games.spellcast.messages.Spell", cast.games.spellcast.messages.Spell);
cast.games.spellcast.messages.SpellMessage = function() {
  this.spells = [];
};
goog.exportSymbol("cast.games.spellcast.messages.SpellMessage", cast.games.spellcast.messages.SpellMessage);
cast.games.spellcast.GameConstants = function() {
};
cast.games.spellcast.GameConstants.MAX_PLAYERS = 4;
cast.games.spellcast.GameConstants.ENDGAME_DISPLAY_DELAY = 5E3;
cast.games.spellcast.GameConstants.INSTRUCTIONS_DELAY = 1E4;
cast.games.spellcast.GameConstants.TIME_RUNNING_OUT_DELAY = 12E3;
cast.games.spellcast.GameConstants.DEATH_FX_DURATION = 2500;
cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION = 750;
cast.games.spellcast.GameConstants.HEAL_FX_DURATION = 500;
cast.games.spellcast.GameConstants.SHIELD_FX_DURATION = 500;
cast.games.spellcast.GameConstants.SHIELD_NORMAL_TINT = 16084744;
cast.games.spellcast.GameConstants.SHIELD_BONUS_TINT = 11154227;
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP = Object.create(null);
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[cast.games.spellcast.messages.DifficultySetting.EASY] = 15E3;
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[cast.games.spellcast.messages.DifficultySetting.NORMAL] = 12E3;
cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[cast.games.spellcast.messages.DifficultySetting.HARD] = 9E3;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = 2;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 3;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = 2;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 3;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = 2;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = 3;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 4;
cast.games.spellcast.GameConstants.PARTY_INITIAL_HEALTH_MAP = [0, 10, 20, 30, 40];
cast.games.spellcast.GameConstants.ENEMY_INITIAL_HEALTH_MAP = [0, 20, 40, 60, 80];
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = 1;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = 1.2;
cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1.5;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = .5;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = .8;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1.25;
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP = Object.create(null);
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[cast.games.spellcast.messages.SpellAccuracy.GOOD] = .3;
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[cast.games.spellcast.messages.SpellAccuracy.GREAT] = .6;
cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[cast.games.spellcast.messages.SpellAccuracy.PERFECT] = 1;
cast.games.spellcast.GameConstants.RANDOM_ELEMENTS = [cast.games.spellcast.messages.SpellElement.AIR, cast.games.spellcast.messages.SpellElement.WATER, cast.games.spellcast.messages.SpellElement.FIRE, cast.games.spellcast.messages.SpellElement.EARTH];
cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS = [cast.games.spellcast.messages.PlayerBonus.NONE, cast.games.spellcast.messages.PlayerBonus.NONE, cast.games.spellcast.messages.PlayerBonus.ATTACK, cast.games.spellcast.messages.PlayerBonus.SHIELD, cast.games.spellcast.messages.PlayerBonus.HEAL];
cast.games.spellcast.GameConstants.ENEMY_HEAL_VALUE = 3;
cast.games.spellcast.GameConstants.PLAYER_ATTACK_BONUS = 1;
cast.games.spellcast.GameConstants.PLAYER_HEAL_BONUS = 1;
cast.games.spellcast.GameConstants.PLAYER_SHIELD_BONUS = 1;
cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH = {WEAK:4, MEDIUM:5, STRONG:6};
cast.games.spellcast.GameConstants.ENEMY_STRENGTH_BONUS_MAP = [0, 0, 3, 6, 9];
cast.games.spellcast.GameConstants.RANDOM_ENEMY_ATTACK_STRENGTHS = [cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.WEAK, cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.MEDIUM, cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.STRONG];
cast.games.spellcast.GameConstants.PLAYER_X_POS = .1;
cast.games.spellcast.GameConstants.PLAYER_Y_POS = .8;
cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET = .06;
cast.games.spellcast.GameConstants.WAITING_FOR_PLAYERS_TEXT = "SPELLCAST\n\nWaiting for players to join game...\n";
cast.games.spellcast.GameConstants.MAX_PLAYERS_TEXT = "SPELLCAST\n\nMaximum players reached...\n";
cast.games.spellcast.GameConstants.PLAYER_COUNTDOWN = ["3", "2", "1"];
cast.games.spellcast.GameConstants.WAITING_FOR_PLAYER_ACTIONS_TEXT = "Waiting for players to draw spells...\n";
cast.games.spellcast.actions = {};
cast.games.spellcast.actions.CountdownAction = function() {
  this.game_ = null;
  this.countdownIndex_ = 0;
  this.displayPosition_ = new PIXI.Point(.5, .5);
};
cast.games.spellcast.actions.CountdownAction.prototype.init = function(game) {
  this.game_ = game;
};
cast.games.spellcast.actions.CountdownAction.prototype.onStart = function() {
  var GameConstants = cast.games.spellcast.GameConstants;
  this.game_.getCountdownPlayerActionDisplay().activate(this.displayPosition_);
  this.game_.getCountdownPlayerActionDisplay().setText(GameConstants.PLAYER_COUNTDOWN[0]);
  this.countdownIndex_ = 1;
};
cast.games.spellcast.actions.CountdownAction.prototype.onUpdate = function(elapsedTime) {
  var GameConstants = cast.games.spellcast.GameConstants;
  this.countdownIndex_ < GameConstants.PLAYER_COUNTDOWN.length && elapsedTime >= 1E3 * this.countdownIndex_ && (this.game_.getCountdownPlayerActionDisplay().setText(GameConstants.PLAYER_COUNTDOWN[this.countdownIndex_]), this.countdownIndex_ += 1);
};
cast.games.spellcast.actions.CountdownAction.prototype.onFinish = function() {
  this.game_.getCountdownPlayerActionDisplay().deactivate();
  this.game_.getWaitingPlayerActionDisplay().activate(this.displayPosition_);
  this.game_.getWaitingPlayerActionDisplay().setText(cast.games.spellcast.GameConstants.WAITING_FOR_PLAYER_ACTIONS_TEXT);
};
cast.games.spellcast.actions.CountdownAction.prototype.getExecutionTime = function() {
  return 3E3;
};
cast.games.spellcast.actions.CountdownAction.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.EnemyAttackSpell = function() {
  this.target_ = this.caster_ = this.gameManager_ = this.game_ = null;
  this.attackElement_ = cast.games.spellcast.messages.SpellElement.NONE;
  this.attackSpell_ = null;
  this.strength_ = 0;
  this.targetPosition_ = new PIXI.Point(0, 0);
  this.explosion_ = null;
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.init = function(game, caster, target, element, strength) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.caster_ = caster;
  this.target_ = target;
  this.strength_ = strength;
  this.attackElement_ = element;
  this.attackAnimation_ = this.caster_.getAttackAnimation(this.attackElement_);
  this.attackSpell_ = this.game_.setCurrentAttackSpellElement(this.attackElement_);
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onStart = function() {
  this.caster_.activate(this.attackAnimation_);
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onFinish = function() {
  this.explosion_ = null;
  this.attackSpell_.deactivate();
  var damage = this.strength_, numberConnectedPlayers = this.gameManager_.getConnectedPlayers().length, damage = damage + cast.games.spellcast.GameConstants.ENEMY_STRENGTH_BONUS_MAP[numberConnectedPlayers], damage = damage - this.game_.getPartyShieldValue();
  0 > damage && (damage = 0);
  this.game_.updatePartyHealth(-damage);
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.onUpdate = function(timeElapsed) {
  this.attackAnimation_.active || this.attackSpell_.active || this.explosion_ || this.startAttackSpell_(timeElapsed);
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.getExecutionTime = function() {
  return 6E3;
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.EnemyAttackSpell.prototype.startAttackSpell_ = function(timeElapsed) {
  this.game_.getAudioManager().playAttackSound();
  this.targetPosition_.x = this.target_.posX;
  this.targetPosition_.y = this.target_.posY;
  this.explosion_ = this.game_.setCurrentExplosionSpellElement(this.attackElement_);
  this.attackSpell_.activate(this.caster_.getAttackPosition(), this.targetPosition_, this.getExecutionTime() - timeElapsed - cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION, this.explosion_);
  switch(this.strength_) {
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.WEAK:
      this.attackSpell_.sprite.scale.x = .5;
      this.attackSpell_.sprite.scale.y = .5;
      break;
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.MEDIUM:
      this.attackSpell_.sprite.scale.x = .8;
      this.attackSpell_.sprite.scale.y = .8;
      break;
    case cast.games.spellcast.GameConstants.ENEMY_ATTACK_STRENGTH.STRONG:
      this.attackSpell_.sprite.scale.x = 1.25, this.attackSpell_.sprite.scale.y = 1.25;
  }
};
cast.games.spellcast.actions.EnemyDeathAction = function() {
  this.enemy_ = null;
  this.alpha_ = 1;
  this.whenToChangeAlpha_ = 250;
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.init = function(enemy) {
  this.enemy_ = enemy;
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.onStart = function() {
  this.whenToChangeAlpha_ = 250;
  this.enemy_.getSprite().alpha = this.alpha_;
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.onUpdate = function(elapsedTime) {
  elapsedTime < this.whenToChangeAlpha_ || (this.alpha_ = (cast.games.spellcast.GameConstants.DEATH_FX_DURATION - elapsedTime) / cast.games.spellcast.GameConstants.DEATH_FX_DURATION, this.whenToChangeAlpha_ += 250, this.enemy_.getSprite().alpha = this.alpha_);
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.onFinish = function() {
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.getExecutionTime = function() {
  return cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
};
cast.games.spellcast.actions.EnemyDeathAction.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.FullScreenDisplayAction = function() {
  this.fullScreenDisplay_ = this.game_ = null;
  this.displayDuration_ = 0;
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.init = function(game, fullScreenDisplay, displayDuration) {
  this.game_ = game;
  this.fullScreenDisplay_ = fullScreenDisplay;
  this.displayDuration_ = displayDuration;
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onStart = function() {
  this.fullScreenDisplay_.activate(this.game_.getTopLeftPosition());
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onUpdate = function() {
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.onFinish = function() {
  this.fullScreenDisplay_.deactivate();
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.getExecutionTime = function() {
  return this.displayDuration_;
};
cast.games.spellcast.actions.FullScreenDisplayAction.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.PartyDeathAction = function() {
  this.gameManager_ = this.game_ = null;
  this.alpha_ = 1;
  this.whenToChangeAlpha_ = 250;
};
cast.games.spellcast.actions.PartyDeathAction.prototype.init = function(game) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
};
cast.games.spellcast.actions.PartyDeathAction.prototype.onStart = function() {
  this.updateAlphas_();
  this.whenToChangeAlpha_ = 250;
};
cast.games.spellcast.actions.PartyDeathAction.prototype.onUpdate = function(elapsedTime) {
  elapsedTime < this.whenToChangeAlpha_ || (this.alpha_ = (cast.games.spellcast.GameConstants.DEATH_FX_DURATION - elapsedTime) / cast.games.spellcast.GameConstants.DEATH_FX_DURATION, this.whenToChangeAlpha_ += 250, this.updateAlphas_());
};
cast.games.spellcast.actions.PartyDeathAction.prototype.onFinish = function() {
  this.game_.getEnemy().deactivate();
};
cast.games.spellcast.actions.PartyDeathAction.prototype.updateAlphas_ = function() {
  for (var connectedPlayers = this.gameManager_.getConnectedPlayers(), i = 0;i < connectedPlayers.length;i++) {
    this.game_.getPlayer(connectedPlayers[i].playerId).sprite.alpha = this.alpha_;
  }
};
cast.games.spellcast.actions.PartyDeathAction.prototype.getExecutionTime = function() {
  return cast.games.spellcast.GameConstants.DEATH_FX_DURATION;
};
cast.games.spellcast.actions.PartyDeathAction.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.PlayerAttackSpell = function() {
  this.target_ = this.caster_ = this.game_ = null;
  this.attackElement_ = cast.games.spellcast.messages.SpellElement.NONE;
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;
  this.casterBonus_ = cast.games.spellcast.messages.PlayerBonus.NONE;
  this.casterEffectAndSpellPosition_ = new PIXI.Point(0, 0);
  this.damage_ = 0;
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.init = function(game, caster, target, attackElement, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.target_ = target;
  this.attackElement_ = attackElement;
  this.accuracy_ = accuracy;
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error("Missing caster player ID");
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);
  this.damage_ = this.getDamageForSpell(this.attackElement_, this.game_.getEnemyElement(), this.accuracy_);
  var explosion = null;
  0 < this.damage_ && this.target_ && (explosion = this.game_.setCurrentExplosionSpellElement(this.attackElement_), explosion.setHitEnemyAndSpellElement(this.target_, this.game_.getEnemyElement()));
  this.caster_.moveForward();
  this.casterEffectAndSpellPosition_.x = this.caster_.posX;
  this.casterEffectAndSpellPosition_.y = this.caster_.posY;
  var attackSpell = this.game_.setCurrentAttackSpellElement(this.attackElement_);
  attackSpell.activate(this.casterEffectAndSpellPosition_, this.target_.getExplosionPosition(), this.getExecutionTime() - cast.games.spellcast.GameConstants.EXPLOSION_FX_DURATION, explosion);
  var scale = cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPRITE_SCALE_MAP[this.accuracy_];
  this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.ATTACK && (scale += .25);
  attackSpell.sprite.scale.x = scale;
  attackSpell.sprite.scale.y = scale;
  this.game_.getAudioManager().playAttackSound();
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onFinish = function() {
  this.caster_.moveBackward();
  this.game_.getCurrentAttackSpell().deactivate();
  this.attackElement_ === this.game_.getEnemyElement() ? (this.game_.updateEnemyHealth(cast.games.spellcast.GameConstants.ENEMY_HEAL_VALUE), this.game_.getAudioManager().playHeal()) : this.game_.updateEnemyHealth(-this.damage_);
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.getDamageForSpell = function(attackElement, enemyElement, accuracy) {
  var Elements = cast.games.spellcast.messages.SpellElement;
  if (enemyElement == Elements.FIRE && attackElement != Elements.WATER || enemyElement == Elements.WATER && attackElement != Elements.FIRE || enemyElement == Elements.AIR && attackElement != Elements.EARTH || enemyElement == Elements.EARTH && attackElement != Elements.AIR) {
    return 0;
  }
  var damage = cast.games.spellcast.GameConstants.PLAYER_ATTACK_SPELL_DAMAGE_MAP[accuracy];
  this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.ATTACK && (damage += cast.games.spellcast.GameConstants.PLAYER_ATTACK_BONUS);
  return damage;
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.onUpdate = function() {
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.getExecutionTime = function() {
  return 3E3;
};
cast.games.spellcast.actions.PlayerAttackSpell.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.PlayerHealSpell = function() {
  this.caster_ = this.game_ = null;
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;
  this.casterBonus_ = cast.games.spellcast.messages.PlayerBonus.NONE;
  this.healUpdated_ = !1;
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.init = function(game, caster, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.accuracy_ = accuracy;
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error("Missing caster player ID");
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);
  this.caster_.moveForward();
  this.game_.getAudioManager().playHeal();
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.onUpdate = function(timeElapsed) {
  timeElapsed > cast.games.spellcast.GameConstants.HEAL_FX_DURATION && !this.healUpdated_ && (this.game_.enableHeal(cast.games.spellcast.GameConstants.PLAYER_HEAL_SPRITE_SCALE_MAP[this.accuracy_]), this.healUpdated_ = !0);
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.onFinish = function() {
  this.caster_.moveBackward();
  this.game_.disableHeal();
  var healthValue = cast.games.spellcast.GameConstants.PLAYER_HEAL_SPELL_VALUE_MAP[this.accuracy_];
  this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.HEAL && (healthValue += cast.games.spellcast.GameConstants.PLAYER_HEAL_BONUS);
  this.game_.updatePartyHealth(healthValue);
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.getExecutionTime = function() {
  return 2E3;
};
cast.games.spellcast.actions.PlayerHealSpell.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.actions.PlayerShieldSpell = function() {
  this.caster_ = this.game_ = null;
  this.casterMoved_ = !1;
  this.casterBonus_ = cast.games.spellcast.messages.PlayerBonus.NONE;
  this.partyShieldUpdated_ = !1;
  this.partyShieldNewValue_ = 0;
  this.accuracy_ = cast.games.spellcast.messages.SpellAccuracy.GOOD;
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.init = function(game, caster, accuracy) {
  this.game_ = game;
  this.caster_ = caster;
  this.accuracy_ = accuracy;
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onStart = function() {
  if (!this.caster_.playerId) {
    throw Error("No caster player ID");
  }
  this.casterBonus_ = this.game_.getPlayerBonus(this.caster_.playerId);
  switch(this.game_.getNumberOfShieldSpellsCastThisRound()) {
    case 0:
      this.casterMoved_ = !0;
      this.caster_.moveForward();
      var shieldValue = cast.games.spellcast.GameConstants.PLAYER_SHIELD_SPELL_VALUE_MAP[this.accuracy_];
      this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.SHIELD && (shieldValue += cast.games.spellcast.GameConstants.PLAYER_SHIELD_BONUS);
      this.partyShieldNewValue_ = shieldValue;
      this.game_.getAudioManager().playShield();
      break;
    case 1:
      this.casterMoved_ = !0;
      this.caster_.moveForward();
      this.partyShieldNewValue_ = 0;
      this.game_.getAudioManager().playShieldDisrupt();
      break;
    default:
      this.game_.disablePartyShield(), this.executionTime = 100;
  }
  this.game_.addNumberOfShieldSpellsCastThisRound();
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onUpdate = function(elapsedTime) {
  if (elapsedTime > cast.games.spellcast.GameConstants.SHIELD_FX_DURATION && !this.partyShieldUpdated_) {
    var tint = cast.games.spellcast.GameConstants.SHIELD_NORMAL_TINT;
    this.casterBonus_ == cast.games.spellcast.messages.PlayerBonus.SHIELD && (tint = cast.games.spellcast.GameConstants.SHIELD_BONUS_TINT);
    var alpha = cast.games.spellcast.GameConstants.PLAYER_CASTING_SPRITE_ALPHA_MAP[this.accuracy_];
    0 < this.partyShieldNewValue_ ? this.game_.enablePartyShield(this.partyShieldNewValue_, alpha, tint) : this.game_.disablePartyShield();
    this.partyShieldUpdated_ = !0;
  }
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.onFinish = function() {
  this.casterMoved_ && this.caster_.moveBackward();
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.getExecutionTime = function() {
  return 2E3;
};
cast.games.spellcast.actions.PlayerShieldSpell.prototype.getShouldFinishOnNextUpdate = function() {
  return !1;
};
cast.games.spellcast.gameobjects = {};
cast.games.spellcast.gameobjects.GameObject = function() {
};
cast.games.spellcast.gameobjects.AttackSpell = function(frameName, numberFrames, container, canvasWidth, canvasHeight) {
  for (var spellTextures = [], i = 1;i <= numberFrames;i++) {
    spellTextures.push(PIXI.Texture.fromFrame(frameName + i));
  }
  this.active = !1;
  this.sprite = new PIXI.extras.MovieClip(spellTextures);
  this.container = container;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.spellEffectPosition_ = new PIXI.Point(0, 0);
  this.duration = this.elapsedTime = this.dy = this.dx = this.posY = this.posX = this.startY = this.startX = this.targetY = this.targetX = 0;
  this.spellEffect = null;
  this.sprite.anchor.x = .5;
  this.sprite.anchor.y = .5;
  this.sprite.visible = !1;
  this.container.addChild(this.sprite);
};
cast.games.spellcast.gameobjects.AttackSpell.prototype.update = function(deltaTime) {
  this.elapsedTime += deltaTime;
  this.elapsedTime >= this.duration && (this.spellEffect && (this.spellEffectPosition_.x = this.posX, this.spellEffectPosition_.y = this.posY, this.spellEffect.activate(this.spellEffectPosition_)), this.deactivate());
  this.posX += this.dx * deltaTime;
  this.posY += this.dy * deltaTime;
  this.sprite.position.x = this.posX * this.canvasWidth;
  this.sprite.position.y = this.posY * this.canvasHeight;
  this.sprite.animationSpeed = deltaTime / 100;
};
cast.games.spellcast.gameobjects.AttackSpell.prototype.activate = function(position, target, duration, spellEffect) {
  this.active = !0;
  this.posX = position.x;
  this.posY = position.y;
  this.sprite.position.x = this.canvasWidth * position.x;
  this.sprite.position.y = this.canvasHeight * position.y;
  this.sprite.visible = !0;
  this.sprite.loop = !0;
  this.sprite.gotoAndPlay(0);
  this.targetX = target.x;
  this.targetY = target.y;
  this.duration = duration;
  this.startX = position.x;
  this.startY = position.y;
  this.dx = (this.targetX - this.posX) / duration;
  this.dy = (this.targetY - this.posY) / duration;
  this.elapsedTime = 0;
  this.spellEffect = spellEffect;
  this.sprite.rotation = 0 < this.dx ? 0 : Math.PI;
};
cast.games.spellcast.gameobjects.AttackSpell.prototype.deactivate = function() {
  this.active = !1;
  this.sprite.stop();
  this.sprite.visible = !1;
  this.sprite.scale.x = 1;
  this.sprite.scale.y = 1;
};
cast.games.spellcast.gameobjects.Enemy = function() {
};
cast.games.spellcast.gameobjects.EnemyAnimation = function() {
};
cast.games.spellcast.gameobjects.MovieEnemyAnimation = function(frameName, numberFrames, normalizedPosition, scale, container, canvasWidth, canvasHeight, animationFinishedCallback) {
  for (var enemyTextures = [], i = 1;i <= numberFrames;i++) {
    enemyTextures.push(PIXI.Texture.fromFrame(frameName + i));
  }
  this.sprite = new PIXI.extras.MovieClip(enemyTextures);
  this.active = !1;
  this.container = container;
  this.posX = normalizedPosition.x;
  this.posY = normalizedPosition.y;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  if (this.animationFinishedCallback_ = animationFinishedCallback) {
    this.sprite.onComplete = this.animationFinishedCallback_;
  }
  this.sprite.visible = !1;
  this.sprite.loop = !this.animationFinishedCallback_;
  this.sprite.scale.x = scale.x;
  this.sprite.scale.y = scale.y;
  this.container.addChild(this.sprite);
};
cast.games.spellcast.gameobjects.MovieEnemyAnimation.prototype.activate = function() {
  this.active = !0;
  this.sprite.alpha = 1;
  this.sprite.position.x = this.canvasWidth * this.posX;
  this.sprite.position.y = this.canvasHeight * this.posY;
  this.sprite.visible = !0;
  this.sprite.gotoAndPlay(0);
};
cast.games.spellcast.gameobjects.MovieEnemyAnimation.prototype.deactivate = function() {
  this.active = !1;
  this.sprite.visible = !1;
  this.sprite.stop();
};
cast.games.spellcast.gameobjects.MovieEnemyAnimation.prototype.update = function(deltaTime) {
  this.sprite.position.x = this.posX * this.canvasWidth;
  this.sprite.position.y = this.posY * this.canvasHeight;
  this.sprite.animationSpeed = deltaTime / 500;
};
cast.games.spellcast.gameobjects.ElementalEnemy = function(container, canvasWidth, canvasHeight) {
  this.idleAnimations_ = Object.create(null);
  this.attackAnimations_ = Object.create(null);
  this.hitAnimations_ = Object.create(null);
  this.attackSpellPosition_ = new PIXI.Point(.7575, .63611);
  this.explosionPosition_ = new PIXI.Point(.7575, .63611);
  this.idlePosition_ = new PIXI.Point(.60359375, .4305556);
  this.attackPosition_ = new PIXI.Point(.399375, .2086111);
  this.hitPosition_ = new PIXI.Point(.5408124, .3241667);
  this.scale_ = new PIXI.Point(1.25, 1.25);
  this.currentAnimation_ = null;
  var SpellElement = cast.games.spellcast.messages.SpellElement;
  this.idleAnimations_[SpellElement.AIR] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("air_elemental_idle", 12, this.idlePosition_, this.scale_, container, canvasWidth, canvasHeight, null);
  this.idleAnimations_[SpellElement.EARTH] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("earth_elemental_idle", 12, this.idlePosition_, this.scale_, container, canvasWidth, canvasHeight, null);
  this.idleAnimations_[SpellElement.FIRE] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("fire_elemental_idle", 12, this.idlePosition_, this.scale_, container, canvasWidth, canvasHeight, null);
  this.idleAnimations_[SpellElement.WATER] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("water_elemental_idle", 12, this.idlePosition_, this.scale_, container, canvasWidth, canvasHeight, null);
  this.attackAnimations_[SpellElement.AIR] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("air_elemental_attack", 10, this.attackPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.AIR));
  this.attackAnimations_[SpellElement.EARTH] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("earth_elemental_attack", 10, this.attackPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.EARTH));
  this.attackAnimations_[SpellElement.FIRE] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("fire_elemental_attack", 10, this.attackPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.FIRE));
  this.attackAnimations_[cast.games.spellcast.messages.SpellElement.WATER] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("water_elemental_attack", 10, this.attackPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.WATER));
  this.hitAnimations_[SpellElement.AIR] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("air_elemental_hit", 3, this.hitPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.AIR));
  this.hitAnimations_[SpellElement.EARTH] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("earth_elemental_hit", 3, this.hitPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.EARTH));
  this.hitAnimations_[SpellElement.FIRE] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("fire_elemental_hit", 3, this.hitPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.FIRE));
  this.hitAnimations_[SpellElement.WATER] = new cast.games.spellcast.gameobjects.MovieEnemyAnimation("water_elemental_hit", 3, this.hitPosition_, this.scale_, container, canvasWidth, canvasHeight, this.onAnimationFinished_.bind(this, SpellElement.WATER));
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.update = function(deltaTime) {
  this.currentAnimation_ && this.currentAnimation_.active && this.currentAnimation_.update(deltaTime);
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.activate = function(animation) {
  this.currentAnimation_ && this.currentAnimation_.deactivate();
  this.currentAnimation_ = animation;
  this.currentAnimation_.activate();
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.deactivate = function() {
  this.currentAnimation_ && this.currentAnimation_.deactivate();
  this.currentAnimation_ = null;
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getIdleAnimation = function(spellElement) {
  return this.idleAnimations_[spellElement];
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getAttackAnimation = function(spellElement) {
  return this.attackAnimations_[spellElement];
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getHitAnimation = function(spellElement) {
  return this.hitAnimations_[spellElement];
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getAttackPosition = function() {
  return this.attackSpellPosition_;
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getExplosionPosition = function() {
  return this.explosionPosition_;
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.getSprite = function() {
  if (!this.currentAnimation_) {
    throw Error("Cannot get sprite - no current animation active");
  }
  return this.currentAnimation_.sprite;
};
cast.games.spellcast.gameobjects.ElementalEnemy.prototype.onAnimationFinished_ = function(currentSpellElement) {
  this.currentAnimation_ && (this.currentAnimation_.deactivate(), this.activate(this.getIdleAnimation(currentSpellElement)));
};
cast.games.spellcast.gameobjects.Explosion = function(frameName, numberFrames, container, canvasWidth, canvasHeight, audioManager) {
  for (var explosionTextures = [], i = 1;i <= numberFrames;i++) {
    explosionTextures.push(PIXI.Texture.fromFrame(frameName + i));
  }
  this.active = !1;
  this.sprite = new PIXI.extras.MovieClip(explosionTextures);
  this.container = container;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.audioManager_ = audioManager;
  this.container.addChild(this.sprite);
  this.posY = this.posX = 0;
  this.deactivateFunction_ = goog.bind(this.deactivate, this);
  this.hitEnemy_ = null;
  this.hitSpellElement_ = cast.games.spellcast.messages.SpellElement.NONE;
  this.sprite.anchor.x = .5;
  this.sprite.anchor.y = .5;
  this.sprite.visible = !1;
};
cast.games.spellcast.gameobjects.Explosion.prototype.activate = function(position) {
  this.active = !0;
  this.posX = position.x;
  this.posY = position.y;
  this.sprite.position.x = this.canvasWidth * position.x;
  this.sprite.position.y = this.canvasHeight * position.y;
  this.sprite.visible = !0;
  this.audioManager_.playExplosionSound();
  this.sprite.loop = !1;
  this.sprite.gotoAndPlay(0);
  this.hitEnemy_ && this.hitEnemy_.activate(this.hitEnemy_.getHitAnimation(this.hitSpellElement_));
  setTimeout(this.deactivateFunction_, 500);
};
cast.games.spellcast.gameobjects.Explosion.prototype.deactivate = function() {
  this.active = !1;
  this.sprite.stop();
  this.sprite.visible = !1;
  this.hitEnemy_ = null;
};
cast.games.spellcast.gameobjects.Explosion.prototype.update = function(deltaTime) {
  this.sprite.position.x = this.posX * this.canvasWidth;
  this.sprite.position.y = this.posY * this.canvasHeight;
  this.sprite.animationSpeed = deltaTime / 100;
};
cast.games.spellcast.gameobjects.Explosion.prototype.setHitEnemyAndSpellElement = function(enemy, spellElement) {
  this.hitEnemy_ = enemy;
  this.hitSpellElement_ = spellElement;
};
cast.games.spellcast.gameobjects.FullScreenDisplay = function(backgroundImageUrl, backgroundBrightness, opt_textImageUrl, opt_textSize) {
  this.active = !1;
  var backgroundImage = cast.games.spellcast.gameobjects.FullScreenDisplay.Images_[backgroundImageUrl];
  if (!backgroundImage) {
    throw Error("backgroundImageUrl not loaded : " + backgroundImageUrl);
  }
  backgroundImage.parentNode || (backgroundImage.style.height = "100%", backgroundImage.style.position = "absolute", backgroundImage.style.visibility = "hidden", backgroundImage.style.width = "100%", document.body.appendChild(backgroundImage));
  this.backgroundImage_ = backgroundImage;
  this.backgroundBrightness_ = "brightness(" + backgroundBrightness + ")";
  this.textImage_ = null;
  var textImage = opt_textImageUrl ? cast.games.spellcast.gameobjects.FullScreenDisplay.Images_[opt_textImageUrl] : null;
  if (opt_textImageUrl && !textImage) {
    throw Error("opt_textImageUrl not loaded : " + opt_textImageUrl);
  }
  opt_textImageUrl && textImage && !textImage.parentNode && (opt_textSize ? (textImage.style.left = "50%", textImage.style.height = opt_textSize.height + "px", textImage.style.margin = "-" + opt_textSize.height / 2 + "px 0 0 -" + opt_textSize.width / 2 + "px", textImage.style.width = opt_textSize.width + "px", textImage.style.top = "50%") : (textImage.style.bottom = "0", textImage.style.left = "0", textImage.style.margin = "auto", textImage.style.position = "absolute", textImage.style.right = "0", 
  textImage.style.top = "0"), textImage.style.position = "absolute", textImage.style.visibility = "hidden", document.body.appendChild(textImage));
  this.textImage_ = textImage;
};
cast.games.spellcast.gameobjects.FullScreenDisplay.Images_ = {};
cast.games.spellcast.gameobjects.FullScreenDisplay.loadImages = function(imageUrls) {
  var numberImagesLoaded = 0;
  return new Promise(function(resolve) {
    imageUrls.forEach(function(imageUrl) {
      var image = new Image;
      image.src = imageUrl;
      image.addEventListener("load", function() {
        cast.games.spellcast.gameobjects.FullScreenDisplay.Images_[imageUrl] = image;
        numberImagesLoaded++;
        numberImagesLoaded == imageUrls.length && resolve();
      });
    });
  });
};
cast.games.spellcast.gameobjects.FullScreenDisplay.prototype.activate = function() {
  this.active = !0;
  this.backgroundImage_.style.visibility = "visible";
  this.backgroundImage_.style["-webkit-filter"] = this.backgroundBrightness_;
  this.textImage_ && (this.textImage_.style.visibility = "visible");
};
cast.games.spellcast.gameobjects.FullScreenDisplay.prototype.deactivate = function() {
  this.active = !1;
  this.backgroundImage_.style.visibility = "hidden";
  this.textImage_ && (this.textImage_.style.visibility = "hidden");
};
cast.games.spellcast.gameobjects.FullScreenDisplay.prototype.update = function() {
};
cast.games.spellcast.gameobjects.ThreeSlice = function(frameName, maxWidth, container, canvasWidth, canvasHeight) {
  this.leftSlice_ = PIXI.Sprite.fromImage(frameName + "1");
  this.middleSlice_ = PIXI.Sprite.fromImage(frameName + "2");
  this.middleSlice_.width = maxWidth;
  this.rightSlice_ = PIXI.Sprite.fromImage(frameName + "3");
  this.maxWidth = maxWidth;
  this.active = !1;
  this.posY = this.posX = 0;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.sprite = this.middleSlice_;
  this.leftSlice_.visible = !1;
  this.middleSlice_.visible = !1;
  this.rightSlice_.visible = !1;
  container.addChild(this.leftSlice_);
  container.addChild(this.middleSlice_);
  container.addChild(this.rightSlice_);
};
cast.games.spellcast.gameobjects.ThreeSlice.prototype.update = function() {
  this.leftSlice_.position.x = this.canvasWidth * this.posX;
  this.leftSlice_.position.y = this.canvasWidth * this.posY;
  this.middleSlice_.position.x = this.leftSlice_.position.x + this.leftSlice_.width;
  this.middleSlice_.position.y = this.leftSlice_.position.y;
  this.rightSlice_.position.x = this.middleSlice_.position.x + this.middleSlice_.width;
  this.rightSlice_.position.y = this.leftSlice_.position.y;
};
cast.games.spellcast.gameobjects.ThreeSlice.prototype.activate = function(position) {
  this.posX = position.x;
  this.posY = position.y;
  this.leftSlice_.position.x = this.canvasWidth * position.x;
  this.leftSlice_.position.y = this.canvasWidth * position.y;
  this.middleSlice_.position.x = this.leftSlice_.position.x + this.leftSlice_.width;
  this.middleSlice_.position.y = this.leftSlice_.position.y;
  this.rightSlice_.position.x = this.middleSlice_.position.x + this.middleSlice_.width;
  this.rightSlice_.position.y = this.leftSlice_.position.y;
  this.active = !0;
  this.leftSlice_.visible = !0;
  this.middleSlice_.visible = !0;
  this.rightSlice_.visible = !0;
};
cast.games.spellcast.gameobjects.ThreeSlice.prototype.deactivate = function() {
  this.active = !1;
  this.leftSlice_.visible = !1;
  this.middleSlice_.visible = !1;
  this.rightSlice_.visible = !1;
};
cast.games.spellcast.gameobjects.HealthDisplay = function(container, canvasWidth, canvasHeight) {
  this.backgroundMeterBar_ = new cast.games.spellcast.gameobjects.ThreeSlice("bg_meter_bar", canvasWidth / 4, container, canvasWidth, canvasHeight);
  this.redMeterBar_ = new cast.games.spellcast.gameobjects.ThreeSlice("red_meter_bar", canvasWidth / 4 - 8, container, canvasWidth, canvasHeight);
  this.greenMeterBar_ = new cast.games.spellcast.gameobjects.ThreeSlice("green_meter_bar", canvasWidth / 4 - 8, container, canvasWidth, canvasHeight);
  this.foregroundMeterPosition_ = new PIXI.Point(0, 0);
  this.active = !1;
  this.posY = this.posX = 0;
  this.container = container;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.health_ = this.maxHealth_ = -1;
};
cast.games.spellcast.gameobjects.HealthDisplay.prototype.configure = function(maxHealth) {
  if (0 >= maxHealth) {
    throw Error("maxHealth cannot be 0 or lower");
  }
  this.maxHealth_ = maxHealth;
};
cast.games.spellcast.gameobjects.HealthDisplay.prototype.updateHealth = function(health) {
  0 > health ? health = 0 : health > this.maxHealth_ && (health = this.maxHealth_);
  if (this.health_ !== health) {
    this.health_ = health;
    var barToDeactivate = null, barToActivate = null;
    4 * this.health_ < this.maxHealth_ ? (barToDeactivate = this.greenMeterBar_, barToActivate = this.redMeterBar_) : (barToDeactivate = this.redMeterBar_, barToActivate = this.greenMeterBar_);
    barToDeactivate.deactivate();
    barToActivate.activate(this.foregroundMeterPosition_);
    barToActivate.sprite.width = barToActivate.maxWidth * this.health_ / this.maxHealth_;
    barToActivate.update(0);
  }
};
cast.games.spellcast.gameobjects.HealthDisplay.prototype.activate = function(position) {
  this.active = !0;
  this.posX = position.x;
  this.posY = position.y;
  this.backgroundMeterBar_.activate(position);
  this.foregroundMeterPosition_.x = position.x + 8 / this.canvasWidth;
  this.foregroundMeterPosition_.y = position.y + 4 / this.canvasHeight;
  this.redMeterBar_.activate(this.foregroundMeterPosition_);
  this.greenMeterBar_.activate(this.foregroundMeterPosition_);
};
cast.games.spellcast.gameobjects.HealthDisplay.prototype.deactivate = function() {
  this.active = !1;
  this.backgroundMeterBar_.deactivate();
  this.redMeterBar_.deactivate();
  this.greenMeterBar_.deactivate();
};
cast.games.spellcast.gameobjects.HealthDisplay.prototype.update = function() {
};
cast.games.spellcast.gameobjects.LargeTextDisplay = function() {
  this.text = new PIXI.Text("???", {font:"128px Arial", fill:"black", align:"center"});
  this.active = !1;
  this.textElement_ = document.createElement("div");
  this.textElement_.style.color = "black";
  this.textElement_.style.fontFamily = "Arial";
  this.textElement_.style.fontSize = "128px";
  this.textElement_.style.height = "100%";
  this.textElement_.style.textAlign = "center";
  this.textElement_.style.verticalAlign = "middle";
  this.textElement_.style.visibility = "hidden";
  this.textElement_.style.width = "100%";
  this.textElement_.style.zIndex = "1000";
  document.body.appendChild(this.textElement_);
};
cast.games.spellcast.gameobjects.LargeTextDisplay.prototype.setText = function(text) {
  this.textElement_.innerText = text;
};
cast.games.spellcast.gameobjects.LargeTextDisplay.prototype.activate = function() {
  this.active = !0;
  this.textElement_.style.visibility = "visibible";
};
cast.games.spellcast.gameobjects.LargeTextDisplay.prototype.deactivate = function() {
  this.active = !1;
  this.textElement_.style.visibility = "hidden";
};
cast.games.spellcast.gameobjects.LargeTextDisplay.prototype.update = function() {
};
cast.games.spellcast.gameobjects.Player = function(lobbyPosition, battlePosition, sprite, container, canvasWidth, canvasHeight) {
  this.active = !1;
  this.sprite = sprite;
  this.container = container;
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.name = this.playerId = null;
  this.lobbyPosition = lobbyPosition;
  this.battlePosition = battlePosition;
  this.posX = lobbyPosition.x;
  this.posY = lobbyPosition.y;
  this.shieldSprite = PIXI.Sprite.fromImage("assets/shield.png");
  this.healSprite = PIXI.Sprite.fromImage("assets/heal.png");
  this.tilingTexture = PIXI.Texture.fromImage("assets/blank_tile.png");
  this.nameBackground = new PIXI.extras.TilingSprite(this.tilingTexture, .1 * canvasWidth, 24);
  this.nameText = new PIXI.Text("???", {font:"16px Arial", fill:"white"});
  this.nameUpdated_ = !1;
  this.updateTextFn_ = goog.bind(this.updateText_, this);
  this.shieldSprite.anchor.x = .7;
  this.shieldSprite.anchor.y = 1.1;
  this.shieldSprite.tint = 16776960;
  this.shieldSprite.position.x = 0;
  this.shieldSprite.position.y = 0;
  this.healSprite.alpha = .75;
  this.healSprite.anchor.x = .7;
  this.healSprite.anchor.y = 1.1;
  this.healSprite.position.x = 0;
  this.healSprite.position.y = 0;
  this.healSprite.scale.x = .5;
  this.healSprite.scale.y = .5;
  this.nameBackground.anchor.x = .5;
  this.nameBackground.anchor.y = 0;
  this.nameBackground.position.x = 0;
  this.nameBackground.position.y = 55;
  this.nameBackground.tint = 0;
  this.nameBackground.alpha = .5;
  this.sprite.addChild(this.nameBackground);
  this.nameText.anchor.x = .5;
  this.nameText.anchor.y = 0;
  this.nameText.position.x = 0;
  this.nameText.position.y = 55;
  this.sprite.addChild(this.nameText);
  this.sprite.anchor.x = .5;
  this.sprite.anchor.y = .5;
  this.sprite.visible = !1;
  this.container.addChild(this.sprite);
};
cast.games.spellcast.gameobjects.Player.prototype.setPlayerIdAndName = function(playerId, name) {
  this.playerId = playerId;
  this.name = name;
  this.nameText.text = name;
  this.nameUpdated_ = !0;
};
cast.games.spellcast.gameobjects.Player.prototype.updateText_ = function() {
  this.nameBackground.width = this.nameText.width + 4;
  this.nameUpdated_ = !1;
};
cast.games.spellcast.gameobjects.Player.prototype.activate = function(position, showNameText) {
  this.active = !0;
  this.posX = position.x;
  this.posY = position.y;
  this.sprite.position.x = this.canvasWidth * position.x;
  this.sprite.position.y = this.canvasHeight * position.y;
  this.sprite.visible = !0;
  this.nameText.visible = showNameText;
  this.nameBackground.visible = showNameText;
};
cast.games.spellcast.gameobjects.Player.prototype.deactivate = function() {
  this.active = !1;
  this.sprite.visible = !1;
  this.disableShield();
  this.disableHeal();
};
cast.games.spellcast.gameobjects.Player.prototype.update = function() {
  this.sprite.position.x = this.canvasWidth * this.posX;
  this.sprite.position.y = this.canvasHeight * this.posY;
  this.nameUpdated_ && requestAnimationFrame(this.updateTextFn_);
};
cast.games.spellcast.gameobjects.Player.prototype.enableShield = function(alpha, tint) {
  this.shieldSprite.parent || (this.shieldSprite.alpha = alpha, this.shieldSprite.tint = tint, this.sprite.addChild(this.shieldSprite));
};
cast.games.spellcast.gameobjects.Player.prototype.disableShield = function() {
  this.shieldSprite.parent == this.sprite && this.sprite.removeChild(this.shieldSprite);
};
cast.games.spellcast.gameobjects.Player.prototype.enableHeal = function(scale) {
  this.healSprite.scale.x = scale;
  this.healSprite.scale.y = scale;
  this.healSprite.parent || this.sprite.addChild(this.healSprite);
};
cast.games.spellcast.gameobjects.Player.prototype.disableHeal = function() {
  this.healSprite.parent == this.sprite && this.sprite.removeChild(this.healSprite);
};
cast.games.spellcast.gameobjects.Player.prototype.moveForward = function() {
  this.posX += cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET;
};
cast.games.spellcast.gameobjects.Player.prototype.moveBackward = function() {
  this.posX -= cast.games.spellcast.GameConstants.PLAYER_SPELL_X_OFFSET;
};
cast.games.spellcast.gameobjects.TextDisplay = function() {
  this.active = !1;
  this.textElement_ = document.createElement("div");
  this.textElement_.style.background = "yellow";
  this.textElement_.style.bottom = "20px";
  this.textElement_.style.color = "black";
  this.textElement_.style.fontFamily = "Arial";
  this.textElement_.style.fontSize = "24px";
  this.textElement_.style.padding = "0.5em";
  this.textElement_.style.position = "absolute";
  this.textElement_.style.textAlign = "center";
  this.textElement_.style.visibility = "hidden";
  this.textElement_.style.width = "100%";
  this.textElement_.style.zIndex = "1000";
  document.body.appendChild(this.textElement_);
};
cast.games.spellcast.gameobjects.TextDisplay.prototype.setText = function(text) {
  this.textElement_.innerText = text;
};
cast.games.spellcast.gameobjects.TextDisplay.prototype.activate = function() {
  this.active = !0;
  this.textElement_.style.visibility = "visible";
};
cast.games.spellcast.gameobjects.TextDisplay.prototype.deactivate = function() {
  this.active = !1;
  this.textElement_.style.visibility = "hidden";
};
cast.games.spellcast.gameobjects.TextDisplay.prototype.update = function() {
};
cast.games.spellcast.State = function() {
};
cast.games.spellcast.states = {};
cast.games.spellcast.states.EnemyResolutionPhase = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
  this.showedPartyDeath_ = !1;
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onEnter = function(previousStateId) {
  if (previousStateId != cast.games.spellcast.messages.GameStateId.PAUSED) {
    if (this.game_.getEnemyElement() == cast.games.spellcast.messages.SpellElement.NONE) {
      throw Error("No enemy element selected.");
    }
    var connectedPlayers = this.gameManager_.getConnectedPlayers(), numberConnectedPlayers = connectedPlayers.length;
    if (0 == numberConnectedPlayers) {
      throw Error("No players for the enemy to attack.");
    }
    var victimIndex = Math.floor(Math.random() * numberConnectedPlayers), attackStrength = cast.games.spellcast.GameConstants.RANDOM_ENEMY_ATTACK_STRENGTHS[Math.floor(Math.random() * cast.games.spellcast.GameConstants.RANDOM_ENEMY_ATTACK_STRENGTHS.length)], enemy = this.game_.getEnemy();
    if (!enemy) {
      throw Error("No enemy found for enemy resolution phase.");
    }
    var victim = this.game_.getPlayer(connectedPlayers[victimIndex].playerId), actions = this.actionManager_.getActionList();
    actions.push(this.actionManager_.getEnemyAttackAction(enemy, victim, this.game_.getEnemyElement(), attackStrength));
    this.actionManager_.startExecuting(actions);
    this.showedPartyDeath_ = !1;
    this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_);
  }
};
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onUpdate = function() {
  if (this.actionManager_.isDone()) {
    if (0 < this.game_.getPartyHealth()) {
      this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PLAYER_ACTION);
    } else {
      if (this.showedPartyDeath_) {
        this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.ENEMY_VICTORY);
      } else {
        var actions = this.actionManager_.getActionList();
        actions.push(this.actionManager_.getPartyDeathAction());
        this.actionManager_.reset();
        this.actionManager_.startExecuting(actions);
        this.showedPartyDeath_ = !0;
      }
    }
  }
};
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onExit = function() {
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_);
};
cast.games.spellcast.states.EnemyResolutionPhase.prototype.onPlayerIdle_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : this.gameManager_.getGameplayState() != cast.receiver.games.GameplayState.PAUSED && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PAUSED);
};
cast.games.spellcast.states.EnemyVictoryState = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
};
cast.games.spellcast.states.EnemyVictoryState.prototype.onEnter = function() {
  this.game_.getPartyHealthDisplay().deactivate();
  this.game_.getEnemyHealthDisplay().deactivate();
  this.game_.getBattlefieldDisplay().deactivate();
  var enemyVictoryDisplay = this.game_.getEnemyVictoryDisplay();
  if (!enemyVictoryDisplay) {
    throw Error("No enemy victory display");
  }
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getFullScreenDisplayAction(enemyVictoryDisplay, cast.games.spellcast.GameConstants.ENDGAME_DISPLAY_DELAY));
  this.actionManager_.startExecuting(actions);
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
  for (var players = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING), i = 0;i < players.length;i++) {
    this.gameManager_.updatePlayerState(players[i].playerId, cast.receiver.games.PlayerState.IDLE, null);
  }
  this.game_.removeAllPlayers();
  this.game_.removeEnemy();
};
cast.games.spellcast.states.EnemyVictoryState.prototype.onUpdate = function() {
  this.actionManager_.isDone() && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
};
cast.games.spellcast.states.EnemyVictoryState.prototype.onExit = function() {
  for (var players = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.IDLE), i = 0;i < players.length;i++) {
    this.gameManager_.updatePlayerState(players[i].playerId, cast.receiver.games.PlayerState.AVAILABLE, null);
  }
  this.game_.getEnemyVictoryDisplay().deactivate();
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null);
  this.actionManager_.reset();
};
cast.games.spellcast.states.InstructionsState = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = game.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
};
cast.games.spellcast.states.InstructionsState.prototype.onEnter = function() {
  var instructionsDisplay = this.game_.getInstructionsDisplay();
  if (!instructionsDisplay) {
    throw Error("No instructions display");
  }
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getFullScreenDisplayAction(instructionsDisplay, cast.games.spellcast.GameConstants.INSTRUCTIONS_DELAY));
  this.actionManager_.startExecuting(actions);
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
};
cast.games.spellcast.states.InstructionsState.prototype.onUpdate = function() {
  0 == this.gameManager_.getConnectedPlayers().length ? this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS) : this.actionManager_.isDone() && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PLAYER_ACTION);
};
cast.games.spellcast.states.InstructionsState.prototype.onExit = function(nextStateId) {
  this.actionManager_.reset();
  nextStateId == cast.games.spellcast.messages.GameStateId.PLAYER_ACTION && (this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null), this.game_.setupWorld());
};
cast.games.spellcast.states.PausedState = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.actionManager_ = actionManager;
  this.stateMachine_ = stateMachine;
  this.previousStateId_ = cast.games.spellcast.messages.GameStateId.UNKNOWN;
  this.idlePlayers_ = [];
  this.boundPlayerPlayingCallback_ = this.onPlayerPlaying_.bind(this);
};
cast.games.spellcast.states.PausedState.prototype.onEnter = function(previousStateId) {
  this.previousStateId_ = previousStateId;
  this.game_.getPausedDisplay().activate(this.game_.getTopLeftPosition());
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.PAUSED, null);
  this.actionManager_.pause();
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.idlePlayers_);
  for (var i = 0;i < this.idlePlayers_.length;i++) {
    this.gameManager_.updatePlayerState(this.idlePlayers_[i].playerId, cast.receiver.games.PlayerState.IDLE, null);
  }
  this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_PLAYING, this.boundPlayerPlayingCallback_);
};
cast.games.spellcast.states.PausedState.prototype.onUpdate = function() {
};
cast.games.spellcast.states.PausedState.prototype.onExit = function() {
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_PLAYING, this.boundPlayerPlayingCallback_);
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.IDLE, this.idlePlayers_);
  for (var i = 0;i < this.idlePlayers_.length;i++) {
    this.gameManager_.updatePlayerState(this.idlePlayers_[i].playerId, cast.receiver.games.PlayerState.PLAYING, null);
  }
  this.actionManager_.resume();
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null);
  this.game_.getPausedDisplay().deactivate();
};
cast.games.spellcast.states.PausedState.prototype.onPlayerPlaying_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : this.stateMachine_.goToState(this.previousStateId_);
};
cast.games.spellcast.ActionParser = {};
cast.games.spellcast.ActionParser.parse = function(actionManager, caster, enemy, spells) {
  for (var SpellType = cast.games.spellcast.messages.SpellType, actions = actionManager.getActionList(), i = 0;i < spells.length;i++) {
    var spell = spells[i];
    switch(spell.spellType) {
      case SpellType.BASIC_ATTACK:
        actions.push(actionManager.getPlayerBasicAttackAction(caster, enemy, spell));
        break;
      case SpellType.HEAL:
        actions.push(actionManager.getPlayerHealAction(caster, spell));
        break;
      case SpellType.SHIELD:
        actions.push(actionManager.getPlayerShieldAction(caster, spell));
        break;
      default:
        throw Error("Error parsing action:" + spell);;
    }
  }
  return actions;
};
cast.games.spellcast.states.PlayerActionPhase = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
  this.startTime_ = 0;
  this.waitingForRandomAi_ = this.waitingForTurnEnding_ = this.waitingForInitialDelay_ = !0;
  this.actions_ = Object.create(null);
  this.receivedPlayerIds_ = [];
  this.boundGameMessageCallback_ = this.onGameMessage_.bind(this);
  this.boundPlayerQuitCallback_ = this.onPlayerQuit_.bind(this);
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onEnter = function(previousStateId) {
  if (0 == this.gameManager_.getConnectedPlayers().length) {
    this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
  } else {
    if (this.gameManager_.addEventListener(cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED, this.boundGameMessageCallback_), this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCallback_), this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCallback_), this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_), previousStateId != cast.games.spellcast.messages.GameStateId.PAUSED) {
      for (var actionKeys = Object.keys(this.actions_), i = 0;i < actionKeys.length;i++) {
        delete this.actions_[actionKeys[i]];
      }
      this.game_.disablePartyShield();
      this.receivedPlayerIds_.length = 0;
      for (var connectedPlayers = this.gameManager_.getConnectedPlayers(), i = 0;i < connectedPlayers.length;i++) {
        var player = this.game_.getPlayer(connectedPlayers[i].playerId);
        player.activate(player.battlePosition, !1);
      }
      this.game_.selectEnemyElement();
      var actions = this.actionManager_.getActionList();
      actions.push(this.actionManager_.getCountdownAction());
      this.actionManager_.startExecuting(actions);
      this.waitingForRandomAi_ = this.waitingForTurnEnding_ = this.waitingForInitialDelay_ = !0;
    }
  }
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onUpdate = function() {
  var currentTime = Date.now();
  this.waitingForInitialDelay_ && this.actionManager_.isDone() && (this.startTime_ = currentTime, this.game_.assignBonusesAndNotifyPlayers(), this.waitingForInitialDelay_ = !1);
  !this.waitingForInitialDelay_ && this.game_.randomAiEnabled && this.waitingForRandomAi_ && (this.game_.testCreatePlayerActions(), this.waitingForRandomAi_ = !1);
  !this.waitingForInitialDelay_ && this.waitingForTurnEnding_ && currentTime - this.startTime_ > cast.games.spellcast.GameConstants.TIME_RUNNING_OUT_DELAY && (this.waitingForTurnEnding_ = !1);
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onGameMessage_ = function(event) {
  if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
    console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription);
  } else {
    if (event.requestExtraMessageData) {
      var playerId = event.playerInfo.playerId, spellMessage = event.requestExtraMessageData, caster = this.game_.getPlayer(playerId);
      if (!caster) {
        throw Error("Got actions from an unknown player ID: " + event.playerInfo.playerId);
      }
      var enemy = this.game_.getEnemy();
      if (!enemy) {
        throw Error("No enemy defined during player action phase.");
      }
      var actions = cast.games.spellcast.ActionParser.parse(this.actionManager_, caster, enemy, spellMessage.spells);
      this.actions_[playerId] = actions;
      -1 == this.receivedPlayerIds_.indexOf(playerId) && this.receivedPlayerIds_.push(playerId);
      this.receivedPlayerIds_.length >= this.gameManager_.getConnectedPlayers().length && (this.stateMachine_.getState(cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION).setPlayerActions(this.actions_), this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION));
    }
  }
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onPlayerQuit_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : (delete this.actions_[event.playerInfo.playerId], 0 == this.gameManager_.getConnectedPlayers().length && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS));
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onExit = function(nextStateId) {
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED, this.boundGameMessageCallback_);
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCallback_);
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCallback_);
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_);
  nextStateId != cast.games.spellcast.messages.GameStateId.PAUSED && (this.startTime_ = 0, this.game_.getWaitingPlayerActionDisplay().deactivate(), this.actionManager_.reset());
};
cast.games.spellcast.states.PlayerActionPhase.prototype.onPlayerIdle_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : this.gameManager_.getGameplayState() != cast.receiver.games.GameplayState.PAUSED && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PAUSED);
};
cast.games.spellcast.states.PlayerResolutionPhase = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
  this.enemy_ = this.playerActions_ = null;
  this.showedEnemyDeath_ = !1;
  this.boundPlayerIdleCallback_ = this.onPlayerIdle_.bind(this);
};
cast.games.spellcast.states.PlayerResolutionPhase.ID = "PlayerResolutionPhase";
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onEnter = function(previousStateId) {
  if (previousStateId != cast.games.spellcast.messages.GameStateId.PAUSED) {
    if (!this.playerActions_) {
      throw Error("No player actions provided for the PlayerResolutionPhase");
    }
    this.game_.resetNumberOfShieldSpellsCastThisRound();
    for (var sortedActions = this.actionManager_.getActionList(), currentSpellIndex = 0, keys = Object.keys(this.playerActions_), allPlayersDone = !1;!allPlayersDone;) {
      for (var allPlayersDone = !0, i = 0;i < keys.length;i++) {
        var currentPlayerActions = this.playerActions_[keys[i]];
        currentSpellIndex < currentPlayerActions.length && (allPlayersDone = !1, sortedActions.push(currentPlayerActions[currentSpellIndex]));
      }
      currentSpellIndex++;
    }
    this.actionManager_.startExecuting(sortedActions);
    this.enemy_ = this.game_.getEnemy();
    this.showedEnemyDeath_ = !1;
    this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_);
  }
};
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onUpdate = function() {
  if (this.actionManager_.isDone()) {
    if (0 < this.game_.getEnemyHealth()) {
      this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.ENEMY_RESOLUTION);
    } else {
      if (!this.showedEnemyDeath_ && this.enemy_) {
        var actions = this.actionManager_.getActionList();
        actions.push(this.actionManager_.getEnemyDeathAction(this.enemy_));
        this.actionManager_.reset();
        this.actionManager_.startExecuting(actions);
        this.showedEnemyDeath_ = !0;
      } else {
        this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PLAYER_VICTORY);
      }
    }
  }
};
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onExit = function(nextStateId) {
  if (nextStateId != cast.games.spellcast.messages.GameStateId.PAUSED) {
    this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_IDLE, this.boundPlayerIdleCallback_);
    if (this.playerActions_) {
      for (var keys = Object.keys(this.playerActions_), i = 0;i < keys.length;i++) {
        this.actionManager_.releaseActionList(this.playerActions_[keys[i]], !0);
      }
    }
    this.playerActions_ = null;
    this.game_.resetNumberOfShieldSpellsCastThisRound();
  }
};
cast.games.spellcast.states.PlayerResolutionPhase.prototype.setPlayerActions = function(playerActions) {
  this.playerActions_ = playerActions;
};
cast.games.spellcast.states.PlayerResolutionPhase.prototype.onPlayerIdle_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : this.gameManager_.getGameplayState() != cast.receiver.games.GameplayState.PAUSED && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.PAUSED);
};
cast.games.spellcast.states.PlayerVictoryState = function(game, stateMachine, actionManager) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.actionManager_ = actionManager;
};
cast.games.spellcast.states.PlayerVictoryState.prototype.onEnter = function() {
  this.game_.getEnemyHealthDisplay().deactivate();
  this.game_.getPartyHealthDisplay().deactivate();
  this.game_.getBattlefieldDisplay().deactivate();
  var playerVictoryDisplay = this.game_.getPlayerVictoryDisplay();
  if (!playerVictoryDisplay) {
    throw Error("No player victory display");
  }
  var actions = this.actionManager_.getActionList();
  actions.push(this.actionManager_.getFullScreenDisplayAction(playerVictoryDisplay, cast.games.spellcast.GameConstants.ENDGAME_DISPLAY_DELAY));
  this.actionManager_.startExecuting(actions);
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
  for (var players = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING), i = 0;i < players.length;i++) {
    this.gameManager_.updatePlayerState(players[i].playerId, cast.receiver.games.PlayerState.IDLE, null);
  }
  this.game_.removeAllPlayers();
  this.game_.removeEnemy();
};
cast.games.spellcast.states.PlayerVictoryState.prototype.onUpdate = function() {
  this.actionManager_.isDone() && this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
};
cast.games.spellcast.states.PlayerVictoryState.prototype.onExit = function() {
  for (var players = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.IDLE), i = 0;i < players.length;i++) {
    this.gameManager_.updatePlayerState(players[i].playerId, cast.receiver.games.PlayerState.AVAILABLE, null);
  }
  this.game_.getPlayerVictoryDisplay().deactivate();
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null);
  this.actionManager_.reset();
};
cast.games.spellcast.states.WaitingForPlayersState = function(game, stateMachine) {
  this.game_ = game;
  this.gameManager_ = this.game_.getGameManager();
  this.stateMachine_ = stateMachine;
  this.waitingForRandomAiDelay_ = 0;
  this.readyPlayers_ = [];
  this.hostPlayerId_ = null;
  this.boundPlayerReadyCallback_ = this.onPlayerReady_.bind(this);
  this.boundPlayerPlayingCallback_ = this.onPlayerPlaying_.bind(this);
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.onEnter = function() {
  this.game_.getEnemyHealthDisplay().deactivate();
  this.game_.getPartyHealthDisplay().deactivate();
  this.game_.getEnemy().deactivate();
  this.waitingForRandomAiDelay_ = Date.now() + 1E3;
  this.game_.getLobbyDisplay().activate(this.game_.getTopLeftPosition());
  this.readyPlayers_ = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.READY, this.readyPlayers_);
  for (var i = 0;i < this.readyPlayers_.length;i++) {
    var player = this.readyPlayers_[i];
    this.addPlayer_(player.playerId, player.playerData, 0 == i);
  }
  this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_READY, this.boundPlayerReadyCallback_);
  this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_PLAYING, this.boundPlayerPlayingCallback_);
  this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.SHOWING_INFO_SCREEN, null);
  this.gameManager_.updateLobbyState(cast.receiver.games.LobbyState.OPEN, null);
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.onUpdate = function() {
  var now = Date.now();
  this.readyPlayers_ = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.READY, this.readyPlayers_);
  var numberReadyPlayers = this.readyPlayers_.length, hostPlayer = this.hostPlayerId_ ? this.gameManager_.getPlayer(this.hostPlayerId_) : null;
  hostPlayer && this.hostPlayerId_ && 0 < numberReadyPlayers && hostPlayer.playerState != cast.receiver.games.PlayerState.READY && this.updateHost_(this.readyPlayers_[0].playerId);
  this.game_.randomAiEnabled && now > this.waitingForRandomAiDelay_ && (numberReadyPlayers < cast.games.spellcast.GameConstants.MAX_PLAYERS ? this.game_.testCreatePlayer() : this.game_.testStartGame(), this.waitingForRandomAiDelay_ += 1E3);
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.onPlayerReady_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : this.readyPlayers_.length > cast.games.spellcast.GameConstants.MAX_PLAYERS || this.addPlayer_(event.playerInfo.playerId, event.requestExtraMessageData, 0 == this.readyPlayers_.length);
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.onPlayerPlaying_ = function(event) {
  event.statusCode != cast.receiver.games.StatusCode.SUCCESS ? (console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription)) : (event.requestExtraMessageData && this.game_.setDifficultySetting(event.requestExtraMessageData.difficultySetting || cast.games.spellcast.messages.DifficultySetting.EASY), this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.INSTRUCTIONS));
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.addPlayer_ = function(playerId, playerData, isHost) {
  isHost ? this.updateHost_(playerId, playerData) : (playerData = playerData || {}, playerData.host = !1, this.gameManager_.updatePlayerData(playerId, playerData));
  var parsedPlayerData = playerData, player = this.game_.createPlayer(playerId, parsedPlayerData.playerName || "???", parsedPlayerData.avatarIndex);
  player.activate(player.lobbyPosition, !0);
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.updateHost_ = function(newHostPlayerId, opt_newHostPlayerData) {
  if (newHostPlayerId != this.hostPlayerId_) {
    if (newHostPlayerId != this.hostPlayerId_ && this.hostPlayerId_ && this.gameManager_.isPlayerConnected(this.hostPlayerId_)) {
      var oldHostPlayerData = this.gameManager_.getPlayer(this.hostPlayerId_).playerData || {};
      oldHostPlayerData.host = !1;
      this.gameManager_.updatePlayerData(this.hostPlayerId_, oldHostPlayerData, !1);
    }
    var newHostPlayerData = null, newHostPlayerData = opt_newHostPlayerData ? opt_newHostPlayerData : this.gameManager_.getPlayer(newHostPlayerId).playerData || {};
    newHostPlayerData.host = !0;
    this.hostPlayerId_ = newHostPlayerId;
    this.gameManager_.updatePlayerData(this.hostPlayerId_, newHostPlayerData);
  }
};
cast.games.spellcast.states.WaitingForPlayersState.prototype.onExit = function() {
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_READY, this.boundPlayerReadyCallback_);
  this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_PLAYING, this.boundPlayerPlayingCallback_);
  for (var players = this.gameManager_.getPlayers(), i = 0;i < players.length;i++) {
    var playerState = players[i].playerState;
    playerState == cast.receiver.games.PlayerState.READY && this.gameManager_.updatePlayerState(players[i].playerId, cast.receiver.games.PlayerState.PLAYING, null);
    playerState != cast.receiver.games.PlayerState.READY && playerState != cast.receiver.games.PlayerState.PLAYING || this.game_.getPlayer(players[i].playerId).deactivate();
  }
  this.gameManager_.updateLobbyState(cast.receiver.games.LobbyState.CLOSED, null);
  this.game_.getLobbyDisplay().deactivate();
};
cast.games.common = {};
cast.games.common.receiver = {};
cast.games.common.receiver.ObjectPool = function(name, initialSize, factory) {
  this.name_ = name;
  this.factory_ = factory;
  this.pool_ = [];
  for (var i = this.currentIndex_ = 0;i < initialSize;i++) {
    var object = this.factory_();
    this.pool_.push(object);
  }
};
cast.games.common.receiver.ObjectPool.prototype.getObject = function() {
  var object = this.pool_[this.currentIndex_];
  this.currentIndex_++;
  if (this.currentIndex_ == this.pool_.length) {
    var newObject = this.factory_();
    this.pool_[this.currentIndex_] = newObject;
    console.log("Constructing new object on pool: " + this.name_ + ". This should not happen. Increase initial pool size.");
  }
  return object;
};
cast.games.common.receiver.ObjectPool.prototype.releaseObject = function(object) {
  0 == this.currentIndex_ && console.log("Error releasing object on pool: " + this.name_ + ". The pool had no borrowed objects.");
  for (var objectIndex = -1, i = 0;i < this.currentIndex_;i++) {
    if (this.pool_[i] == object) {
      objectIndex = i;
      break;
    }
  }
  -1 == objectIndex && console.log("Error releasing object on pool: " + this.name_ + ". The released object was not provided by this pool.");
  var newObjectIndex = this.currentIndex_ - 1;
  objectIndex != newObjectIndex && (this.pool_[objectIndex] = this.pool_[newObjectIndex], this.pool_[newObjectIndex] = object);
  this.currentIndex_--;
};
cast.games.spellcast.ActionManager = function(game) {
  this.game_ = game;
  this.actions_ = null;
  this.executing_ = !1;
  this.currentAction_ = null;
  this.currentActionStartTime_ = -1;
  this.isPaused_ = !1;
  this.pausedTime_ = 0;
  this.playerAttackSpellPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.PlayerAttackSpell", 100, function() {
    return new cast.games.spellcast.actions.PlayerAttackSpell;
  });
  this.playerHealSpellPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.PlayerHealSpell", 100, function() {
    return new cast.games.spellcast.actions.PlayerHealSpell;
  });
  this.playerShieldSpellPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.PlayerShieldSpell", 100, function() {
    return new cast.games.spellcast.actions.PlayerShieldSpell;
  });
  this.countdownPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.CountdownAction", 10, function() {
    return new cast.games.spellcast.actions.CountdownAction;
  });
  this.enemyAttackSpellPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.EnemyAttackSpell", 10, function() {
    return new cast.games.spellcast.actions.EnemyAttackSpell;
  });
  this.enemyDeathPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.EnemyDeathAction", 10, function() {
    return new cast.games.spellcast.actions.EnemyDeathAction;
  });
  this.partyDeathPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.PartyDeathAction", 10, function() {
    return new cast.games.spellcast.actions.PartyDeathAction;
  });
  this.actionListPool_ = new cast.games.common.receiver.ObjectPool("Array.<cast.games.spellcast.Action>", 10, function() {
    return [];
  });
  this.fullScreenDisplayPool_ = new cast.games.common.receiver.ObjectPool("cast.games.spellcast.actions.FullScreenDisplayAction", 10, function() {
    return new cast.games.spellcast.actions.FullScreenDisplayAction;
  });
};
cast.games.spellcast.ActionManager.prototype.startExecuting = function(actions) {
  this.actions_ && this.actions_.length && (console.log("ActionManager was started before reset() was called."), this.releaseActionList(this.actions_));
  this.actions_ = actions;
  this.executing_ = !0;
};
cast.games.spellcast.ActionManager.prototype.isDone = function() {
  return !this.actions_ || !this.actions_.length && !this.executing_;
};
cast.games.spellcast.ActionManager.prototype.reset = function() {
  this.actions_ && this.releaseActionList(this.actions_);
  this.actions_ = null;
  this.executing_ = !1;
};
cast.games.spellcast.ActionManager.prototype.update = function() {
  if (this.executing_ && this.actions_ && !this.isPaused_) {
    var currentTime = Date.now();
    if (this.currentAction_) {
      var elapsedTime = currentTime - this.currentActionStartTime_;
      this.currentAction_.onUpdate(elapsedTime);
      if (this.currentAction_.getShouldFinishOnNextUpdate() || elapsedTime > this.currentAction_.getExecutionTime()) {
        this.currentAction_.onFinish(), this.releaseAction_(this.currentAction_), this.currentAction_ = null;
      }
    } else {
      0 < this.actions_.length ? (this.currentAction_ = this.actions_.shift(), this.currentAction_.onStart(), this.currentActionStartTime_ = currentTime) : this.reset();
    }
  }
};
cast.games.spellcast.ActionManager.prototype.pause = function() {
  this.isPaused_ = !0;
  this.pausedTime_ = Date.now();
};
cast.games.spellcast.ActionManager.prototype.resume = function() {
  this.isPaused_ = !1;
  this.currentActionStartTime_ += Date.now() - this.pausedTime_;
};
cast.games.spellcast.ActionManager.prototype.getActionList = function() {
  var actionList = this.actionListPool_.getObject();
  actionList.length = 0;
  return actionList;
};
cast.games.spellcast.ActionManager.prototype.releaseActionList = function(actions, opt_releaseListOnly) {
  for (var i = 0;i < actions.length && !opt_releaseListOnly;i++) {
    this.releaseAction_(actions[i]);
  }
  this.actionListPool_.releaseObject(actions);
  actions.length = 0;
};
cast.games.spellcast.ActionManager.prototype.releaseAction_ = function(action) {
  if (action instanceof cast.games.spellcast.actions.PlayerAttackSpell) {
    this.playerAttackSpellPool_.releaseObject(action);
  } else {
    if (action instanceof cast.games.spellcast.actions.PlayerHealSpell) {
      this.playerHealSpellPool_.releaseObject(action);
    } else {
      if (action instanceof cast.games.spellcast.actions.PlayerShieldSpell) {
        this.playerShieldSpellPool_.releaseObject(action);
      } else {
        if (action instanceof cast.games.spellcast.actions.CountdownAction) {
          this.countdownPool_.releaseObject(action);
        } else {
          if (action instanceof cast.games.spellcast.actions.EnemyAttackSpell) {
            this.enemyAttackSpellPool_.releaseObject(action);
          } else {
            if (action instanceof cast.games.spellcast.actions.EnemyDeathAction) {
              this.enemyDeathPool_.releaseObject(action);
            } else {
              if (action instanceof cast.games.spellcast.actions.PartyDeathAction) {
                this.partyDeathPool_.releaseObject(action);
              } else {
                if (action instanceof cast.games.spellcast.actions.FullScreenDisplayAction) {
                  this.fullScreenDisplayPool_.releaseObject(action);
                } else {
                  throw Error("Unsupported player action found in action list : " + action);
                }
              }
            }
          }
        }
      }
    }
  }
};
cast.games.spellcast.ActionManager.prototype.getPlayerBasicAttackAction = function(caster, enemy, spell) {
  var element = spell.spellElement, accuracy = spell.spellAccuracy, action = this.playerAttackSpellPool_.getObject();
  action.init(this.game_, caster, enemy, element, accuracy);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getPlayerHealAction = function(caster, spell) {
  var accuracy = spell.spellAccuracy, action = this.playerHealSpellPool_.getObject();
  action.init(this.game_, caster, accuracy);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getPlayerShieldAction = function(caster, spell) {
  var accuracy = spell.spellAccuracy, action = this.playerShieldSpellPool_.getObject();
  action.init(this.game_, caster, accuracy);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getCountdownAction = function() {
  var action = this.countdownPool_.getObject();
  action.init(this.game_);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getEnemyAttackAction = function(caster, target, element, strength) {
  var action = this.enemyAttackSpellPool_.getObject();
  action.init(this.game_, caster, target, element, strength);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getEnemyDeathAction = function(enemy) {
  var action = this.enemyDeathPool_.getObject();
  action.init(enemy);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getPartyDeathAction = function() {
  var action = this.partyDeathPool_.getObject();
  action.init(this.game_);
  return action;
};
cast.games.spellcast.ActionManager.prototype.getFullScreenDisplayAction = function(fullScreenDisplay, displayDuration) {
  var action = this.fullScreenDisplayPool_.getObject();
  action.init(this.game_, fullScreenDisplay, displayDuration);
  return action;
};
cast.games.spellcast.AudioManager = function() {
  this.attackSound_ = this.shieldDisruptSound_ = this.shieldSound_ = this.healSound_ = this.explosionSound_ = this.backgroundMusic_ = null;
};
cast.games.spellcast.AudioManager.prototype.loadAllAudio = function() {
  this.healSound_ = (new Howl({urls:["assets/heal.ogg"]})).load();
  this.shieldSound_ = (new Howl({urls:["assets/shield.ogg"]})).load();
  this.shieldDisruptSound_ = (new Howl({urls:["assets/shield_disrupt.ogg"]})).load();
  this.attackSound_ = (new Howl({urls:["assets/attack.ogg"]})).load();
  this.explosionSound_ = (new Howl({urls:["assets/explosion.ogg"]})).load();
  this.backgroundMusic_ = (new Howl({loop:!0, urls:["assets/music.ogg"]})).load();
};
cast.games.spellcast.AudioManager.prototype.playHeal = function() {
  this.healSound_.play();
};
cast.games.spellcast.AudioManager.prototype.playShield = function() {
  this.shieldSound_.play();
};
cast.games.spellcast.AudioManager.prototype.playShieldDisrupt = function() {
  this.shieldDisruptSound_.play();
};
cast.games.spellcast.AudioManager.prototype.playAttackSound = function() {
  this.attackSound_.play();
};
cast.games.spellcast.AudioManager.prototype.playExplosionSound = function() {
  this.explosionSound_.play();
};
cast.games.spellcast.AudioManager.prototype.playBackgroundMusic = function() {
  this.backgroundMusic_.play();
};
cast.games.spellcast.AudioManager.prototype.pauseBackgroundMusic = function() {
  this.backgroundMusic_.pause();
};
cast.games.common.receiver.Game = function() {
};
cast.games.spellcast.StateMachine = function(game) {
  this.game_ = game;
  this.states_ = Object.create(null);
  this.currentStateId_ = cast.games.spellcast.messages.GameStateId.UNKNOWN;
  this.currentState_ = null;
};
cast.games.spellcast.StateMachine.prototype.addState = function(id, state) {
  this.states_[id] = state;
};
cast.games.spellcast.StateMachine.prototype.removeState = function(id) {
  delete this.states_[id];
};
cast.games.spellcast.StateMachine.prototype.goToState = function(id) {
  if (this.currentState_) {
    this.currentState_.onExit(id);
  }
  var previousStateId = this.currentStateId_;
  this.currentStateId_ = id;
  this.currentState_ = this.states_[id];
  if (!this.currentState_) {
    throw Error("No state found for " + id);
  }
  this.currentState_.onEnter(previousStateId);
  this.game_.broadcastGameStatus(this.currentStateId_);
};
cast.games.spellcast.StateMachine.prototype.getState = function(id) {
  return this.states_[id];
};
cast.games.spellcast.StateMachine.prototype.getCurrentState = function() {
  return this.currentState_;
};
cast.games.spellcast.StateMachine.prototype.update = function() {
  if (this.currentState_) {
    this.currentState_.onUpdate();
  }
};
cast.games.spellcast.SpellcastGame = function(gameManager) {
  this.gameManager_ = gameManager;
  this.randomAiEnabled = !1;
  this.debugUi = new cast.receiver.games.debug.DebugUI(this.gameManager_);
  this.canvasWidth_ = window.innerWidth;
  this.canvasHeight_ = window.innerHeight;
  this.boundUpdateFunction_ = this.update_.bind(this);
  this.boundPlayerQuitCallback_ = this.onPlayerQuit_.bind(this);
  this.boundGameMessageReceivedCallback_ = this.onGameMessageReceived_.bind(this);
  this.isRunning_ = this.isLoaded_ = !1;
  this.audioManager_ = new cast.games.spellcast.AudioManager;
  this.container_ = new PIXI.Container;
  this.renderer_ = new PIXI.WebGLRenderer(this.canvasWidth_, this.canvasHeight_, {transparent:!0});
  this.loadingImageElement_ = document.createElement("img");
  this.loadingImageElement_.onload = function() {
    this.isLoaded_ || document.body.appendChild(this.loadingImageElement_);
  }.bind(this);
  this.loadingImageElement_.src = "assets/title.jpg";
  this.loader_ = new PIXI.loaders.Loader;
  this.loader_.add("assets/air_explosion.json");
  this.loader_.add("assets/earth_explosion.json");
  this.loader_.add("assets/fire_explosion.json");
  this.loader_.add("assets/water_explosion.json");
  this.loader_.add("assets/heal.png");
  this.loader_.add("assets/wizards.json");
  this.loader_.add("assets/air_attack.json");
  this.loader_.add("assets/earth_attack.json");
  this.loader_.add("assets/fire_attack.json");
  this.loader_.add("assets/water_attack.json");
  this.loader_.add("assets/air_elemental_idle.json");
  this.loader_.add("assets/earth_elemental_idle.json");
  this.loader_.add("assets/fire_elemental_idle.json");
  this.loader_.add("assets/water_elemental_idle.json");
  this.loader_.add("assets/air_elemental_attack.json");
  this.loader_.add("assets/earth_elemental_attack.json");
  this.loader_.add("assets/fire_elemental_attack.json");
  this.loader_.add("assets/water_elemental_attack.json");
  this.loader_.add("assets/air_elemental_hit.json");
  this.loader_.add("assets/earth_elemental_hit.json");
  this.loader_.add("assets/fire_elemental_hit.json");
  this.loader_.add("assets/water_elemental_hit.json");
  this.loader_.add("assets/red_meter_bar.json");
  this.loader_.add("assets/green_meter_bar.json");
  this.loader_.add("assets/bg_meter_bar.json");
  this.loader_.add("assets/shield.png");
  this.loader_.add("assets/blank_tile.png");
  cast.games.spellcast.gameobjects.FullScreenDisplay.loadImages("assets/background.jpg assets/lobby_text.png assets/win_text.png assets/lose_text.png assets/instructions_text.png assets/paused_text.png".split(" ")).then(function() {
    this.loader_.once("complete", this.onAssetsLoaded_.bind(this));
  }.bind(this));
  this.loadedCallback_ = null;
  this.PLAYER_ASSETS_ = ["wizard_1.png", "wizard_2.png", "wizard_3.png", "wizard_4.png"];
  this.PLAYER_LOBBY_POSITIONS_ = [new PIXI.Point(.2, .81), new PIXI.Point(.4, .81), new PIXI.Point(.6, .81), new PIXI.Point(.8, .81)];
  this.PLAYER_BATTLE_POSITIONS_ = [new PIXI.Point(.234375, .657778), new PIXI.Point(.382811, .69111), new PIXI.Point(.29609375, .7675), new PIXI.Point(.1875, .80499)];
  this.pausedDisplay_ = this.instructionsDisplay_ = this.enemyVictoryDisplay_ = this.playerVictoryDisplay_ = this.lobbyDisplay_ = this.battlefieldDisplay_ = null;
  this.playerPool_ = [];
  this.playerTextures_ = [];
  this.partyHealthDisplay_ = null;
  this.partyHealthDisplayPos_ = new PIXI.Point(.05, .05);
  this.enemyHealthDisplay_ = this.enemy_ = null;
  this.enemyHealthDisplayPos_ = new PIXI.Point(.6, .05);
  this.waitingPlayerActionDisplay_ = this.countdownPlayerActionDisplay_ = null;
  this.attackSpells_ = Object.create(null);
  this.currentAttackSpell_ = null;
  this.numberOfShieldSpellsCastThisRound_ = this.partyShieldValue_ = 0;
  this.explosions_ = Object.create(null);
  this.currentExplosion_ = null;
  this.gameDifficulty_ = cast.games.spellcast.messages.DifficultySetting.EASY;
  this.topLeftPosition_ = new PIXI.Point(0, 0);
  this.enemyMaxHealth_ = this.enemyHealth_ = this.partyMaxHealth_ = this.partyHealth_ = -1;
  this.enemyElement_ = cast.games.spellcast.messages.SpellElement.NONE;
  this.playerBonus_ = Object.create(null);
  this.playerShieldCastingSprite_ = this.playerHealCastingSprite_ = null;
  this.actionManager_ = new cast.games.spellcast.ActionManager(this);
  this.lastTime_ = 0;
  this.playerMap_ = Object.create(null);
  this.playingPlayers_ = [];
  this.gameData_ = new cast.games.spellcast.messages.GameData;
  this.playerMessage_ = new cast.games.spellcast.messages.PlayerMessage;
  this.stateMachine_ = new cast.games.spellcast.StateMachine(this);
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS, new cast.games.spellcast.states.WaitingForPlayersState(this, this.stateMachine_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.INSTRUCTIONS, new cast.games.spellcast.states.InstructionsState(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.PLAYER_ACTION, new cast.games.spellcast.states.PlayerActionPhase(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.PLAYER_RESOLUTION, new cast.games.spellcast.states.PlayerResolutionPhase(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.ENEMY_RESOLUTION, new cast.games.spellcast.states.EnemyResolutionPhase(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.PLAYER_VICTORY, new cast.games.spellcast.states.PlayerVictoryState(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.ENEMY_VICTORY, new cast.games.spellcast.states.EnemyVictoryState(this, this.stateMachine_, this.actionManager_));
  this.stateMachine_.addState(cast.games.spellcast.messages.GameStateId.PAUSED, new cast.games.spellcast.states.PausedState(this, this.stateMachine_, this.actionManager_));
};
goog.exportSymbol("cast.games.spellcast.SpellcastGame", cast.games.spellcast.SpellcastGame);
cast.games.spellcast.SpellcastGame.prototype.run = function(loadedCallback) {
  this.isRunning_ ? loadedCallback() : (this.loadedCallback_ = loadedCallback, this.isLoaded_ ? this.start_() : this.loader_.load());
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "run", cast.games.spellcast.SpellcastGame.prototype.run);
cast.games.spellcast.SpellcastGame.prototype.stop = function() {
  this.loadedCallback_ || !this.isRunning_ ? this.loadedCallback_ = null : (this.audioManager_.pauseBackgroundMusic(), this.isRunning_ = !1, document.body.removeChild(this.renderer_.view), this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCallback_), this.gameManager_.removeEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCallback_));
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "stop", cast.games.spellcast.SpellcastGame.prototype.stop);
cast.games.spellcast.SpellcastGame.prototype.start_ = function() {
  this.loadedCallback_ && (this.audioManager_.playBackgroundMusic(), document.body.removeChild(this.loadingImageElement_), this.renderer_.view.style.position = "absolute", this.renderer_.view.style.left = "0", this.renderer_.view.style.top = "0", document.body.appendChild(this.renderer_.view), this.isRunning_ = !0, this.gameManager_.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null), requestAnimationFrame(this.boundUpdateFunction_), this.loadedCallback_(), this.loadedCallback_ = 
  null, this.gameManager_.addEventListener(cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED, this.boundGameMessageReceivedCallback_), this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCallback_), this.gameManager_.addEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCallback_));
};
cast.games.spellcast.SpellcastGame.prototype.update_ = function(timestamp) {
  if (this.isRunning_) {
    requestAnimationFrame(this.boundUpdateFunction_);
    var deltaTime = this.lastTime_ ? timestamp - this.lastTime_ : 0;
    100 < deltaTime ? deltaTime = 100 : 50 > deltaTime && (deltaTime = 50);
    this.lastTime_ = timestamp;
    this.stateMachine_.update();
    if (this.gameManager_.getGameplayState() != cast.receiver.games.GameplayState.PAUSED) {
      this.actionManager_.update();
      this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
      for (var i = 0;i < this.playingPlayers_.length;i++) {
        var player = this.playerMap_[this.playingPlayers_[i].playerId];
        player && player.active && player.update(deltaTime);
      }
      this.currentExplosion_ && this.currentExplosion_.active && this.currentExplosion_.update(deltaTime);
      this.currentAttackSpell_ && this.currentAttackSpell_.active && this.currentAttackSpell_.update(deltaTime);
      this.partyHealthDisplay_ && this.partyHealthDisplay_.active && this.partyHealthDisplay_.update(deltaTime);
      this.enemy_ && this.enemy_.update(deltaTime);
      this.enemyHealthDisplay_ && this.enemyHealthDisplay_.active && this.enemyHealthDisplay_.update(deltaTime);
      this.countdownPlayerActionDisplay_ && this.countdownPlayerActionDisplay_.active && this.countdownPlayerActionDisplay_.update(deltaTime);
      this.waitingPlayerActionDisplay_ && this.waitingPlayerActionDisplay_.active && this.waitingPlayerActionDisplay_.update(deltaTime);
    }
    this.renderer_.render(this.container_);
  }
};
cast.games.spellcast.SpellcastGame.prototype.onAssetsLoaded_ = function() {
  this.audioManager_.loadAllAudio();
  this.playerHealCastingSprite_ = PIXI.Sprite.fromImage("assets/heal.png");
  this.playerShieldCastingSprite_ = PIXI.Sprite.fromImage("assets/shield.png");
  this.battlefieldDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", 1);
  this.lobbyDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", 1, "assets/lobby_text.png");
  this.playerVictoryDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", 1.3, "assets/win_text.png", new PIXI.Rectangle(0, 0, 718, 219));
  this.enemyVictoryDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", .5, "assets/lose_text.png", new PIXI.Rectangle(0, 0, 837, 220));
  this.instructionsDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", 1, "assets/instructions_text.png");
  if (this.PLAYER_ASSETS_.length < cast.games.spellcast.GameConstants.MAX_PLAYERS) {
    throw Error("Not enough player assets available!");
  }
  for (var i = 0;i < cast.games.spellcast.GameConstants.MAX_PLAYERS;i++) {
    this.playerTextures_.push(PIXI.Texture.fromImage(this.PLAYER_ASSETS_[i]));
    var player = new cast.games.spellcast.gameobjects.Player(this.PLAYER_LOBBY_POSITIONS_[i], this.PLAYER_BATTLE_POSITIONS_[i], new PIXI.Sprite(this.playerTextures_[i]), this.container_, this.canvasWidth_, this.canvasHeight_);
    this.playerPool_.push(player);
  }
  this.enemy_ = new cast.games.spellcast.gameobjects.ElementalEnemy(this.container_, this.canvasWidth_, this.canvasHeight_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.AIR] = new cast.games.spellcast.gameobjects.Explosion("air_explosion", 12, this.container_, this.canvasWidth_, this.canvasHeight_, this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.EARTH] = new cast.games.spellcast.gameobjects.Explosion("earth_explosion", 12, this.container_, this.canvasWidth_, this.canvasHeight_, this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.FIRE] = new cast.games.spellcast.gameobjects.Explosion("fire_explosion", 12, this.container_, this.canvasWidth_, this.canvasHeight_, this.audioManager_);
  this.explosions_[cast.games.spellcast.messages.SpellElement.WATER] = new cast.games.spellcast.gameobjects.Explosion("water_explosion", 12, this.container_, this.canvasWidth_, this.canvasHeight_, this.audioManager_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.AIR] = new cast.games.spellcast.gameobjects.AttackSpell("air_attack", 11, this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.EARTH] = new cast.games.spellcast.gameobjects.AttackSpell("earth_attack", 11, this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.FIRE] = new cast.games.spellcast.gameobjects.AttackSpell("fire_attack", 11, this.container_, this.canvasWidth_, this.canvasHeight_);
  this.attackSpells_[cast.games.spellcast.messages.SpellElement.WATER] = new cast.games.spellcast.gameobjects.AttackSpell("water_attack", 11, this.container_, this.canvasWidth_, this.canvasHeight_);
  this.partyHealthDisplay_ = new cast.games.spellcast.gameobjects.HealthDisplay(this.container_, this.canvasWidth_, this.canvasHeight_);
  this.enemyHealthDisplay_ = new cast.games.spellcast.gameobjects.HealthDisplay(this.container_, this.canvasWidth_, this.canvasHeight_);
  this.waitingPlayerActionDisplay_ = new cast.games.spellcast.gameobjects.TextDisplay;
  this.countdownPlayerActionDisplay_ = new cast.games.spellcast.gameobjects.LargeTextDisplay;
  this.pausedDisplay_ = new cast.games.spellcast.gameobjects.FullScreenDisplay("assets/background.jpg", .5, "assets/paused_text.png");
  this.start_();
  this.stateMachine_.goToState(cast.games.spellcast.messages.GameStateId.WAITING_FOR_PLAYERS);
};
cast.games.spellcast.SpellcastGame.prototype.getGameManager = function() {
  return this.gameManager_;
};
cast.games.spellcast.SpellcastGame.prototype.getAudioManager = function() {
  return this.audioManager_;
};
cast.games.spellcast.SpellcastGame.prototype.getPartyHealthDisplay = function() {
  return this.partyHealthDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getEnemyHealthDisplay = function() {
  return this.enemyHealthDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getCountdownPlayerActionDisplay = function() {
  return this.countdownPlayerActionDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getWaitingPlayerActionDisplay = function() {
  return this.waitingPlayerActionDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getLobbyDisplay = function() {
  return this.lobbyDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getPlayerVictoryDisplay = function() {
  return this.playerVictoryDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getEnemyVictoryDisplay = function() {
  return this.enemyVictoryDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getInstructionsDisplay = function() {
  return this.instructionsDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getPausedDisplay = function() {
  return this.pausedDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getBattlefieldDisplay = function() {
  return this.battlefieldDisplay_;
};
cast.games.spellcast.SpellcastGame.prototype.getTopLeftPosition = function() {
  return this.topLeftPosition_;
};
cast.games.spellcast.SpellcastGame.prototype.getEnemy = function() {
  return this.enemy_;
};
cast.games.spellcast.SpellcastGame.prototype.setCurrentAttackSpellElement = function(spellElement) {
  var newAttackSpell = this.attackSpells_[spellElement];
  if (!newAttackSpell) {
    throw Error("No attack spell found for element " + spellElement);
  }
  if (newAttackSpell == this.currentAttackSpell_) {
    return this.currentAttackSpell_;
  }
  this.currentAttackSpell_ && this.currentAttackSpell_.deactivate();
  return this.currentAttackSpell_ = newAttackSpell;
};
cast.games.spellcast.SpellcastGame.prototype.getCurrentAttackSpell = function() {
  return this.currentAttackSpell_;
};
cast.games.spellcast.SpellcastGame.prototype.setCurrentExplosionSpellElement = function(spellElement) {
  var newExplosion = this.explosions_[spellElement];
  if (!newExplosion) {
    throw Error("No explosion found for element " + spellElement);
  }
  if (newExplosion == this.currentExplosion_) {
    return this.currentExplosion_;
  }
  this.currentExplosion_ && this.currentExplosion_.deactivate();
  return this.currentExplosion_ = newExplosion;
};
cast.games.spellcast.SpellcastGame.prototype.getPlayerHealCastingSprite = function() {
  return this.playerHealCastingSprite_;
};
cast.games.spellcast.SpellcastGame.prototype.getPlayerShieldCastingSprite = function() {
  return this.playerShieldCastingSprite_;
};
cast.games.spellcast.SpellcastGame.prototype.getPlayer = function(playerId) {
  var player = this.playerMap_[playerId];
  if (!player) {
    throw Error("Unknown player with id: " + playerId);
  }
  return player;
};
cast.games.spellcast.SpellcastGame.prototype.removePlayer_ = function(playerId) {
  var player = this.getPlayer(playerId);
  delete this.playerMap_[playerId];
  player.deactivate();
  this.playerPool_.push(player);
};
cast.games.spellcast.SpellcastGame.prototype.createPlayer = function(playerId, name, avatarAssetIndex) {
  if (0 >= this.playerPool_.length) {
    return console.error("Cannot create a new player, ran out of sprites."), null;
  }
  var existingPlayer = this.playerMap_[playerId];
  if (existingPlayer) {
    return existingPlayer.sprite.alpha = 1, existingPlayer.sprite.texture = this.playerTextures_[avatarAssetIndex], existingPlayer;
  }
  var newPlayer = this.playerPool_.shift();
  if (0 > avatarAssetIndex || avatarAssetIndex >= this.playerTextures_.length) {
    console.error("Invalid avatarIndex : " + avatarAssetIndex), avatarAssetIndex = 0;
  }
  newPlayer.sprite.alpha = 1;
  newPlayer.sprite.texture = this.playerTextures_[avatarAssetIndex];
  newPlayer.setPlayerIdAndName(playerId, name);
  return this.playerMap_[playerId] = newPlayer;
};
cast.games.spellcast.SpellcastGame.prototype.selectEnemyElement = function() {
  this.enemyElement_ = this.getRandomElement();
  this.enemy_.activate(this.enemy_.getIdleAnimation(this.enemyElement_));
  return this.enemyElement_;
};
cast.games.spellcast.SpellcastGame.prototype.getEnemyElement = function() {
  return this.enemyElement_;
};
cast.games.spellcast.SpellcastGame.prototype.assignBonusesAndNotifyPlayers = function() {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
  for (var keys = Object.keys(this.playerBonus_), i = 0;i < keys.length;i++) {
    delete this.playerBonus_[keys[i]];
  }
  for (i = 0;i < this.playingPlayers_.length;i++) {
    var playerId = this.playingPlayers_[i].playerId, playerBonus = this.getRandomPlayerBonus();
    this.playerBonus_[playerId] = playerBonus;
    this.playerMessage_.playerBonus = playerBonus;
    this.playerMessage_.castSpellsDurationMillis = cast.games.spellcast.GameConstants.DIFFICULTY_ACTION_PHASE_DURATION_MAP[this.gameDifficulty_];
    this.gameManager_.sendGameMessageToPlayer(playerId, this.playerMessage_);
  }
};
cast.games.spellcast.SpellcastGame.prototype.getPlayerBonus = function(playerId) {
  return this.playerBonus_[playerId];
};
cast.games.spellcast.SpellcastGame.prototype.setupWorld = function() {
  this.battlefieldDisplay_.activate(this.topLeftPosition_);
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
  this.partyMaxHealth_ = cast.games.spellcast.GameConstants.PARTY_INITIAL_HEALTH_MAP[this.playingPlayers_.length];
  this.partyHealthDisplay_.deactivate();
  this.partyHealthDisplay_.activate(this.partyHealthDisplayPos_);
  this.partyHealthDisplay_.configure(this.partyMaxHealth_);
  this.setPartyHealth(this.partyMaxHealth_);
  this.enemyMaxHealth_ = cast.games.spellcast.GameConstants.ENEMY_INITIAL_HEALTH_MAP[this.playingPlayers_.length];
  this.enemyHealthDisplay_.deactivate();
  this.enemyHealthDisplay_.activate(this.enemyHealthDisplayPos_);
  this.enemyHealthDisplay_.configure(this.enemyMaxHealth_);
  this.setEnemyHealth(this.enemyMaxHealth_);
};
cast.games.spellcast.SpellcastGame.prototype.addNumberOfShieldSpellsCastThisRound = function() {
  this.numberOfShieldSpellsCastThisRound_++;
};
cast.games.spellcast.SpellcastGame.prototype.getNumberOfShieldSpellsCastThisRound = function() {
  return this.numberOfShieldSpellsCastThisRound_;
};
cast.games.spellcast.SpellcastGame.prototype.resetNumberOfShieldSpellsCastThisRound = function() {
  this.numberOfShieldSpellsCastThisRound_ = 0;
};
cast.games.spellcast.SpellcastGame.prototype.enablePartyShield = function(value, alpha, tint) {
  if (1 > value) {
    throw Error("Tried to set shield with invalid value: " + value + ".");
  }
  if (value != this.partyShieldValue_) {
    this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
    for (var i = 0;i < this.playingPlayers_.length;i++) {
      this.playerMap_[this.playingPlayers_[i].playerId].enableShield(alpha, tint);
    }
    this.partyShieldValue_ = value;
  }
};
cast.games.spellcast.SpellcastGame.prototype.getPartyShieldValue = function() {
  return this.partyShieldValue_;
};
cast.games.spellcast.SpellcastGame.prototype.disablePartyShield = function() {
  if (0 != this.partyShieldValue_) {
    this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
    for (var i = 0;i < this.playingPlayers_.length;i++) {
      this.playerMap_[this.playingPlayers_[i].playerId].disableShield();
    }
    this.partyShieldValue_ = 0;
  }
};
cast.games.spellcast.SpellcastGame.prototype.enableHeal = function(scale) {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
  for (var i = 0;i < this.playingPlayers_.length;i++) {
    this.playerMap_[this.playingPlayers_[i].playerId].enableHeal(scale);
  }
};
cast.games.spellcast.SpellcastGame.prototype.disableHeal = function() {
  this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.PLAYING, this.playingPlayers_);
  for (var i = 0;i < this.playingPlayers_.length;i++) {
    this.playerMap_[this.playingPlayers_[i].playerId].disableHeal();
  }
};
cast.games.spellcast.SpellcastGame.prototype.getPartyHealth = function() {
  return this.partyHealth_;
};
cast.games.spellcast.SpellcastGame.prototype.setPartyHealth = function(value) {
  this.partyHealth_ = value;
  this.partyHealth_ > this.partyMaxHealth_ && (this.partyHealth_ = this.partyMaxHealth_);
  0 > this.partyHealth_ && (this.partyHealth_ = 0);
  this.partyHealthDisplay_.updateHealth(this.partyHealth_);
  return this.partyHealth_;
};
cast.games.spellcast.SpellcastGame.prototype.updatePartyHealth = function(delta) {
  return this.setPartyHealth(this.partyHealth_ + delta);
};
cast.games.spellcast.SpellcastGame.prototype.getEnemyHealth = function() {
  return this.enemyHealth_;
};
cast.games.spellcast.SpellcastGame.prototype.setEnemyHealth = function(value) {
  this.enemyHealth_ = value;
  this.enemyHealth_ > this.enemyMaxHealth_ && (this.enemyHealth_ = this.enemyMaxHealth_);
  0 > this.enemyHealth_ && (this.enemyHealth_ = 0);
  this.enemyHealthDisplay_.updateHealth(this.enemyHealth_);
  return this.enemyHealth_;
};
cast.games.spellcast.SpellcastGame.prototype.updateEnemyHealth = function(delta) {
  return this.setEnemyHealth(this.enemyHealth_ + delta);
};
cast.games.spellcast.SpellcastGame.prototype.removeAllPlayers = function() {
  var playerIds = Object.keys(this.playerMap_);
  this.disableHeal();
  this.disablePartyShield();
  for (var i = 0;i < playerIds.length;i++) {
    this.removePlayer_(playerIds[i]);
  }
};
cast.games.spellcast.SpellcastGame.prototype.removeEnemy = function() {
  this.enemy_ && this.enemy_.deactivate();
};
cast.games.spellcast.SpellcastGame.prototype.broadcastGameStatus = function(gameStateId) {
  this.gameData_.gameStateId = gameStateId;
  this.gameManager_.updateGameData(this.gameData_);
  this.gameManager_.broadcastGameManagerStatus(null);
};
cast.games.spellcast.SpellcastGame.prototype.setDifficultySetting = function(difficultySetting) {
  this.gameDifficulty_ = difficultySetting;
};
cast.games.spellcast.SpellcastGame.prototype.getRandomElement = function() {
  return cast.games.spellcast.GameConstants.RANDOM_ELEMENTS[Math.floor(Math.random() * cast.games.spellcast.GameConstants.RANDOM_ELEMENTS.length)];
};
cast.games.spellcast.SpellcastGame.prototype.getRandomPlayerBonus = function() {
  return cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS[Math.floor(Math.random() * cast.games.spellcast.GameConstants.RANDOM_PLAYER_BONUS.length)];
};
cast.games.spellcast.SpellcastGame.prototype.onPlayerQuit_ = function(event) {
  if (0 == this.gameManager_.getConnectedPlayers().length) {
    console.log("No more players connected. Tearing down game."), cast.receiver.CastReceiverManager.getInstance().stop();
  } else {
    if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
      console.log("Error: Event status code: " + event.statusCode), console.log("Reason for error: " + event.errorDescription);
    } else {
      var playerId = event.playerInfo.playerId;
      this.playerMap_[playerId] && this.removePlayer_(playerId);
    }
  }
};
cast.games.spellcast.SpellcastGame.prototype.onGameMessageReceived_ = function(event) {
  event.requestExtraMessageData && event.requestExtraMessageData.hasOwnProperty("debug") && (event.requestExtraMessageData.debug ? this.debugUi.open() : this.debugUi.close());
};
cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpell = function() {
  var spell = new cast.games.spellcast.messages.Spell, r = Math.random();
  spell.spellType = .5 > r ? cast.games.spellcast.messages.SpellType.BASIC_ATTACK : .8 > r ? cast.games.spellcast.messages.SpellType.HEAL : cast.games.spellcast.messages.SpellType.SHIELD;
  r = Math.random();
  spell.spellElement = .25 > r ? cast.games.spellcast.messages.SpellElement.FIRE : .5 > r ? cast.games.spellcast.messages.SpellElement.AIR : .75 > r ? cast.games.spellcast.messages.SpellElement.EARTH : cast.games.spellcast.messages.SpellElement.WATER;
  r = Math.random();
  spell.spellAccuracy = .33 > r ? cast.games.spellcast.messages.SpellAccuracy.GOOD : .66 > r ? cast.games.spellcast.messages.SpellAccuracy.GREAT : cast.games.spellcast.messages.SpellAccuracy.PERFECT;
  return spell;
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "createRandomTestSpell", cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpell);
cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpellMessage = function() {
  for (var spellMessage = new cast.games.spellcast.messages.SpellMessage, length = 5 * Math.random(), i = 0;i < length;i++) {
    spellMessage.spells.push(this.createRandomTestSpell());
  }
  return spellMessage;
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "createRandomTestSpellMessage", cast.games.spellcast.SpellcastGame.prototype.createRandomTestSpellMessage);
cast.games.spellcast.SpellcastGame.prototype.createTestPlayerReadyData = function() {
  var playerReadyData = new cast.games.spellcast.messages.PlayerReadyData;
  playerReadyData.playerName = "testPlayer" + Date.now();
  playerReadyData.avatarIndex = Math.floor(Math.random() * this.playerTextures_.length);
  return playerReadyData;
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "createTestPlayerReadyData", cast.games.spellcast.SpellcastGame.prototype.createTestPlayerReadyData);
cast.games.spellcast.SpellcastGame.prototype.testCreatePlayer = function() {
  var playerReadyData = this.createTestPlayerReadyData(), availablePlayers = this.gameManager_.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE), newPlayerId = null, newPlayerId = 0 < availablePlayers.length && !this.gameManager_.getSenderIdWithPlayerId(availablePlayers[0].playerId) ? availablePlayers[0].playerId : this.gameManager_.updatePlayerState(null, cast.receiver.games.PlayerState.AVAILABLE, null).playerId;
  this.gameManager_.updatePlayerState(newPlayerId, cast.receiver.games.PlayerState.READY, playerReadyData);
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "testCreatePlayer", cast.games.spellcast.SpellcastGame.prototype.testCreatePlayer);
cast.games.spellcast.SpellcastGame.prototype.testCreatePlayerActions = function() {
  for (var players = this.gameManager_.getPlayers(), i = 0;i < players.length;i++) {
    this.gameManager_.simulateGameMessageFromPlayer(players[i].playerId, this.createRandomTestSpellMessage());
  }
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "testCreatePlayerActions", cast.games.spellcast.SpellcastGame.prototype.testCreatePlayerActions);
cast.games.spellcast.SpellcastGame.prototype.testStartGame = function() {
  var playerPlayingData = new cast.games.spellcast.messages.PlayerPlayingData;
  playerPlayingData.difficultySetting = cast.games.spellcast.messages.DifficultySetting.EASY;
  var players = this.gameManager_.getPlayers();
  this.gameManager_.updatePlayerState(players[0].playerId, cast.receiver.games.PlayerState.PLAYING, playerPlayingData);
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "testStartGame", cast.games.spellcast.SpellcastGame.prototype.testStartGame);
cast.games.spellcast.SpellcastGame.prototype.testQuitPlayer = function() {
  var players = this.gameManager_.getPlayers();
  this.gameManager_.updatePlayerState(players[Math.floor(Math.random() * players.length)].playerId, cast.receiver.games.PlayerState.QUIT, null);
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "testQuitPlayer", cast.games.spellcast.SpellcastGame.prototype.testQuitPlayer);
cast.games.spellcast.SpellcastGame.prototype.testPause = function() {
  var players = this.gameManager_.getPlayers(), pausePlayerId = players[Math.floor(Math.random() * players.length)].playerId;
  this.gameManager_.updatePlayerState(pausePlayerId, cast.receiver.games.PlayerState.IDLE, null);
  setTimeout(function() {
    this.gameManager_.updatePlayerState(pausePlayerId, cast.receiver.games.PlayerState.PLAYING, null);
  }.bind(this), 5E3);
};
goog.exportProperty(cast.games.spellcast.SpellcastGame.prototype, "testPause", cast.games.spellcast.SpellcastGame.prototype.testPause);

