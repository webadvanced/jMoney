(function (String) {
	"use strict";
	String.prototype.formatWith = function () {
		var r = this, i = 0, l = arguments.length;
		for (i; i < l; i += 1) {
			r = r.replace('{' + i + '}', arguments[i]);
		}
		return r;
	};
}(String));

(function (global) {
	var jn = { }, u;
    jn.undefinedd = u;
    jn.canLog = (typeof global.console !== jn.undefinedd);
    jn.console = {
        log: function (str) {
            jn.util.logIt(function () { global.console.log(str); });
        },
        success: function (str) {
            jn.util.logIt(function () { global.console.log('%c{0}'.formatWith(str), 'color:green'); });
        },
        fail: function (str) {
            jn.util.logIt(function () { global.console.log('%c{0}'.formatWith(str), 'color:red'); });
        },
        group: function (str) {
            jn.util.logIt(function () { global.console.group(str); });
        },
        groupEnd: function () {
            jn.util.logIt(function () { global.console.groupEnd(); });
        },
        info: function (str) {
            jn.util.logIt(function () { global.console.info(str); });
        }
    };

    jn.util = { };
    jn.util.inherit = function (childClass, parentClass) {
        var Subclass = function () {
        };
        Subclass.prototype = parentClass.prototype;
        childClass.prototype = new Subclass();
    };
    jn.util.argsToArray = function (args) {
        var arrayOfArgs = [], i = 0;
        for (i; i < args.length; i += 1) {
            arrayOfArgs.push(args[i]);
        }
        return arrayOfArgs;
    };
	jn.util.logIt = function (fn) {
		if (jn.canLog) {
			fn();
		}
	};

    jn.Guts = function () {
        this.specGroups = [];
        this.currentSpecGroup = null;

        // wrap predicates
        this.predicateClass = function () {
            jn.Predicates.apply(this, arguments);
        };
        jn.util.inherit(this.predicateClass, jn.Predicates);
        jn.Predicates.wrapInto_(jn.Predicates.prototype, this.predicateClass);
    };

    jn.Guts.prototype.getCurrentSpecGroup = function () {
        return this.currentSpecGroup;
    };

    jn.getGuts = function () {
        var g = jn.currentGuts = jn.currentGuts || new jn.Guts();
        return g;
    };

    global.when = function (description, func) {
        var specGroup = new jn.SpecGroup(description, func);
        jn.getGuts().specGroups.push(specGroup);
        jn.getGuts().currentSpecGroup = specGroup;
        specGroup.runSpecs();
    };

    global.spec = function (name) {
        var spec = new jn.Spec(name), currentSpecGroup;
        currentSpecGroup = jn.getGuts().getCurrentSpecGroup();
        currentSpecGroup.specs.push(spec);
        currentSpecGroup.currentSpec = spec;
        return this;
    };

    global.expect = function (actualResult) {
        var spec = jn.getGuts().getCurrentSpecGroup().getCurrentSpec();
        return spec.expect(actualResult);
    };

    jn.SpecGroup = function (description, func) {
        //needs to have an array of specs
        this.description = description;
        this.specs = [];
        this.func = func;
        this.currentSpec = null;
    };

    jn.SpecGroup.prototype.runSpecs = function () {
        this.func();
        jn.processSpecGroup(this);
    };

    jn.SpecGroup.prototype.getCurrentSpec = function () {
        return this.currentSpec;
    };

    jn.processSpecGroup = function (specGroup) {
        var i = 0, specs = specGroup.specs, writeMessage, passed = 0, faild = 0, spec;
        writeMessage = function (result, exeTime) {
            jn.console[result.logType]('{0}  -> ({1}ms)'.formatWith(result.message, exeTime));
            if (result.logType === 'fail') {
                faild += 1;
            } else {
                passed += 1;
            }
        };
        jn.console.group(specGroup.description);
        for (i; i < specs.length; i += 1) {
            spec = specs[i];
            writeMessage(spec.result, spec.exeTime);
        }
        jn.console.info('Passed: {0}   Failed: {1}'.formatWith(passed, faild));
        jn.console.groupEnd();
    };

    jn.Spec = function (name) {
        //needs to have a spec group
        this.name = name;
        this.result = null;
        this.expected = null;
        this.actual = null;
        this.isNot = false;
        this.exeTime = 0;
    };

    jn.Spec.prototype.not = function () {
        this.isNot = true;
        return this;
    };

    jn.Spec.prototype.getPredicatesClass = function () {
        return jn.getGuts().predicateClass;
    };

    jn.Spec.prototype.setSpecResult = function (specResult) {
        this.result = specResult;
    };

    jn.Spec.prototype.expect = function (actual) {
        var guts = jn.getGuts(), pro, methodName;
        pro = this.getPredicatesClass().prototype;
        for (methodName in pro) {
			if (pro.hasOwnProperty(methodName)) {
				jn.Spec.prototype[methodName] = pro[methodName];
			}
        }
        jn.Predicates.apply(this, [guts, actual, this, false]);
        return this;
    };

    jn.SpecResult = function (logType, message) {
        this.logType = logType;
        this.message = message;
    };

    jn.Predicates = function (guts, actual, spec, optIsNot) {
        this.isNot = optIsNot;
        this.guts = guts;
        this.actual = actual;
        this.spec = spec;
    };

    jn.Predicates.wrapInto_ = function (prototype, predicateClass) {
        var methodName, orig;
        for (methodName in prototype) {
			if (prototype.hasOwnProperty(methodName)) {
				orig = prototype[methodName];
				predicateClass.prototype[methodName] = jn.Predicates.predicateFn_(methodName, orig);
			}
        }
    };

    jn.Predicates.predicateFn_ = function (predicateName, predicateFunction) {
        return function () {
            var predicateArgs = jn.util.argsToArray(arguments), start, result, end, exeTime, message, logType, expMessage, specResult;
            start = new Date().getTime();
            if (typeof this.actual === 'function') {
                this.actual = this.actual();
				predicateArgs.push(this.actual);
            }
            result = predicateFunction.apply(this, predicateArgs);
            end = new Date().getTime();
            exeTime = (end - start);
            this.exeTime = (exeTime === 0) ? 1 : exeTime;
            if (this.isNot) {
                result = !result;
            }
            if (result) {
                //success
                message = '    - Passed';
                logType = 'success';
            } else {
                //fail
                expMessage = (this.isNot) ? 'but was not' : 'but was';
                message = '    - Fail: expected "{0}" {1} "{2}"'.formatWith(this.expected, expMessage, this.actual);
                logType = 'fail';
            }

            specResult = new jn.SpecResult(logType, message);
            this.spec.setSpecResult(specResult);
        };
    };
    /*
    * List of  preticates
    */
    jn.Predicates.prototype.toBe = function (expected) {
        this.expected = expected;
        return expected === this.actual;
    };

    jn.Predicates.prototype.toMatch = function (expected) {
        this.expected = expected;
        return (new RegExp(expected).test(this.actual));
    };

    jn.Predicates.prototype.toBeUndefined = function () {
        var u;
		this.expected = 'undefined';
        return this.actual === jn.undefinedd;
    };

    jn.Predicates.prototype.toBeNull = function () {
        this.expected = 'null';
        return this.actual === null;
    };

    jn.Predicates.prototype.toBeTrue = function () {
        this.expected = 'true';
        return this.actual === true;
    };

    jn.Predicates.prototype.toBeNumeric = function () {
        var t = typeof this.actual, message;
        message = 'number (type: ' + t + ')';
        this.expected = message;
        return (this.actual !== null && this.actual !== jn.undefinedd && t !== 'string' && !isNaN(this.actual));
    };

    //for testing only
    global.jn = jn;
}(window));