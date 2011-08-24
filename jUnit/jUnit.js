String.prototype.formatWith = function () {
    var r = this, i = 0, l = arguments.length;
    for (i; i < l; i++) {
        r = r.replace('{' + i + '}', arguments[i]);
    }
    return r;
};

(function (global, undefined) {
    var junit = { }, canLog = (typeof global.console === 'object'), TestResult, predicate;
    junit.console = {
        log: function (str) {
            if (canLog) { global.console.log(str); }
        },
        success: function (str) {
            if (canLog) { global.console.log('%c{0}'.formatWith(str), 'color:green'); }
        },
        fail: function (str) {
            if (canLog) { global.console.log('%c{0}'.formatWith(str), 'color:red'); }
        },
        group: function (str) {
            if (canLog) { global.console.group(str); }
        },
        groupEnd: function () {
            if (canLog) { global.console.groupEnd(); }
        }			
    };
   
    predicate = function (fn) {
		var message = { success: '      - Success', fail: '      - Fail: Expected "{0}" but was "{1}"'.formatWith(arguments[1], arguments[2]) };
        if (fn()) {
			junit.console.success(message.success);
		} else {
			junit.console.fail(message.fail);
		}
    };
	
    TestResult = function (fn, p1, p2) {
        this.fn = fn;
        this.param_1 = p1;
        this.param_2 = p2;
        this.get = function (args) {
            if (args[args.length - 1] === 'raw') { return this.fn(); }
            predicate(this.fn, this.param_1, this.param_2);
        };
    };

    junit.when = function (ctx, funcs) {

        junit.console.group('*** When {0} =>'.formatWith(ctx));
        funcs();
        junit.console.groupEnd();
    };
    
    junit.isTrue = function (p1) {
        var trueResult = new TestResult(function () { return p1 === true; }, p1, true);
        return trueResult.get(arguments);
    };

    junit.isFalse = function (p1) {
        var falseResult = new TestResult(function () { return p1 === false; }, p1, false);
        return falseResult.get(arguments);
    };

    junit.equal = function (p1, p2) {
        var equalResult = new TestResult(function () { return p1 === p2; }, p1, p2);
        return equalResult.get(arguments);
    };

    junit.notEqual = function (p1, p2) {
        var notEqualResult = new TestResult(function () { return p1 !== p2; }, p1, p2);
        return notEqualResult.get(arguments);
    };

    junit.nullOrUndefined = function (p1) {
        var nullOrUndefinedResult = new TestResult(function () { return p1 === null || typeof p1 === 'undefined'; }, 'null or undefined', p1);
        return nullOrUndefinedResult.get(arguments);
    };

    junit.notNullOrUndefined = function (p1) {
        var notNullOrUndefinedResult = new TestResult(function () { return typeof p1 !== 'undefined' && p1 !== null; }, 'not null or undefined', p1);
        return notNullOrUndefinedResult.get(arguments);
    };

    junit.aNumber = function (p1) {
        var aNumberResult = new TestResult(function () { return typeof p1 === 'number' && !isNaN(global.parseFloat(p1)); }, 'a number', "{0} - type is {1}".formatWith(p1, typeof p1));
        return aNumberResult.get(arguments);
    };

    junit.notANumber = function (p1) {
        var notANumberResult = new TestResult(function () { return typeof p1 !== 'number' || isNaN(global.parseFloat(p1)); }, 'not a number', "{0} - type is {1}".formatWith(p1, typeof p1));
        return notANumberResult.get(arguments);
    };

    junit.assert = function (expected, fn) {
        var result = fn();
        if (result === expected) {
            junit.console.success('      - Success');
		} else {
            junit.console.fail('      - Fail: Expected "{0}" but was "{1}"'.formatWith(expected, result));
		}
    };

    if (global.junit === undefined) { global.junit = junit; }

    junit.test = function (testName, fn) {
        junit.console.log('    * {0} ->'.formatWith(testName));
        if (typeof fn === 'string') {
            if (fn.indexOf('junit') === -1) { fn = 'junit.{0}'.formatWith(fn); }
            eval(fn);
        } else {
            fn();
        }

    };
})(window);