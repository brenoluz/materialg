(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.materialg = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;

        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();

        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.toString()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
    obj[prop] = descriptor.value;
    return obj;
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        var stack = filterStackString(concatedStacks);
        object_defineProperty(error, "stack", {value: stack, configurable: true});
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * The counter is used to determine the stopping point for building
 * long stack traces. In makeStackTraceLong we walk backwards through
 * the linked list of promises, only stacks which were created before
 * the rejection are concatenated.
 */
var longStackCounter = 1;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
            promise.stackCounter = longStackCounter++;
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;

        if (Q.longStackSupport && hasStacks) {
            // Only hold a reference to the new promise if long stacks
            // are enabled to reduce memory usage
            promise.source = newPromise;
        }

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Q can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected(err) {
            pendingCount--;
            if (pendingCount === 0) {
                err.message = ("Q can't get fulfillment value from any promise, all " +
                    "promises were rejected. Last error message: " + err.message);
                deferred.reject(err);
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    if (!callback || typeof callback.apply !== "function") {
        throw new Error("Q can't apply finally callback");
    }
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    if (callback === undefined) {
        throw new Error("Q can't wrap an undefined function");
    }
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require('_process'))

},{"_process":1}],3:[function(require,module,exports){
var back = function(){

  this.list = {};
  this.default = null;

  this.MENU     = 8;
  this.OVERRIDE = 6;
  this.MODAL    = 4;
  this.DIALOG   = 3;
};

back.prototype.add = function(priority, cb){

  this.list[priority] = cb;
};

back.prototype.clear = function(){
  this.list = {};
}

back.prototype.setDefault = function(cb){

  this.default = cb;
};

back.prototype.remove = function(priority){

  delete this.list[priority];
};

back.prototype.override = function(cb){

  this.add(this.OVERRIDE, cb);
};

back.prototype.run = function(){

  var call = this.default;
  
  //9 is max priority
  for(var i = 0; i < 10; i++){
    
    if(!!this.list[i]){
      
      call = this.list[i];
      break;
    }
  }

  call();
};

module.exports = new back;


},{}],4:[function(require,module,exports){
var Q = require('q');

var base = function(){};
module.exports = base;

base.prototype.make = function(){
  
  var def = Q.defer();
  def.resolve();
  return def.promise;
};


},{"q":2}],5:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var controller = function(params){

  Base.call(this);

  this.params = params;
  this.view   = null;
};
controller.prototype = new Base;
controller.prototype.constructor = controller;

controller.prototype.make = function(){
  return this.view.render();
};

controller.prototype.destroy = function(){ /* For extend */  };

module.exports = controller;

},{"./base":4,"q":2}],6:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var form = function(){
  
  this.elements   = [];
  this.validators = [];
};
form.prototype = new Base;
form.prototype.constructor = form;
module.exports = form;

form.prototype.append = function(element){

  this.elements.push(element);
};

form.prototype.addValidator = function(validator){

  this.validators.push(validator);
};

form.prototype.isValidForm = function(cb){

  var values  = this.getValues();
  var clone_v = [];

  for(var v in this.validators) clone_v.push(this.validators[v]);
  clone_v.reverse();

  var first_validator = clone_v.pop();
  
  var func_v = function(validator){
  
    //ended without error
    if(!validator) return cb(true);

    validator.isValid(values, function(res){

      //stop when false
      if(!res) return cb(false);
      var next_validator = clone_v.pop();

      return func_v(next_validator);
    });
  };

  return func_v(first_validator);
};

form.prototype.isValid = function(cb, obj){
  
  var self = this;

  var promises = [];
  for(var e in this.elements){
    var element = this.elements[e];
    var def = Q.defer();
    (function(elem, deff, o){
      elem.isValid(deff.resolve, o);
    })(element, def, obj);
    promises.push(def.promise);
  }

  Q.all(promises).then(function(data){

    var args = Array.prototype.slice.call(data);
    var res  = args.indexOf(false) < 0;
    if(!res) return cb(false);
    return self.isValidForm(cb);
  });
};

form.prototype.setValues = function(values){

  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name && values.hasOwnProperty(name)) element.val(values[name]);
  }
};

form.prototype.getValues = function(){

  var values = {};
  for(var e in this.elements){

    var element = this.elements[e];

    if(!!element.getValues){
      values = Object.assign(values, element.getValues());
    }else{

      var name    = !!element.name ? element.name : element.attr('name');
      var value   = element.getValue();
      if(!!name)  values[name] = typeof value == 'string' ? value.trim() : value;
    }
  }

  return values;
};

},{"./base":4,"q":2}],7:[function(require,module,exports){
module.exports = {
  'Base':       require('./base'),
  'Form':       require('./form'),
  'back':       require('./back'),
  'Controller': require('./controller'),
  'view':       require('./view/index'),
  'validate':   require('./validate/index'),
  'plugins':    require('./plugins/index'),
};

},{"./back":3,"./base":4,"./controller":5,"./form":6,"./plugins/index":9,"./validate/index":18,"./view/index":32}],8:[function(require,module,exports){
var mgdate = function (element) {
    var self = this;
    var lang = ($(element).data("lang") !== undefined) ? $(element).data("lang") : 'pt';
    console.log(lang)
    $(element).on("click", function () {
        var val = $(this).val();
        $(this).attr('readonly', true);
        var day = '', month = '', year = '';
        var arrayValue = val.split('-')
        var valid = self.validDate(arrayValue[2], arrayValue[1], arrayValue[0])
        if (val === undefined || val === '' || valid === false) {
            var today = new Date();
            day = today.getDate();
            month = today.getMonth() + 1;
            year = today.getFullYear();
        } else {
            day = Number(arrayValue[2]);
            month = Number(arrayValue[1]);
            year = Number(arrayValue[0]);
        }
        self.init($(this), day, month, year, lang);
    });
};

mgdate.prototype.init = function (element, day, month, year, lang) {
    this.element = element;
    this.day = day;
    this.month = month;
    this.year = year;

    this.lang = lang;
    this.nLoadYearsPrev = 150;
    this.nLoadYearsNext = 50;

    this.quickLoad = true;

    this.loadHtml();
    $("#MG_Date_Back").fadeIn("fast");
    this.dayAdjust = 1;
    this.monthAdjust = 1;
    this.yearAdjust = 1;
    this.loadDays();
    this.loadYears();
    elMonth = this.loadMonths();
    elDay = this.loadDays();

    this.setYear(this.year);
    this.setMonth(elMonth);
    this.setDay(elDay);
    this.events();
    this.wait = 50;

};
mgdate.prototype.setDay = function (element) {
    if (element.length > 0) {
        this.jumpToDay(element);
    } else {
        $("#MG_Date_day .scroller").html('');
        var selected = this.loadDays();
        this.jumpToDay(selected);
    }
}
mgdate.prototype.goToDay = function (element, velocity) {

    if (velocity === undefined) {
        velocity = 200;
    }

    var cont = element.parent();
    this.dayAdjust = 0;
    this.day = Number(element.data('day'));
    $("#dSelected").attr('id', '');
    element.attr("id", 'dSelected');
    this.loadDays();
    scrollValue = this.getScrollValueEl(element);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {

        if (element.data('type') === 'f') {
            var realId = "d" + self.day;
            self.jumpToDay(realId);
        }
        setTimeout(function () {
            self.dayAdjust = 1;
        }, self.wait);

    });
};
mgdate.prototype.jumpToDay = function (el) {
    this.day = el.data('day');

    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
}
mgdate.prototype.getDayHtml = function (day, selected) {

    var div = document.createElement("div");
    $(div).attr("data-day", day);
    if (selected === true) {
        $(div).attr("id", 'dSelected');
    }
    if (day > 28) {
        $(div).attr("class", 'd' + day);
    }
    var nDay = (day < 10) ? '0' + day : day;
    var t = document.createTextNode(nDay);
    div.appendChild(t);

    return $(div);
};
mgdate.prototype.reloadDays = function () {
    var lastDay = this.lastDayMonth(this.year, this.month);
    var dif = lastDay - this.day;
    el = $("#dSelected");
    if (dif < 0) {
        for (var i = 0; i > dif; i--) {
            prev = el.prev();
            el = prev;
        }
    }
    this.goToDay(el);
    $("#MG_Date_day .scroller").html('');
    this.loadDays();
}
mgdate.prototype.loadDays = function () {
    var div = this.getDayHtml(this.day, true);
    if ($("#dSelected").length === 0) {
        $("#MG_Date_day .scroller").append(div);
    }
    var lastDay = this.lastDayMonth(this.year, this.month)
    this.loadPrevDays(lastDay);
    this.loadNextDays(lastDay);

    return $('#dSelected');
};
mgdate.prototype.loadPrevDays = function (lastDay) {

    var selected = $("#dSelected");
    var tDay = this.day - 1;
    var prev = selected.prev();
    for (var i = 0; i < 60; i++) {
        if (tDay === 0) {
            tDay = lastDay;
        }
        var html = this.getDayHtml(tDay);
        if (prev.length === 0) {
            $("#MG_Date_day .scroller").prepend(html);
        } else {
            prev.html(html.html())
        }
        prev = prev.prev();
        --tDay;
    }

    var i2 = 0;
    while (prev.length != 0) {
        if (tDay === 0) {
            tDay = lastDay;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tDay;
    }

}


mgdate.prototype.loadNextDays = function (lastDay) {

    var selected = $("#dSelected");
    var tDay = this.day + 1;
    var next = selected.next();
    for (var i = 0; i < 60; i++) {
        if (tDay === lastDay + 1) {
            tDay = 1;
        }

        if (next.length === 0) {
            var html = this.getDayHtml(tDay);
            $("#MG_Date_day .scroller").append(html);

        }
        next = next.next();
        ++tDay;
    }

    while (next.length != 0) {
        if (tDay === lastDay + 1) {
            tDay = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tDay;
    }

};
mgdate.prototype.infiniteScrollDay = function () {
    var cont = $("#MG_Date_day .scroller");
    var wait = 250;


    if (this.dayAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollDay();
        }, wait));
    }

};
mgdate.prototype.adjustScrollDay = function () {

    if (this.dayAdjust === 1) {

        var self = this;
        var cel = $("#MG_Date_day .scroller div:nth-child(1)");
        ;
        var halfCelHeight = cel.height() / 2;

        $("#MG_Date_day .scroller div").each(function () {
            //if($(this).css('display') === 'block'){
            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToDay(correct, 50)
                return false;

            }
            //}
        });
    }
}
mgdate.prototype.setMonth = function (element) {
    if (element.length > 0) {
        this.jumpToMonth(element);
    } else {
        $("#MG_Date_month .scroller").html('');
        var selected = this.loadMonths();
        this.jumpToMonth(selected);
    }
};
mgdate.prototype.goToMonth = function (element, velocity) {

    var elYear = Number(element.data("year"));

    if (velocity === undefined) {
        velocity = 200;
    }
    var cont = element.parent();
    this.monthAdjust = 0;
    this.month = element.data('month');
    $("#mSelected").attr('id', '');
    element.attr("id", 'mSelected');

    this.reloadDays();
    this.loadMonths();
    scrollValue = this.getScrollValueEl(element);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {
        setTimeout(function () {
            self.monthAdjust = 1;

        }, self.wait);

    });

};
mgdate.prototype.jumpToMonth = function (el) {
    this.month = el.data('month');
    var cont = el.parent();
    var newValue = this.getScrollValueEl(el);

    cont.scrollTop(newValue);
};
mgdate.prototype.infiniteScrollMonth = function () {
    var cont = $("#MG_Date_month .scroller");
    var wait = 250;

    if (this.monthAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollMonth();
        }, wait));
    }

};
mgdate.prototype.adjustScrollMonth = function () {

    if (this.monthAdjust === 1) {

        var self = this;
        var cel = $("#MG_Date_month .scroller div:nth-child(1)");
        ;
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_month .scroller div").each(function () {

            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToMonth(correct, 50)
                return false;

            }
        });
    }
};

mgdate.prototype.loadMonths = function () {

    var div = this.getMonthHtml(this.month, this.year, true);
    if ($("#mSelected").length === 0) {
        $("#MG_Date_month .scroller").append(div);
    }
    this.loadPrevMonths();
    this.loadNextMonths();

    return $('#mSelected');
};
mgdate.prototype.getMonthHtml = function (month, year, selected) {
    if (month === 0) {
        month = 12;
        --year;
    }

    var div = document.createElement("div");
    div.setAttribute("data-month", month);

    if (selected !== undefined) {
        div.setAttribute("id", 'mSelected');
    }

    var nMonth = this.monthNames[this.lang][month];
    var t = document.createTextNode(nMonth);
    div.appendChild(t);

    return $(div);
};
mgdate.prototype.loadPrevMonths = function () {

    var selected = $("#mSelected");
    var tMonth = this.month - 1;
    var tYear = this.year;

    var prev = selected.prev();
    for (var i = 0; i < 60; i++) {
        if (tMonth === 0) {
            tMonth = 12;
            tYear--;
        }

        if (prev.length === 0) {

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").prepend(html);

        }
        prev = prev.prev();
        --tMonth;
    }

    while (prev.length != 0) {
        if (tMonth === 0) {
            tMonth = 12;
        }
        var tPrev = prev.prev();
        prev.remove();
        prev = tPrev;
        --tMonth;
    }
};

mgdate.prototype.loadNextMonths = function () {
    var selected = $("#mSelected");
    var tMonth = this.month + 1;
    var tYear = this.year;

    var next = selected.next();
    for (var i = 0; i < 60; i++) {
        if (tMonth === 13) {
            tMonth = 1;
        }

        if (next.length === 0) {

            var html = this.getMonthHtml(tMonth, tYear);
            $("#MG_Date_month .scroller").append(html);

        }
        next = next.next();
        ++tMonth;
    }

    while (next.length != 0) {
        if (tMonth === 13) {
            tMonth = 1;
        }
        var tNext = next.next();
        next.remove();
        next = tNext;
        ++tMonth;

    }
};

mgdate.prototype.setYear = function (number) {
    this.jumpToYear("y" + number);
};
mgdate.prototype.goToYear = function (id, velocity) {

    var element = $("#" + id);
    if (velocity === undefined) {
        velocity = 200;
    }
    var cont = element.parent();
    var prevYear = this.year;
    this.yearAdjust = 0;
    this.year = Number(element.html());

    this.reloadDays();
    if (this.quickLoad === false) {
        this.loadYears();
    }

    scrollValue = this.getScrollValue(id);
    var self = this;
    cont.animate({scrollTop: scrollValue}, velocity, function () {
        setTimeout(function () {
            self.yearAdjust = 1;
        }, self.wait);

    });
    maxScroll = cont.prop("scrollHeight")

};
mgdate.prototype.jumpToYear = function (id) {
    var el = $("#" + id);
    this.year = Number(el.html());
    var cont = el.parent();
    var newValue = this.getScrollValue(id);

    cont.scrollTop(newValue);
};
mgdate.prototype.infiniteScrollYear = function () {
    var cont = $("#MG_Date_year .scroller");
    var wait = 250;

    if (this.yearAdjust === 1) {
        clearTimeout($.data(this, 'scrollTimer'));
        var self = this;
        $.data(this, 'scrollTimer', setTimeout(function () {
            self.adjustScrollYear();
        }, wait));
    }
};
mgdate.prototype.adjustScrollYear = function () {

    if (this.yearAdjust === 1) {

        var self = this;
        var cel = $("#y" + this.year);
        var halfCelHeight = cel.height() / 2;
        $("#MG_Date_year .scroller div").each(function () {

            if ($(this).position().top > -halfCelHeight) {
                var correct = $(this).next().next();
                self.goToYear(correct.attr('id'), 50)
                return false;

            }
        });
    }
};

mgdate.prototype.loadYears = function () {
    console.log('carrega ano')
    this.loadPrevYears();
    if ($("#y" + this.year).length === 0) {
        var html = this.getYearHtml(this.year);
        $("#MG_Date_year .scroller").append(html);
    }
    this.loadNextYears();

};
mgdate.prototype.getYearHtml = function (year) {
    var div = document.createElement("div");
    $(div).attr("y" + year)
    var t = document.createTextNode(year);
    div.appendChild(t);
    div.setAttribute('id', 'y' + year);
    return div;
};
mgdate.prototype.loadPrevYears = function () {
    var start = this.year - 1;
    var end = (this.quickLoad === true) ? this.year - this.nLoadYearsPrev : this.year - 30;
    console.log('prev', end);
    while (start >= end) {
        if ($("#y" + start).length === 0) {
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").prepend(html);
        }
        start--;
    }
    while ($("#y" + start).length > 0) {
        $("#y" + start).remove();
        start--;
    }
};
mgdate.prototype.loadNextYears = function () {
    var start = this.year + 1;
    var end = (this.quickLoad === true) ? this.year + this.nLoadYearsNext : this.year + 30;
    console.log('next', end);
    while (start <= end) {
        if ($("#y" + start).length === 0) {
            var html = this.getYearHtml(start);
            $("#MG_Date_year .scroller").append(html);
        }
        start++;
    }
    while ($("#y" + start).length > 0) {
        $("#y" + start).remove();
        start++;
    }
};

mgdate.prototype.getScrollValue = function (id) {

    var element = $("#" + id);
    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
};
mgdate.prototype.getScrollValueEl = function (element) {

    var scrollTarget = element.prev().prev();
    var cont = element.parent();

    var scrollValue = cont.scrollTop() + scrollTarget.position().top;

    return scrollValue;
};
mgdate.prototype.events = function (id) {
    var self = this;
    $("body").delegate("#MG_Date_day .scroller div", "click", function () {
        if (self.dayAdjust === 1) {
            self.goToDay($(this));
        }
    });
    $("#MG_Date_day .scroller").scroll(function () {
        self.infiniteScrollDay();
    });
    $("body").delegate("#MG_Date_month .scroller div", "click", function () {
        if (self.monthAdjust === 1) {
            self.goToMonth($(this));
        }
    });
    $("#MG_Date_month .scroller").scroll(function () {
        self.infiniteScrollMonth();
    });
    $("body").delegate("#MG_Date_year .scroller div", "click", function () {
        if (self.yearAdjust === 1) {
            self.goToYear($(this).attr('id'));
        }
    });
    $("#MG_Date_year .scroller").scroll(function () {
        self.infiniteScrollYear();
    });
    $("#MG_Date_Buttons .cancel").on("click", function () {
        self.cancel();
    });
    $("#MG_Date_Buttons .send").on("click", function () {
        self.send()
    });
};

mgdate.prototype.cancel = function () {
    $("#MG_Date_Back").fadeOut("fast", function () {
        $(this).remove();
    });
};
mgdate.prototype.send = function () {
    var day = this.day;
    var month = this.month;
    var year = this.year;
    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }
    var countYear = year.toString().length;
    var difYear = 4 - countYear;
    while (difYear > 0) {
        year = '0' + year;
        difYear--;
    }
    this.element.val(year + '-' + month + '-' + day);
    this.cancel();
};

mgdate.prototype.monthNames = {
    pt: ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    es: ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
mgdate.prototype.text = {
    pt: {cancel: 'cancelar', send: 'confirmar'},
    es: {cancel: 'cancelar', send: 'confirmar'},
    en: {cancel: 'cancel', send: 'confirm'},
};

//mgdate.prototype.monthNames = {engUS: ['','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']};
//mgdate.prototype.text = {engUS: {cancel: 'cancel', send: 'send'}};

mgdate.prototype.lastDayMonth = function (year, month) {
    var year = Number(year);
    var month = Number(month);
    var lastDay = new Date(year, month);
    lastDay.setDate(0);
    return lastDay.getUTCDate();
};
mgdate.prototype.validDate = function (d, m, y) {
    var date = new Date(y, m - 1, d);
    return (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d);
};
mgdate.prototype.loadHtml = function () {
    self = this;

    if ($("#MG_Date_Back").length === 0) {
        var mgDateBack = document.createElement("div");
        mgDateBack.setAttribute('id', 'MG_Date_Back');
        var mgDateContainer = document.createElement("div");
        mgDateContainer.setAttribute('id', 'MG_Date_Container');

        mgDateBack.appendChild(mgDateContainer);

        var mgDate = document.createElement("div");
        mgDate.setAttribute('id', 'MG_Date');
        mgDate.setAttribute('class', 'MG_Date');
        var mgDateButtons = document.createElement("div");
        mgDateButtons.setAttribute('id', 'MG_Date_Buttons');

        mgDateContainer.appendChild(mgDate);

        var celDay = document.createElement("div");
        celDay.setAttribute('id', 'MG_Date_celday');
        var day = document.createElement("div");
        day.setAttribute('id', 'MG_Date_day');
        var scroller = document.createElement("div");
        scroller.className = 'scroller';
        mgDate.appendChild(celDay);
        celDay.appendChild(day);
        day.appendChild(scroller);

        var celMonth = document.createElement("div");
        celMonth.setAttribute('id', 'MG_Date_celmonth');
        var month = document.createElement("div");
        month.setAttribute('id', 'MG_Date_month');
        var scroller2 = document.createElement("div");
        scroller2.className = 'scroller';

        mgDate.appendChild(celMonth);
        celMonth.appendChild(month);
        month.appendChild(scroller2);

        var celYear = document.createElement("div");
        celYear.setAttribute('id', 'MG_Date_celyear');
        var year = document.createElement("div");
        year.setAttribute('id', 'MG_Date_year');
        var scroller3 = document.createElement("div");
        scroller3.className = 'scroller';

        mgDate.appendChild(celYear);
        celYear.appendChild(year);
        year.appendChild(scroller3);

        var cover = document.createElement("div");
        cover.setAttribute('id', 'MG_Date_cover');
        cover.className = 'MG_Date';

        mgDate.appendChild(cover);
        var d1 = document.createElement("div");
        var d2 = document.createElement("div");
        var d3 = document.createElement("div");
        cover.appendChild(d1);
        cover.appendChild(d2);
        cover.appendChild(d3);

        mgDateContainer.appendChild(mgDateButtons);

        var ipCancel = document.createElement("input");
        ipCancel.id = "MG_Date_Cancel";
        ipCancel.type = "button";
        ipCancel.className = 'cancel';
        ipCancel.value = self.text[this.lang]['cancel'];
        var ipSend = document.createElement("input");
        ipSend.id = "MG_Date_Send";
        ipSend.type = "button";
        ipSend.className = 'send';
        ipSend.value = self.text[this.lang]['send'];
        mgDateButtons.appendChild(ipCancel);
        mgDateButtons.appendChild(ipSend);

        $("body").append(mgDateBack);
    }
};

$.fn.mgdate = function(){
    new mgdate($(this));
    return this;
};

module.exports = mgdate;

},{}],9:[function(require,module,exports){
module.exports = {
  'Date':   require('./date'),
};

},{"./date":8}],10:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var atOrBelow = function(limit){

  this.limit = limit
  this.msg   = 'Valor superior ao limite de ' + this.limit;
};
atOrBelow.prototype = new Base;
atOrBelow.prototype.constructor = atOrBelow;
module.exports = atOrBelow;

atOrBelow.prototype.isValid = function(value, cb){
  
  if(!value) return cb(true);

  if(value > this.limit) return cb(false);
  cb(true);
};

atOrBelow.load = function(params){
    
  var defer = Q.defer();
  var first = params[0];

  if(typeof first != 'number'){
    defer.reject(first + ' is not a number');

  }else{
    
    first = parseInt(first);
    var validator = new atOrBelow(first);
    defer.resolve(validator);
  }

  return defer.resolve;
};

},{"./base":12,"q":2}],11:[function(require,module,exports){
var Base = require('./base');

var atOrOver = function(limit){

  this.limit = limit
  this.msg  = 'Valor inferior ao limite de ' + this.limit;
};
atOrOver.prototype = new Base;
atOrOver.prototype.constructor = atOrOver;
module.exports = atOrOver;

atOrOver.prototype.isValid = function(value, cb){

  if(!value) return cb(true);

  if(value < this.limit) return cb(false);
  cb(true);
};

},{"./base":12}],12:[function(require,module,exports){
var Base = require('../base');

var base = function(){};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;


},{"../base":4}],13:[function(require,module,exports){
var Checked = function(elements){

  console.log('DEPRECIED!');

  this.elements = elements;
  this.msg = 'Selecione um dos campos';
};
module.exports = Checked;

Checked.prototype.isValid = function(value, cb){

    var res = false;
    if(this.elements.filter(':checked').size() == 1) res = true;

    cb(res);
};

},{}],14:[function(require,module,exports){
var Container = function(){
  
  console.log('DEPRECIED!');

    this.elements = [];
};
module.exports = Container;

Container.prototype.append = function(element){

    this.elements.push(element);
};

Container.prototype.isValid = function(cb, obj){

  var promises = [];
  for(var e in this.elements){
      var element = this.elements[e];
      var def = new $.Deferred(function(def){
          element.isValid(function(res){ def.resolve(res); }, obj);
      });
      promises.push(def);
  }

  $.when.apply(undefined, promises).promise().done(function(){

      var args = Array.prototype.slice.call(arguments);
      cb(args.indexOf(false) < 0);
  });
};

Container.prototype.getValues = function(){

  var values = {};
  for(var e in this.elements){
    var element = this.elements[e];
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name)  values[name] = element.getValue();
  }

  return values;
};

},{}],15:[function(require,module,exports){
var Base = require('./base');

var dateAtOrBelow = function(date){

  this.date = date;
  this.msg  = 'Data futura inválida';
};
dateAtOrBelow.prototype = new Base;
dateAtOrBelow.prototype.constructor = dateAtOrBelow;
module.exports = dateAtOrBelow;

dateAtOrBelow.prototype.isValid = function(value, cb){

  var value = value instanceof Date ? value : new Date(value.split('-'));
  if(value.getTime() > this.date.getTime()) return cb(false);
  cb(true);
};

/* Params ex: [-365] => 1 year ago or below
              [01/01/2018] => 01/01/2018 or below
*/
dateAtOrBelow.load = function(params){

  var defer = Q.defer();
  var first = params[0];
  var date  = new Date();

  if(!!first){
    
    if(typeof first == 'number'){
    
      first    = parseInt(first);
      date.setDate(date.getDate() + first);

    }else{
    
      date = new Date(first.replace(/-/g, '/'));
    }
  }

  var validator = new dateAtOrBelow(date);
  defer.resolve(date);

  return defer.promise;
};

},{"./base":12}],16:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var dateAtOrOver = function(date){

  this.date = !!date ? date : new Date();
  this.msg  = 'A data deve ser igual ou superior a {0}'.format(date.toLocaleDateString());
};
dateAtOrOver.prototype = new Base;
dateAtOrOver.prototype.constructor = dateAtOrOver;
module.exports = dateAtOrOver;

dateAtOrOver.prototype.isValid = function(value, cb){

  var value = value instanceof Date ? value : new Date(value.replace(/-/g, '/'));
  var clone = new Date(this.date);
  clone.setDate(clone.getDate() - 1)
  if(value.getTime() > clone.getTime()) return cb(true);
  cb(false);
};

/* Params ex: [-365] => 1 year ago or over 
              [01/01/2018] => 01/01/2018 or over
*/
dateAtOrOver.load = function(params){

  var defer = Q.defer();
  var first = params[0];
  var date  = new Date();

  if(!!first){
    
    if(typeof first == 'number'){
    
      first    = parseInt(first);
      date.setDate(date.getDate() + first);

    }else{
    
      date = new Date(first.replace(/-/g, '/'));
    }
  }

  var validator = new dateAtOrOver(date);
  defer.resolve(date);

  return defer.promise;
};

},{"./base":12,"q":2}],17:[function(require,module,exports){
var Decorator = function(element, msg) {

    if(element.validators) return element;

    element.validators = [];
    element.filters    = [];

    if(!element.name) element.name = element.attr('name');

    element.addValidator = function(validator){
        element.validators.push(validator);
    };

    element.addFilter = function(filter){
        element.filter.push(filter);
    };

    element.getValue = function(){

        var value = element.val().trim();
        for(var f in element.filters){

          var filter = element.filters[f];
          var value  = filter.filter(value);
        }

        return value;
    };

    element.isValid = function(cb, obj) {

        var self = element;
        var res = true;
        var promises = [];
        var value = element.getValue();
        if (msg) msg.text('');
        element.removeClass('invalid');

        for(var v in element.validators){
            var validator = element.validators[v];
            var def = new $.Deferred(function(def) {
                validator.isValid(value, function(res) {
                    if (!res && msg) {
                        msg.text(validator.msg);
                        if(!!element.addClass) element.addClass('invalid');
                    }
                    def.resolve(res);
                }, obj);
            });
            promises.push(def);
        }


        $.when.apply(undefined, promises).promise().done(function() {

            var args = Array.prototype.slice.call(arguments);
            if (args.indexOf(false) >= 0) {
                cb(false);
            } else {
                cb(true);
            }
        });
    };

    return element;
};

module.exports = Decorator;

},{}],18:[function(require,module,exports){
module.exports = {
  'Container':         require('./container'),
  'Decorator':         require('./decorator'),
  'Checked':           require('./checked'),
  'NotEmpty':          require('./notEmpty'),
  'NotEmptyDependent': require('./notEmptyDependent'),
  'DateAtOrBelow':     require('./dateAtOrBelow'),
  'DateAtOrOver':      require('./dateAtOrOver'),
  'AtOrBelow':         require('./AtOrBelow'),
  'AtOrOver':          require('./AtOrOver'),
};

},{"./AtOrBelow":10,"./AtOrOver":11,"./checked":13,"./container":14,"./dateAtOrBelow":15,"./dateAtOrOver":16,"./decorator":17,"./notEmpty":19,"./notEmptyDependent":20}],19:[function(require,module,exports){
var Base = require('./base');

var NotEmpty = function(){

    this.msg = 'Campo obrigatório';
};
NotEmpty.prototype = new Base;
NotEmpty.prototype.constructor = NotEmpty;
module.exports = NotEmpty;

NotEmpty.prototype.isValid = function(value, cb){

    var value = typeof(value) == 'string' ? value.trim() : value;
    if(value === null || value == undefined || value == ''){
        return cb(false);
    }

    return cb(true);
};

},{"./base":12}],20:[function(require,module,exports){
var Base = require('./base');

var NotEmptyDependent = function(dep){

  this.dependent = dep;
  this.msg = 'Campo obrigatório';
};
NotEmptyDependent.prototype = new Base;
NotEmptyDependent.prototype.constructor = NotEmptyDependent;
module.exports = NotEmptyDependent;

NotEmptyDependent.prototype.isValid = function(value, cb){

  if(value == ''){
      var dep = this.dependent.val();
      if(dep != '') return cb(false);
  }

  return cb(true);
};

},{"./base":12}],21:[function(require,module,exports){
var Base = require('../base');
var Q    = require('q');

var CE = function(tag){

  var element = $(document.createElement(tag));
  for(var i = 1; i < arguments.length; i++){
      element.addClass(arguments[i]);
  }
  return element;
};
window.CE = CE;

var base = function(C){
  
  Base.call(this);

  this.C = C; //Controller
  this.container = CE('div', 'box');

  this.pre_make = [];
  this.pos_make = [];
};
base.prototype = new Base;
base.prototype.constructor = base;

base.prototype.toString = function(){
  return this.container.html();
};

base.prototype.render = function(){

  var self  = this;
  var defer = Q.defer();
  this.container.html('');

  var pre_promises = [];
  var pos_promises = [];

  var onmake = function(){

    for(var k in self.pos_make){
      var pos_function = self.pos_make[k];
      (function(func, ctx){ 

        var resp = func.call(ctx);
        if(typeof(resp) == 'object') pos_promises.push(resp);
      
      })(pos_function, self);
    }

    Q.all(pos_promises).then(function(){
      defer.resolve(self.container);
    }, console.log).done();
  }

  var onpre = function(){ self.make().then(onmake, console.log).done(); };

  for(var k in this.pre_make){
    var pre_function = this.pre_make[k];
    var resp = pre_function.call(self);
    if(typeof(resp) == 'object') pre_promises.push(resp);
  }
  Q.all(pre_promises).then(onpre, console.log).done();

  return defer.promise;
};

module.exports = base;

},{"../base":4,"q":2}],22:[function(require,module,exports){
var Base = require('../base');
var Q    = require('q');

var base = function(name){

  Base.call(this);

  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');

  this.container_child = null;

	this.label     = null;
	this.inputs    = null;
	this.title     = null;
	this.message   = null;
	this.value     = '';

  this.pre_make  = [];
  this.pos_make  = [];

  this.validators = [];
  this.filters    = [];

  this._title    = '';
  this._edit     = true;
  this._make     = false;

  this.forced       = null; //Force validation

  this._initChildren();
  this._children = [];
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

base.prototype._initChildren = function(){

  var self = this;

  this.child_container = this.child_container = CE('div', 'box');

  this.pos_make.push(function(){

    var def = Q.defer();

    self.child_container.html('');
    self.container.after(self.child_container);
  
    def.resolve();
    return def.promise;
  });
};

base.prototype.removeChildren = function(){

  var self  = this;
  var defer = Q.defer();
  
  this.child_container.fadeOut(function(){
    
    self._children = [];
    self.child_container.html('');
    self.child_container.show();
    defer.resolve();
  });

  return defer.promise;
};

base.prototype.append = function(field){

  if(field instanceof base){

    this._children.push(field);
    field.container.hide();
    this.child_container.append(field.container);
    field.container.fadeIn();

  }else{
    
    field.hide();
    this.child_container.appned(field);
    field.fadeIn();
  }
};

base.prototype.edit = function(flag){
   
  this._edit = flag;
};

base.prototype.addValidator = function(validator){
  this.validators.push(validator);
};

base.prototype.addFilter = function(filter){
  this.filter.push(filter);
};

base.prototype.setTitle = function(title){
  this._title = title;
  if(this.title) this.title.text(title);
};

base.prototype.getValue = function(){

  var value = this.value;
  for(var f in this.filters){
    var filter = this.filters[f];
    var value  = filter.filter(value);
  }

  return value;
};

base.prototype.onisvalid = function(res){};

base.prototype.forceValid = function(res, message){

  if(res == null){
    this.forced = null;
    return;
  }

  this.forced = [res, message];
};

base.prototype.isValid = function(cb, obj) {

  var self = this;
  var res = true;
  var promises = [];
  var value = this.getValue();

  self.message.text('');
  this.container.removeClass('invalid');

  if(!!this.forced){
    this.message.text(this.forced[1]);
    this.container.addClass('invalid');
    return cb(this.forced[0]);
  }

  for(var v in this.validators){
    var validator = this.validators[v];
    var def = Q.defer();
    promises.push(def.promise);
    (function($validator, $def, $obj){
      $validator.isValid(value, function(res) {
        if(!res){
          self.message.text($validator.msg);
          self.container.addClass('invalid');
        }
        $def.resolve(res);
      }, $obj);
    
    })(validator, def, obj);
  }

  //child validations
  for(var d in this._children){
    var child = this._children[d];
    var def = Q.defer();
    promises.push(def.promise);
    (function($child, $def, $obj){

      $child.isValid($def.resolve, $def.reject, $obj);

    })(child, def, obj);
  }

  Q.all(promises).then(function(data){
   
    var args = Array.prototype.slice.call(data);
    if (args.indexOf(false) >= 0) {
      self.onisvalid(false);
      cb(false);
    }else{
      self.onisvalid(true);
      cb(true);
    }
  });
};

base.prototype.getValues = function(){

  var values = {};

  var value  = this.val();
  values[this.name] = typeof value == 'string' ? value.trim() : value;

  for(var d in this._children){
    var child = this._children[d];
    values = Object.assign(values, child.getValues());
  }

  return values;
};

base.prototype.makeShow = function(){

  var self = this;
  this.inputs.html('');

  var value = !!this.value ? this.value : '---';

  if(value instanceof Date){
    value = value.getDisplay();
  }

  var span = CE('span', 'input_area');
  span.css({'paddin-top': '6px'});
  span.text(value);

  this.inputs.append(span);
};

base.prototype.make = function(){
  
  this.container.html('');
  var defer = Q.defer();

  if(!!this._title){
    this.title = CE('span', 'wdl');
    this.title.text(this._title);
    this.container.append(this.title);
  }

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    if(this._make) this.makeInputs();
  }
};

base.prototype.clear = function(){

  self.val('');
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };
base.prototype.onchange    = function(){ /*for overwrite*/ };

},{"../base":21,"q":2}],23:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);

  this.container = CE('div', 'item item-icon-right');
  this.container.css({'white-space': 'normal'});
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  //checkbox not have message
  this.message = CE('span', 'wdl', 'error');

  this.inputs = CE('span', 'item-checkbox');
  this.container.append(this.inputs);
  this.makeInputs();

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  var label = CE('label', 'checkbox');
  this.inputs.append(label);

  var value = !!this.value;

  if(this._edit){

    var input = CE('input').attr({'type': 'checkbox', name: this.name}).css({'float': 'right'});
    if(value) input.attr('checked', 'checked');
    input.click(function(){ self.value = $(this).is(':checked'); });
    label.append(input);
  }else{
   
    var span = CE('span', 'material-icons wdr');
    if(value) span.html('&#xE5CA;');
    label.append(span);
  }
}

},{"./base":22,"q":2}],24:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  var defer = Q.defer();
  this.container.html('');

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box', 'dateContainer');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self  = this;
  
  this.inputs.off('focusout');
  this.inputs.html('');
 
  var day   = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "31", min: "1", placeholder: 'dd'});
  var month = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "12", min: "1", placeholder: 'mm'});
  var year  = CE('input', 'wdl').attr({'type': 'number', maxlength: "4", max: "9999", min: "1", placeholder: 'aaaa'});

  if(!this._edit){
    day.attr('disabled', 'disabled');
    month.attr('disabled', 'disabled');
    year.attr('disabled', 'disabled');
  }

  this.inputs.append(day);
  this.inputs.append(CE('span', 'wdl').text('/'));
  this.inputs.append(month);
  this.inputs.append(CE('span', 'wdl').text('/'));
  this.inputs.append(year);

  day.keyup(function(e){
  
    var value = day.val();
    if(value.length > 1) month.focus();

  }).focusout(function(e){
  
    var value = day.val().trim();
    if(value == '0') return day.val('');
    if(value.length == 1){
      day.val('0' + value);
    }
  });

  month.keyup(function(e){
  
    var value = month.val().trim();
    if(value.length > 1) return year.focus();
    if(value.length === 0) return day.focus().select();

  }).focusout(function(e){
  
    var value = month.val().trim();
    if(value == '0') return month.val('');
    if(value.length == 1){
      month.val('0' + value);
    }
  });

  year.keyup(function(e){
    
    var value = year.val();
    if(value.length > 4) return year.val(value.substr(0,4));
    if(value.length === 0) return month.focus().select();
  });

  if(!!this.value){
    
    if(this.value instanceof Date){
      day.val(this.value.getDate());
      day.trigger('focusout');

      month.val(this.value.getMonth() + 1);
      month.trigger('focusout');

      year.val(this.value.getFullYear());
      year.trigger('focusout');
    }
  };

  this.inputs.on('keyup', function(e){

    var $this   = $(this);
    var v_day   = day.val().trim();
    var v_month = month.val().trim();
    var v_year  = year.val().trim();

    if(v_year.length != 4) v_year = '';
    if(v_day !== '' && v_month !== '' && year !== ''){

      var date = new Date(v_year, v_month - 1, v_day);
      var check = date.getFullYear() == v_year && date.getMonth() + 1 == v_month && date.getDate() == v_day;
      if(check){
        self.value = date;
        self.inputs.removeClass('wrong');
        return;
      }
    }

    self.value = '';
    self.inputs.addClass('wrong');
  });

  self.inputs.find('input').on('change', function(e){

    var that  = $(this);
    
    var value = that.val().trim();
    var max   = that.attr('maxlength');
    if(value.length > max){
        that.val(value.substring(0, max));
    }
  });
};

},{"./base":22,"q":2}],25:[function(require,module,exports){
module.exports = {
  'Base':          require('./base'),
  'Radio':         require('./radio'),
  'Phone':         require('./phone'),
  'Text':          require('./text'),
  'Date':          require('./date'),
  'Numeric':       require('./numeric'),
  'Checkbox':      require('./checkbox'),
  'Select':        require('./select'),
  'TextMultiRow':  require('./textMultiRow'),
};

},{"./base":22,"./checkbox":23,"./date":24,"./numeric":26,"./phone":27,"./radio":28,"./select":29,"./text":30,"./textMultiRow":31}],26:[function(require,module,exports){
var Base = require('./base');

var view = function(name, decimal){

  Base.call(this, name);

  this.decimal = !!decimal ? decimal : 2;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.step = function(){

  var step = '.';
  for(var i = 1; i < this.decimal; i++){
    step += '0';
  }
  step += '1';
  return step;
};

view.prototype.getValue = function(){

  var value = Base.prototype.getValue.call(this);
  if(typeof value == "string"){
    value = value.replace(',', '.');
  }

  return !!value ? parseFloat(value) : null;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  var input = CE('input').attr({'type': 'number', 'step': this.step(), 'min': 0, 'max': 10, name: this.name});
  this.inputs.append(input);

  if(!!this.value) input.val(this.value.formatMoney(self.decimal, '.', ''));
  if(!this._edit)  input.attr('disabled', 'disabled');

  input.keyup(function(e){
      var $this  = $(this);
      var value = $this.val();
      var value  = value.replace('.','');
      var value  = parseInt(value);
      self.value = (value/Math.pow(10, self.decimal)).formatMoney(self.decimal, '.', '');
      $this.val(self.value);

  }).focusout(function(e){
      var $this = $(this);
      var value = $this.val().replace('.','');
      var value = parseInt(value);
      if(value == 0){
        self.value = null; 
        $this.val('');
      }
  });
}



},{"./base":22}],27:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  Base.call(this, name);
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  this.phone = CE('input').attr('type', 'tel');
  this.phone.keyup(function(e){ 

    var $this = $(this);
    var val   = $this.val();

    if(e.keyCode == 8 || e.keyCode == 229){
      val = '';
    }

    var value = self.format.call(self, val); 
    $this.val(value);
  });


  if(!!this.value) this.phone.val(this.format(this.value));
  if(!this._edit)  this.phone.attr('disabled', 'disabled');

  this.inputs.append(this.phone);
};

view.prototype.format = function(value){

  this.value = this.filter(value).slice(0, 11);
  var len    = this.value.length;
  var resp   = '(';

  resp += this.value.slice(0, 2);
  
  if(len < 2) return resp;

  resp += ') ';

  var rest = 11 - len;
  for(var i = 0; i < rest; i++){
    if(i == 0){
      resp += ' ';
    }else{
      resp += '_';
    }
  }

  if(len > 6){
  
    resp += this.value.slice(2, (len-6)+2);
    resp += '-';
    resp += this.value.slice((len-6)+2, 11);
  }else{
  
    resp += this.value.slice(2, 6);
  }

  return resp;
};

view.prototype.filter = function(value){

  var regex = /\d+/g;
  var match = value.match(regex);

  if(!!match) return match.join('');
  return '';
};


},{"./base":22}],28:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
  this.list = [];

  this.container = CE('div', 'box');
  this.label     = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){
  
  this.container.html('');
  var defer = Q.defer();

  if(!!this._title){

    this.label = CE('label', 'item', 'item-input', 'item-stacked-label');
    this.container.append(this.label);

    this.title = CE('span', 'wdl');
    this.title.text(this._title);
    this.label.append(this.title);
  }

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var input = CE('input').attr({type: 'radio', name: this.name, value: key});
    if(!this._edit) input.attr('disabled', 'disabled');
    input.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.inputs.append(CE('label', 'item').text(label).append(input));

    if(this.value == key) input.attr('checked', 'checked');
  }

  this.inputs.change(function(e){ self.value = self.container.find(':checked').val(); self.onchange.call(self, e); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":22,"q":2}],29:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){

  Base.call(this, name);
  this.list      = [];
  this.container = CE('label', 'item', 'item-select');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('select');
  if(!this._edit)  this.inputs.attr('disabled', 'disabled');
  this.makeInputs();
  this.container.append(this.inputs);

  this._make = true;

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self = this;

  this.inputs.html('');
  this.inputs.off('change');
  
  var option = CE('option').css({'display': 'none'}).val('');
  this.inputs.append(option);

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var option = CE('option').val(key).text(label);
    this.inputs.append(option);

    if(this.value == key) option.attr('selected', 'selected');
  }

  this.inputs.on('change', function(){ self.value = self.container.find(':selected').val(); self.onchange.call(self, self.value); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":22,"q":2}],30:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  Base.call(this, name);

  this.maxlength = null;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setMaxlenght = function(size){

  this.maxlength = size;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  var input = CE('input').attr({'type': 'text', name: this.name});

  if(!!this.maxlength){
    input.attr('maxlength', this.maxlength);
  }else{
    input.removeAttr('maxlength');
  }

  if(!!this.value) input.val(this.value);
  if(!this._edit)  input.attr('disabled', 'disabled');
  input.keyup(function(e){ self.value = input.val(); self.keyup.call(self, e); });
  this.inputs.append(input);
};

view.prototype.keyup = function(){};

},{"./base":22}],31:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  Base.call(this, name);
  this.list      = [];
  this.sequence  = 0;
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var self = this;

  var div = CE('div', 'form-group');
  var label = CE('label').text(this.title);
  div.append(label);

  this.input = CE('input', 'form-control').attr({type: 'text'});
  this.input.focusout(function(){ self.add.call(self); });
  div.append(this.input);

  this.list = CE('div', 'box');
  div.append(this.list);

  this.output = CE('input').attr({type: 'hidden', name: this.name});
  div.append(this.output);

  return div;
};

view.prototype.add = function(){

  var found = false;

  var text  = this.input.val().trim();
  if(text == '') return;

  var rowid = parseInt(this.input.attr('rowid'));

  if(isNaN(rowid)) rowid = --this.sequence;

  var values = this.getValues();
  for(var v in values){
    var value = values[v];
    if(value.id == rowid){
      found = true;
      values[v].value = text;
      break;
    }
  }

  if(!found){
    values.push({id: rowid, value: text});
  }

  this.setValues(values);
  this.refresh(values);
  this.clear_input();
  this.input.focus();
};

view.prototype.clear_input = function(){
  this.input.val('');
  this.input.attr('rowid', '');
};

view.prototype.refresh = function(values){

  var self = this;

  this.list.html('');
  var div = CE('div', 'box').css({'border': '1px solid #ccc', 'margin-top': '5px'});
  this.list.append(div);

  var values = !!values ? values : this.getValues();

  if(values.length == 0){
    div.remove();
    return;
  }

  for(var v in values){
    var value = values[v];
    var row   = CE('div', 'box').css({'border-bottom': '1px solid #ccc', 'padding': '5px'}).attr('rowid', value.id);
    div.append(row);
    var text  = CE('span', 'left').text(value.value);
    row.append(text);

    (function(value){

      var del  = CE('button', 'btn', 'btn-danger', 'btn-xs', 'right').attr({type: 'button'}).text('Apagar');
      del.click(function(){ self.delete.call(self, value.id) });
      row.append(del);

      var edit = CE('button', 'btn', 'btn-warning', 'btn-xs', 'right').attr({type: 'button'}).text('Editar');
      edit.click(function(){ self.edit.call(self, value.id) });
      row.append(edit);

    })(value);
  };
};

view.prototype.edit = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){
      self.input.val(value.value);
      self.input.attr('rowid', value.id);
      break;
    }
  }
};

view.prototype.delete = function(id){

  var values = this.getValues();
  var self   = this;

  for(var v in values){
    var value = values[v];
    if(value.id == id){

      values.splice(v, 1);
      break;
    }
  }

  this.setValues(values);
  this.refresh();
};

view.prototype.getValues = function(){

  var json_data = this.output.val();
  if(json_data == '') json_data = '[]';
  return JSON.parse(json_data);
};

view.prototype.setValues = function(values){

  var json_data = JSON.stringify(values);
  this.output.val(json_data);
};

},{"./base":22}],32:[function(require,module,exports){
module.exports = {
  'Base':   require('./base'),
  'Modal':  require('./modal'),
  'field':  require('./field/index'),
  'modal':  require('./modal/index'),
};

},{"./base":21,"./field/index":25,"./modal":33,"./modal/index":36}],33:[function(require,module,exports){
var Base = require('./modal/base');
var Q    = require('q');

var modal = function(){

  Base.call(this);

  this._title        = '';
  this._body         = null;
  this._left_button  = null;
  this._right_button = null;
};
modal.prototype = new Base;
modal.prototype.constructor = modal;
module.exports = modal;


modal.prototype.setBody = function(body){

  this._body = body;
};

modal.prototype.setLeftButton = function(button){
  
  this._left_button = button;
};

modal.prototype.setRightButton = function(button){

  this._right_button = button;
};

modal.prototype.setTitle = function(title){

  this._title = title;
};

modal.prototype.make = function(){
  
  var self = this;
  var def  = Q.defer();

  Base.prototype.make.call(this).then(function(){
  
    var hasHeader = !!self._title || !!self._left_button || !!self._right_button;
    if(hasHeader){
      var header = CE('div', 'bar bar-header');
      self.modal.append(header);

      if(!!self._left_button) header.append(self._left_button);
      if(!!self._title){
        var title = CE('h1', 'title title-left');
        header.append(title);
        title.text(self._title);
        if(!!self._left_button)  title.css('left', '92px');
        if(!!self._right_button) title.css('right', '92px');
      }
      if(!!self._right_button) header.append(self._right_button);
    }

    var content = CE('div', 'scroll-content ionic-scroll overflow-scroll');
    if(hasHeader) content.addClass('has-header');
    self.modal.append(content);
    content.append(self._body);

    def.resolve();
  });

  return def.promise;
};


},{"./modal/base":34,"q":2}],34:[function(require,module,exports){
var Base = require('../base');
var back = require('../../back');
var Q    = require('q');

var base = function(){

  Base.call(this);

  this.MODAL_PRIORITY = back.MODAL;
  this.container      = CE('div', 'modal-backdrop active');
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

base.prototype.make = function(){

  var self  = this;
  var defer = Q.defer();

  var wrapper = CE('div', 'modal-wrapper');
  this.container.append(wrapper);

  this.modal = CE('div', 'modal slide-in-left');
  wrapper.append(this.modal);

  back.add(this.MODAL_PRIORITY, function(){ self.back.call(self); });

  defer.resolve();
  return defer.promise;
};

base.prototype.show = function(){

  var self = this;
  var def  = Q.defer();

  this.render().then(function(){
    $('body').append(self.container);
    def.resolve();
  });

  return def.promise;
};

base.prototype.remove = function(){

  back.remove(this.MODAL_PRIORITY);
  this.container.remove();
};

base.prototype.back = function(){
  
  this.remove();
};

},{"../../back":3,"../base":21,"q":2}],35:[function(require,module,exports){
var Popup = require('./popup');
var back  = require('../../back');
var Q     = require('q');

var dialog = function(){

  Popup.call(this);

  this.MODAL_PRIORITY = back.DIALOG;
  this.container = CE('div', 'popup-container popup-showing active');
  this.container.css({'background-color': 'rgba(0, 0, 0, 0.4)'});

  this._title  = '';
  this._body   = '';
  this.buttons = [];
};
dialog.prototype = new Popup;
dialog.prototype.constructor = dialog;
module.exports = dialog;

dialog.prototype.make = function(){

  var self = this;
  var def  = Q.defer();

  back.add(this.MODAL_PRIORITY, function(){ self.back.call(self); });

  var popup = CE('div', 'popup').css({'background-color': '#fff'});
  this.container.append(popup);

  if(!!this._title){
    var head = CE('div', 'popup-head');
    popup.append(head);
    head.append(CE('h3', 'popup-title').text(this._title));
  }

  var body = CE('div', 'popup-body');
  popup.append(body);
  body.append(CE('span').text(this._body));

  if(!!this.buttons.length){
  
    var buttons = CE('div', 'popup-buttons');
    popup.append(buttons);
    for(var b in this.buttons) buttons.append(this.buttons[b]);
  }

  def.resolve();
  return def.promise;
};


},{"../../back":3,"./popup":37,"q":2}],36:[function(require,module,exports){
module.exports = {
  'Base':   require('./base'),
  'Dialog': require('./dialog'),
  'Popup':  require('./popup'),
}

},{"./base":34,"./dialog":35,"./popup":37}],37:[function(require,module,exports){
var Base = require('./base');
var back = require('../../back');
var Q    = require('q');

var popup = function(){

  Base.call(this);

  this.MODAL_PRIORITY = back.DIALOG;
  this.container = CE('div', 'popup-container popup-showing active');
  this.container.css({'background-color': 'rgba(0, 0, 0, 0.4)'});

  this._title  = '';
  this._body   = '';
  this.buttons = [];
};
popup.prototype = new Base;
popup.prototype.constructor = popup;
module.exports = popup;

popup.prototype.setTitle = function(title){

  this._title = title;
};

popup.prototype.setBody = function(body){

  this._body = body;
};

popup.prototype.addButton = function(button){

  var self = this;
  button.click(function(){ self.remove.call(self) });
  this.buttons.push(button);
};

popup.prototype.make = function(){

  var self = this;
  var def  = Q.defer();

  back.add(this.MODAL_PRIORITY, function(){ self.back.call(self); });

  var popup = CE('div', 'popup').css({'background-color': '#fff'});
  this.container.append(popup);

  if(!!this._title){
    var head = CE('div', 'popup-head');
    popup.append(head);
    head.append(CE('h3', 'popup-title').text(this._title));
  }

  var body = CE('div', 'popup-body');
  body.append(this._body);
  popup.append(body);

  if(!!this.buttons.length){
  
    var buttons = CE('div', 'popup-buttons');
    popup.append(buttons);
    for(var b in this.buttons) buttons.append(this.buttons[b]);
  }

  def.resolve();
  return def.promise;
};


},{"../../back":3,"./base":34,"q":2}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3EvcS5qcyIsInNyYy9iYWNrLmpzIiwic3JjL2Jhc2UuanMiLCJzcmMvY29udHJvbGxlci5qcyIsInNyYy9mb3JtLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3BsdWdpbnMvZGF0ZS5qcyIsInNyYy9wbHVnaW5zL2luZGV4LmpzIiwic3JjL3ZhbGlkYXRlL0F0T3JCZWxvdy5qcyIsInNyYy92YWxpZGF0ZS9BdE9yT3Zlci5qcyIsInNyYy92YWxpZGF0ZS9iYXNlLmpzIiwic3JjL3ZhbGlkYXRlL2NoZWNrZWQuanMiLCJzcmMvdmFsaWRhdGUvY29udGFpbmVyLmpzIiwic3JjL3ZhbGlkYXRlL2RhdGVBdE9yQmVsb3cuanMiLCJzcmMvdmFsaWRhdGUvZGF0ZUF0T3JPdmVyLmpzIiwic3JjL3ZhbGlkYXRlL2RlY29yYXRvci5qcyIsInNyYy92YWxpZGF0ZS9pbmRleC5qcyIsInNyYy92YWxpZGF0ZS9ub3RFbXB0eS5qcyIsInNyYy92YWxpZGF0ZS9ub3RFbXB0eURlcGVuZGVudC5qcyIsInNyYy92aWV3L2Jhc2UuanMiLCJzcmMvdmlldy9maWVsZC9iYXNlLmpzIiwic3JjL3ZpZXcvZmllbGQvY2hlY2tib3guanMiLCJzcmMvdmlldy9maWVsZC9kYXRlLmpzIiwic3JjL3ZpZXcvZmllbGQvaW5kZXguanMiLCJzcmMvdmlldy9maWVsZC9udW1lcmljLmpzIiwic3JjL3ZpZXcvZmllbGQvcGhvbmUuanMiLCJzcmMvdmlldy9maWVsZC9yYWRpby5qcyIsInNyYy92aWV3L2ZpZWxkL3NlbGVjdC5qcyIsInNyYy92aWV3L2ZpZWxkL3RleHQuanMiLCJzcmMvdmlldy9maWVsZC90ZXh0TXVsdGlSb3cuanMiLCJzcmMvdmlldy9pbmRleC5qcyIsInNyYy92aWV3L21vZGFsLmpzIiwic3JjL3ZpZXcvbW9kYWwvYmFzZS5qcyIsInNyYy92aWV3L21vZGFsL2RpYWxvZy5qcyIsInNyYy92aWV3L21vZGFsL2luZGV4LmpzIiwic3JjL3ZpZXcvbW9kYWwvcG9wdXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6aEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5c0JBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvLyB2aW06dHM9NDpzdHM9NDpzdz00OlxuLyohXG4gKlxuICogQ29weXJpZ2h0IDIwMDktMjAxNyBLcmlzIEtvd2FsIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUXG4gKiBsaWNlbnNlIGZvdW5kIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9rcmlza293YWwvcS9ibG9iL3YxL0xJQ0VOU0VcbiAqXG4gKiBXaXRoIHBhcnRzIGJ5IFR5bGVyIENsb3NlXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDA5IFR5bGVyIENsb3NlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgTUlUIFggbGljZW5zZSBmb3VuZFxuICogYXQgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5odG1sXG4gKiBGb3JrZWQgYXQgcmVmX3NlbmQuanMgdmVyc2lvbjogMjAwOS0wNS0xMVxuICpcbiAqIFdpdGggcGFydHMgYnkgTWFyayBNaWxsZXJcbiAqIENvcHlyaWdodCAoQykgMjAxMSBHb29nbGUgSW5jLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKGRlZmluaXRpb24pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFRoaXMgZmlsZSB3aWxsIGZ1bmN0aW9uIHByb3Blcmx5IGFzIGEgPHNjcmlwdD4gdGFnLCBvciBhIG1vZHVsZVxuICAgIC8vIHVzaW5nIENvbW1vbkpTIGFuZCBOb2RlSlMgb3IgUmVxdWlyZUpTIG1vZHVsZSBmb3JtYXRzLiAgSW5cbiAgICAvLyBDb21tb24vTm9kZS9SZXF1aXJlSlMsIHRoZSBtb2R1bGUgZXhwb3J0cyB0aGUgUSBBUEkgYW5kIHdoZW5cbiAgICAvLyBleGVjdXRlZCBhcyBhIHNpbXBsZSA8c2NyaXB0PiwgaXQgY3JlYXRlcyBhIFEgZ2xvYmFsIGluc3RlYWQuXG5cbiAgICAvLyBNb250YWdlIFJlcXVpcmVcbiAgICBpZiAodHlwZW9mIGJvb3RzdHJhcCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGJvb3RzdHJhcChcInByb21pc2VcIiwgZGVmaW5pdGlvbik7XG5cbiAgICAvLyBDb21tb25KU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblxuICAgIC8vIFJlcXVpcmVKU1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGRlZmluaXRpb24pO1xuXG4gICAgLy8gU0VTIChTZWN1cmUgRWNtYVNjcmlwdClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKCFzZXMub2soKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VzLm1ha2VRID0gZGVmaW5pdGlvbjtcbiAgICAgICAgfVxuXG4gICAgLy8gPHNjcmlwdD5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLy8gUHJlZmVyIHdpbmRvdyBvdmVyIHNlbGYgZm9yIGFkZC1vbiBzY3JpcHRzLiBVc2Ugc2VsZiBmb3JcbiAgICAgICAgLy8gbm9uLXdpbmRvd2VkIGNvbnRleHRzLlxuICAgICAgICB2YXIgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHNlbGY7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBgd2luZG93YCBvYmplY3QsIHNhdmUgdGhlIHByZXZpb3VzIFEgZ2xvYmFsXG4gICAgICAgIC8vIGFuZCBpbml0aWFsaXplIFEgYXMgYSBnbG9iYWwuXG4gICAgICAgIHZhciBwcmV2aW91c1EgPSBnbG9iYWwuUTtcbiAgICAgICAgZ2xvYmFsLlEgPSBkZWZpbml0aW9uKCk7XG5cbiAgICAgICAgLy8gQWRkIGEgbm9Db25mbGljdCBmdW5jdGlvbiBzbyBRIGNhbiBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICAgIC8vIGdsb2JhbCBuYW1lc3BhY2UuXG4gICAgICAgIGdsb2JhbC5RLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnbG9iYWwuUSA9IHByZXZpb3VzUTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBlbnZpcm9ubWVudCB3YXMgbm90IGFudGljaXBhdGVkIGJ5IFEuIFBsZWFzZSBmaWxlIGEgYnVnLlwiKTtcbiAgICB9XG5cbn0pKGZ1bmN0aW9uICgpIHtcblwidXNlIHN0cmljdFwiO1xuXG52YXIgaGFzU3RhY2tzID0gZmFsc2U7XG50cnkge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xufSBjYXRjaCAoZSkge1xuICAgIGhhc1N0YWNrcyA9ICEhZS5zdGFjaztcbn1cblxuLy8gQWxsIGNvZGUgYWZ0ZXIgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzIHJlcG9ydGVkXG4vLyBieSBRLlxudmFyIHFTdGFydGluZ0xpbmUgPSBjYXB0dXJlTGluZSgpO1xudmFyIHFGaWxlTmFtZTtcblxuLy8gc2hpbXNcblxuLy8gdXNlZCBmb3IgZmFsbGJhY2sgaW4gXCJhbGxSZXNvbHZlZFwiXG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4vLyBVc2UgdGhlIGZhc3Rlc3QgcG9zc2libGUgbWVhbnMgdG8gZXhlY3V0ZSBhIHRhc2sgaW4gYSBmdXR1cmUgdHVyblxuLy8gb2YgdGhlIGV2ZW50IGxvb3AuXG52YXIgbmV4dFRpY2sgPShmdW5jdGlvbiAoKSB7XG4gICAgLy8gbGlua2VkIGxpc3Qgb2YgdGFza3MgKHNpbmdsZSwgd2l0aCBoZWFkIG5vZGUpXG4gICAgdmFyIGhlYWQgPSB7dGFzazogdm9pZCAwLCBuZXh0OiBudWxsfTtcbiAgICB2YXIgdGFpbCA9IGhlYWQ7XG4gICAgdmFyIGZsdXNoaW5nID0gZmFsc2U7XG4gICAgdmFyIHJlcXVlc3RUaWNrID0gdm9pZCAwO1xuICAgIHZhciBpc05vZGVKUyA9IGZhbHNlO1xuICAgIC8vIHF1ZXVlIGZvciBsYXRlIHRhc2tzLCB1c2VkIGJ5IHVuaGFuZGxlZCByZWplY3Rpb24gdHJhY2tpbmdcbiAgICB2YXIgbGF0ZXJRdWV1ZSA9IFtdO1xuXG4gICAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgICAgIC8qIGpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xuICAgICAgICB2YXIgdGFzaywgZG9tYWluO1xuXG4gICAgICAgIHdoaWxlIChoZWFkLm5leHQpIHtcbiAgICAgICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgICAgICB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICAgICAgaGVhZC50YXNrID0gdm9pZCAwO1xuICAgICAgICAgICAgZG9tYWluID0gaGVhZC5kb21haW47XG5cbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pO1xuXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKGxhdGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXNrID0gbGF0ZXJRdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHJ1blNpbmdsZSh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICBmbHVzaGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBydW5zIGEgc2luZ2xlIGZ1bmN0aW9uIGluIHRoZSBhc3luYyBxdWV1ZVxuICAgIGZ1bmN0aW9uIHJ1blNpbmdsZSh0YXNrLCBkb21haW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5leHRUaWNrID0gZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgdGFpbCA9IHRhaWwubmV4dCA9IHtcbiAgICAgICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgICAgICBkb21haW46IGlzTm9kZUpTICYmIHByb2Nlc3MuZG9tYWluLFxuICAgICAgICAgICAgbmV4dDogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICghZmx1c2hpbmcpIHtcbiAgICAgICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHByb2Nlc3MudG9TdHJpbmcoKSA9PT0gXCJbb2JqZWN0IHByb2Nlc3NdXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgICAgICAvLyBFbnN1cmUgUSBpcyBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudCwgd2l0aCBhIGBwcm9jZXNzLm5leHRUaWNrYC5cbiAgICAgICAgLy8gVG8gc2VlIHRocm91Z2ggZmFrZSBOb2RlIGVudmlyb25tZW50czpcbiAgICAgICAgLy8gKiBNb2NoYSB0ZXN0IHJ1bm5lciAtIGV4cG9zZXMgYSBgcHJvY2Vzc2AgZ2xvYmFsIHdpdGhvdXQgYSBgbmV4dFRpY2tgXG4gICAgICAgIC8vICogQnJvd3NlcmlmeSAtIGV4cG9zZXMgYSBgcHJvY2Vzcy5uZXhUaWNrYCBmdW5jdGlvbiB0aGF0IHVzZXNcbiAgICAgICAgLy8gICBgc2V0VGltZW91dGAuIEluIHRoaXMgY2FzZSBgc2V0SW1tZWRpYXRlYCBpcyBwcmVmZXJyZWQgYmVjYXVzZVxuICAgICAgICAvLyAgICBpdCBpcyBmYXN0ZXIuIEJyb3dzZXJpZnkncyBgcHJvY2Vzcy50b1N0cmluZygpYCB5aWVsZHNcbiAgICAgICAgLy8gICBcIltvYmplY3QgT2JqZWN0XVwiLCB3aGlsZSBpbiBhIHJlYWwgTm9kZSBlbnZpcm9ubWVudFxuICAgICAgICAvLyAgIGBwcm9jZXNzLnRvU3RyaW5nKClgIHlpZWxkcyBcIltvYmplY3QgcHJvY2Vzc11cIi5cbiAgICAgICAgaXNOb2RlSlMgPSB0cnVlO1xuXG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgICAgIH07XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBJbiBJRTEwLCBOb2RlLmpzIDAuOSssIG9yIGh0dHBzOi8vZ2l0aHViLmNvbS9Ob2JsZUpTL3NldEltbWVkaWF0ZVxuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcmVxdWVzdFRpY2sgPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZShmbHVzaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAgICAgLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgICAgLy8gQXQgbGVhc3QgU2FmYXJpIFZlcnNpb24gNi4wLjUgKDg1MzYuMzAuMSkgaW50ZXJtaXR0ZW50bHkgY2Fubm90IGNyZWF0ZVxuICAgICAgICAvLyB3b3JraW5nIG1lc3NhZ2UgcG9ydHMgdGhlIGZpcnN0IHRpbWUgYSBwYWdlIGxvYWRzLlxuICAgICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RUaWNrID0gcmVxdWVzdFBvcnRUaWNrO1xuICAgICAgICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICAgICAgICAgIGZsdXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZXF1ZXN0UG9ydFRpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPcGVyYSByZXF1aXJlcyB1cyB0byBwcm92aWRlIGEgbWVzc2FnZSBwYXlsb2FkLCByZWdhcmRsZXNzIG9mXG4gICAgICAgICAgICAvLyB3aGV0aGVyIHdlIHVzZSBpdC5cbiAgICAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3RUaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICByZXF1ZXN0UG9ydFRpY2soKTtcbiAgICAgICAgfTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG9sZCBicm93c2Vyc1xuICAgICAgICByZXF1ZXN0VGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBydW5zIGEgdGFzayBhZnRlciBhbGwgb3RoZXIgdGFza3MgaGF2ZSBiZWVuIHJ1blxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGZvciB1bmhhbmRsZWQgcmVqZWN0aW9uIHRyYWNraW5nIHRoYXQgbmVlZHMgdG8gaGFwcGVuXG4gICAgLy8gYWZ0ZXIgYWxsIGB0aGVuYGQgdGFza3MgaGF2ZSBiZWVuIHJ1bi5cbiAgICBuZXh0VGljay5ydW5BZnRlciA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgIGxhdGVyUXVldWUucHVzaCh0YXNrKTtcbiAgICAgICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICAgICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdFRpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5leHRUaWNrO1xufSkoKTtcblxuLy8gQXR0ZW1wdCB0byBtYWtlIGdlbmVyaWNzIHNhZmUgaW4gdGhlIGZhY2Ugb2YgZG93bnN0cmVhbVxuLy8gbW9kaWZpY2F0aW9ucy5cbi8vIFRoZXJlIGlzIG5vIHNpdHVhdGlvbiB3aGVyZSB0aGlzIGlzIG5lY2Vzc2FyeS5cbi8vIElmIHlvdSBuZWVkIGEgc2VjdXJpdHkgZ3VhcmFudGVlLCB0aGVzZSBwcmltb3JkaWFscyBuZWVkIHRvIGJlXG4vLyBkZWVwbHkgZnJvemVuIGFueXdheSwgYW5kIGlmIHlvdSBkb27igJl0IG5lZWQgYSBzZWN1cml0eSBndWFyYW50ZWUsXG4vLyB0aGlzIGlzIGp1c3QgcGxhaW4gcGFyYW5vaWQuXG4vLyBIb3dldmVyLCB0aGlzICoqbWlnaHQqKiBoYXZlIHRoZSBuaWNlIHNpZGUtZWZmZWN0IG9mIHJlZHVjaW5nIHRoZSBzaXplIG9mXG4vLyB0aGUgbWluaWZpZWQgY29kZSBieSByZWR1Y2luZyB4LmNhbGwoKSB0byBtZXJlbHkgeCgpXG4vLyBTZWUgTWFyayBNaWxsZXLigJlzIGV4cGxhbmF0aW9uIG9mIHdoYXQgdGhpcyBkb2VzLlxuLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9Y29udmVudGlvbnM6c2FmZV9tZXRhX3Byb2dyYW1taW5nXG52YXIgY2FsbCA9IEZ1bmN0aW9uLmNhbGw7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGwuYXBwbHkoZiwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuLy8gVGhpcyBpcyBlcXVpdmFsZW50LCBidXQgc2xvd2VyOlxuLy8gdW5jdXJyeVRoaXMgPSBGdW5jdGlvbl9iaW5kLmJpbmQoRnVuY3Rpb25fYmluZC5jYWxsKTtcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3VuY3Vycnl0aGlzXG5cbnZhciBhcnJheV9zbGljZSA9IHVuY3VycnlUaGlzKEFycmF5LnByb3RvdHlwZS5zbGljZSk7XG5cbnZhciBhcnJheV9yZWR1Y2UgPSB1bmN1cnJ5VGhpcyhcbiAgICBBcnJheS5wcm90b3R5cGUucmVkdWNlIHx8IGZ1bmN0aW9uIChjYWxsYmFjaywgYmFzaXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICAvLyBjb25jZXJuaW5nIHRoZSBpbml0aWFsIHZhbHVlLCBpZiBvbmUgaXMgbm90IHByb3ZpZGVkXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBzZWVrIHRvIHRoZSBmaXJzdCB2YWx1ZSBpbiB0aGUgYXJyYXksIGFjY291bnRpbmdcbiAgICAgICAgICAgIC8vIGZvciB0aGUgcG9zc2liaWxpdHkgdGhhdCBpcyBpcyBhIHNwYXJzZSBhcnJheVxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2lzID0gdGhpc1tpbmRleCsrXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgrK2luZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoMSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVkdWNlXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgLy8gYWNjb3VudCBmb3IgdGhlIHBvc3NpYmlsaXR5IHRoYXQgdGhlIGFycmF5IGlzIHNwYXJzZVxuICAgICAgICAgICAgaWYgKGluZGV4IGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBiYXNpcyA9IGNhbGxiYWNrKGJhc2lzLCB0aGlzW2luZGV4XSwgaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiYXNpcztcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfaW5kZXhPZiA9IHVuY3VycnlUaGlzKFxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBub3QgYSB2ZXJ5IGdvb2Qgc2hpbSwgYnV0IGdvb2QgZW5vdWdoIGZvciBvdXIgb25lIHVzZSBvZiBpdFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG4pO1xuXG52YXIgYXJyYXlfbWFwID0gdW5jdXJyeVRoaXMoXG4gICAgQXJyYXkucHJvdG90eXBlLm1hcCB8fCBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNwKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbGxlY3QgPSBbXTtcbiAgICAgICAgYXJyYXlfcmVkdWNlKHNlbGYsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgY29sbGVjdC5wdXNoKGNhbGxiYWNrLmNhbGwodGhpc3AsIHZhbHVlLCBpbmRleCwgc2VsZikpO1xuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICByZXR1cm4gY29sbGVjdDtcbiAgICB9XG4pO1xuXG52YXIgb2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgIGZ1bmN0aW9uIFR5cGUoKSB7IH1cbiAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICByZXR1cm4gbmV3IFR5cGUoKTtcbn07XG5cbnZhciBvYmplY3RfZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkgfHwgZnVuY3Rpb24gKG9iaiwgcHJvcCwgZGVzY3JpcHRvcikge1xuICAgIG9ialtwcm9wXSA9IGRlc2NyaXB0b3IudmFsdWU7XG4gICAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBvYmplY3RfaGFzT3duUHJvcGVydHkgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcblxudmFyIG9iamVjdF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0X2hhc093blByb3BlcnR5KG9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgb2JqZWN0X3RvU3RyaW5nID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyk7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBPYmplY3QodmFsdWUpO1xufVxuXG4vLyBnZW5lcmF0b3IgcmVsYXRlZCBzaGltc1xuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgZnVuY3Rpb24gb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuZnVuY3Rpb24gaXNTdG9wSXRlcmF0aW9uKGV4Y2VwdGlvbikge1xuICAgIHJldHVybiAoXG4gICAgICAgIG9iamVjdF90b1N0cmluZyhleGNlcHRpb24pID09PSBcIltvYmplY3QgU3RvcEl0ZXJhdGlvbl1cIiB8fFxuICAgICAgICBleGNlcHRpb24gaW5zdGFuY2VvZiBRUmV0dXJuVmFsdWVcbiAgICApO1xufVxuXG4vLyBGSVhNRTogUmVtb3ZlIHRoaXMgaGVscGVyIGFuZCBRLnJldHVybiBvbmNlIEVTNiBnZW5lcmF0b3JzIGFyZSBpblxuLy8gU3BpZGVyTW9ua2V5LlxudmFyIFFSZXR1cm5WYWx1ZTtcbmlmICh0eXBlb2YgUmV0dXJuVmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBRUmV0dXJuVmFsdWUgPSBSZXR1cm5WYWx1ZTtcbn0gZWxzZSB7XG4gICAgUVJldHVyblZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB9O1xufVxuXG4vLyBsb25nIHN0YWNrIHRyYWNlc1xuXG52YXIgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgPSBcIkZyb20gcHJldmlvdXMgZXZlbnQ6XCI7XG5cbmZ1bmN0aW9uIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSkge1xuICAgIC8vIElmIHBvc3NpYmxlLCB0cmFuc2Zvcm0gdGhlIGVycm9yIHN0YWNrIHRyYWNlIGJ5IHJlbW92aW5nIE5vZGUgYW5kIFFcbiAgICAvLyBjcnVmdCwgdGhlbiBjb25jYXRlbmF0aW5nIHdpdGggdGhlIHN0YWNrIHRyYWNlIG9mIGBwcm9taXNlYC4gU2VlICM1Ny5cbiAgICBpZiAoaGFzU3RhY2tzICYmXG4gICAgICAgIHByb21pc2Uuc3RhY2sgJiZcbiAgICAgICAgdHlwZW9mIGVycm9yID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIGVycm9yICE9PSBudWxsICYmXG4gICAgICAgIGVycm9yLnN0YWNrXG4gICAgKSB7XG4gICAgICAgIHZhciBzdGFja3MgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCA9IHByb21pc2U7ICEhcDsgcCA9IHAuc291cmNlKSB7XG4gICAgICAgICAgICBpZiAocC5zdGFjayAmJiAoIWVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fIHx8IGVycm9yLl9fbWluaW11bVN0YWNrQ291bnRlcl9fID4gcC5zdGFja0NvdW50ZXIpKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0X2RlZmluZVByb3BlcnR5KGVycm9yLCBcIl9fbWluaW11bVN0YWNrQ291bnRlcl9fXCIsIHt2YWx1ZTogcC5zdGFja0NvdW50ZXIsIGNvbmZpZ3VyYWJsZTogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIHN0YWNrcy51bnNoaWZ0KHAuc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0YWNrcy51bnNoaWZ0KGVycm9yLnN0YWNrKTtcblxuICAgICAgICB2YXIgY29uY2F0ZWRTdGFja3MgPSBzdGFja3Muam9pbihcIlxcblwiICsgU1RBQ0tfSlVNUF9TRVBBUkFUT1IgKyBcIlxcblwiKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZmlsdGVyU3RhY2tTdHJpbmcoY29uY2F0ZWRTdGFja3MpO1xuICAgICAgICBvYmplY3RfZGVmaW5lUHJvcGVydHkoZXJyb3IsIFwic3RhY2tcIiwge3ZhbHVlOiBzdGFjaywgY29uZmlndXJhYmxlOiB0cnVlfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJTdGFja1N0cmluZyhzdGFja1N0cmluZykge1xuICAgIHZhciBsaW5lcyA9IHN0YWNrU3RyaW5nLnNwbGl0KFwiXFxuXCIpO1xuICAgIHZhciBkZXNpcmVkTGluZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbaV07XG5cbiAgICAgICAgaWYgKCFpc0ludGVybmFsRnJhbWUobGluZSkgJiYgIWlzTm9kZUZyYW1lKGxpbmUpICYmIGxpbmUpIHtcbiAgICAgICAgICAgIGRlc2lyZWRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZXNpcmVkTGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuZnVuY3Rpb24gaXNOb2RlRnJhbWUoc3RhY2tMaW5lKSB7XG4gICAgcmV0dXJuIHN0YWNrTGluZS5pbmRleE9mKFwiKG1vZHVsZS5qczpcIikgIT09IC0xIHx8XG4gICAgICAgICAgIHN0YWNrTGluZS5pbmRleE9mKFwiKG5vZGUuanM6XCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSkge1xuICAgIC8vIE5hbWVkIGZ1bmN0aW9uczogXCJhdCBmdW5jdGlvbk5hbWUgKGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyKVwiXG4gICAgLy8gSW4gSUUxMCBmdW5jdGlvbiBuYW1lIGNhbiBoYXZlIHNwYWNlcyAoXCJBbm9ueW1vdXMgZnVuY3Rpb25cIikgT19vXG4gICAgdmFyIGF0dGVtcHQxID0gL2F0IC4rIFxcKCguKyk6KFxcZCspOig/OlxcZCspXFwpJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0MSkge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQxWzFdLCBOdW1iZXIoYXR0ZW1wdDFbMl0pXTtcbiAgICB9XG5cbiAgICAvLyBBbm9ueW1vdXMgZnVuY3Rpb25zOiBcImF0IGZpbGVuYW1lOmxpbmVOdW1iZXI6Y29sdW1uTnVtYmVyXCJcbiAgICB2YXIgYXR0ZW1wdDIgPSAvYXQgKFteIF0rKTooXFxkKyk6KD86XFxkKykkLy5leGVjKHN0YWNrTGluZSk7XG4gICAgaWYgKGF0dGVtcHQyKSB7XG4gICAgICAgIHJldHVybiBbYXR0ZW1wdDJbMV0sIE51bWJlcihhdHRlbXB0MlsyXSldO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggc3R5bGU6IFwiZnVuY3Rpb25AZmlsZW5hbWU6bGluZU51bWJlciBvciBAZmlsZW5hbWU6bGluZU51bWJlclwiXG4gICAgdmFyIGF0dGVtcHQzID0gLy4qQCguKyk6KFxcZCspJC8uZXhlYyhzdGFja0xpbmUpO1xuICAgIGlmIChhdHRlbXB0Mykge1xuICAgICAgICByZXR1cm4gW2F0dGVtcHQzWzFdLCBOdW1iZXIoYXR0ZW1wdDNbMl0pXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzSW50ZXJuYWxGcmFtZShzdGFja0xpbmUpIHtcbiAgICB2YXIgZmlsZU5hbWVBbmRMaW5lTnVtYmVyID0gZ2V0RmlsZU5hbWVBbmRMaW5lTnVtYmVyKHN0YWNrTGluZSk7XG5cbiAgICBpZiAoIWZpbGVOYW1lQW5kTGluZU51bWJlcikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVOYW1lID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzBdO1xuICAgIHZhciBsaW5lTnVtYmVyID0gZmlsZU5hbWVBbmRMaW5lTnVtYmVyWzFdO1xuXG4gICAgcmV0dXJuIGZpbGVOYW1lID09PSBxRmlsZU5hbWUgJiZcbiAgICAgICAgbGluZU51bWJlciA+PSBxU3RhcnRpbmdMaW5lICYmXG4gICAgICAgIGxpbmVOdW1iZXIgPD0gcUVuZGluZ0xpbmU7XG59XG5cbi8vIGRpc2NvdmVyIG93biBmaWxlIG5hbWUgYW5kIGxpbmUgbnVtYmVyIHJhbmdlIGZvciBmaWx0ZXJpbmcgc3RhY2tcbi8vIHRyYWNlc1xuZnVuY3Rpb24gY2FwdHVyZUxpbmUoKSB7XG4gICAgaWYgKCFoYXNTdGFja3MpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdmFyIGxpbmVzID0gZS5zdGFjay5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgdmFyIGZpcnN0TGluZSA9IGxpbmVzWzBdLmluZGV4T2YoXCJAXCIpID4gMCA/IGxpbmVzWzFdIDogbGluZXNbMl07XG4gICAgICAgIHZhciBmaWxlTmFtZUFuZExpbmVOdW1iZXIgPSBnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIoZmlyc3RMaW5lKTtcbiAgICAgICAgaWYgKCFmaWxlTmFtZUFuZExpbmVOdW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHFGaWxlTmFtZSA9IGZpbGVOYW1lQW5kTGluZU51bWJlclswXTtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lQW5kTGluZU51bWJlclsxXTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlcHJlY2F0ZShjYWxsYmFjaywgbmFtZSwgYWx0ZXJuYXRpdmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlLndhcm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKG5hbWUgKyBcIiBpcyBkZXByZWNhdGVkLCB1c2UgXCIgKyBhbHRlcm5hdGl2ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgXCIgaW5zdGVhZC5cIiwgbmV3IEVycm9yKFwiXCIpLnN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLy8gZW5kIG9mIHNoaW1zXG4vLyBiZWdpbm5pbmcgb2YgcmVhbCB3b3JrXG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHByb21pc2UgZm9yIGFuIGltbWVkaWF0ZSByZWZlcmVuY2UsIHBhc3NlcyBwcm9taXNlcyB0aHJvdWdoLCBvclxuICogY29lcmNlcyBwcm9taXNlcyBmcm9tIGRpZmZlcmVudCBzeXN0ZW1zLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2Ugb3IgcHJvbWlzZVxuICovXG5mdW5jdGlvbiBRKHZhbHVlKSB7XG4gICAgLy8gSWYgdGhlIG9iamVjdCBpcyBhbHJlYWR5IGEgUHJvbWlzZSwgcmV0dXJuIGl0IGRpcmVjdGx5LiAgVGhpcyBlbmFibGVzXG4gICAgLy8gdGhlIHJlc29sdmUgZnVuY3Rpb24gdG8gYm90aCBiZSB1c2VkIHRvIGNyZWF0ZWQgcmVmZXJlbmNlcyBmcm9tIG9iamVjdHMsXG4gICAgLy8gYnV0IHRvIHRvbGVyYWJseSBjb2VyY2Ugbm9uLXByb21pc2VzIHRvIHByb21pc2VzLlxuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIGFzc2ltaWxhdGUgdGhlbmFibGVzXG4gICAgaWYgKGlzUHJvbWlzZUFsaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY29lcmNlKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVsZmlsbCh2YWx1ZSk7XG4gICAgfVxufVxuUS5yZXNvbHZlID0gUTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIHRhc2sgaW4gYSBmdXR1cmUgdHVybiBvZiB0aGUgZXZlbnQgbG9vcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRhc2tcbiAqL1xuUS5uZXh0VGljayA9IG5leHRUaWNrO1xuXG4vKipcbiAqIENvbnRyb2xzIHdoZXRoZXIgb3Igbm90IGxvbmcgc3RhY2sgdHJhY2VzIHdpbGwgYmUgb25cbiAqL1xuUS5sb25nU3RhY2tTdXBwb3J0ID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGNvdW50ZXIgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHN0b3BwaW5nIHBvaW50IGZvciBidWlsZGluZ1xuICogbG9uZyBzdGFjayB0cmFjZXMuIEluIG1ha2VTdGFja1RyYWNlTG9uZyB3ZSB3YWxrIGJhY2t3YXJkcyB0aHJvdWdoXG4gKiB0aGUgbGlua2VkIGxpc3Qgb2YgcHJvbWlzZXMsIG9ubHkgc3RhY2tzIHdoaWNoIHdlcmUgY3JlYXRlZCBiZWZvcmVcbiAqIHRoZSByZWplY3Rpb24gYXJlIGNvbmNhdGVuYXRlZC5cbiAqL1xudmFyIGxvbmdTdGFja0NvdW50ZXIgPSAxO1xuXG4vLyBlbmFibGUgbG9uZyBzdGFja3MgaWYgUV9ERUJVRyBpcyBzZXRcbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52LlFfREVCVUcpIHtcbiAgICBRLmxvbmdTdGFja1N1cHBvcnQgPSB0cnVlO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSB7cHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0fSBvYmplY3QuXG4gKlxuICogYHJlc29sdmVgIGlzIGEgY2FsbGJhY2sgdG8gaW52b2tlIHdpdGggYSBtb3JlIHJlc29sdmVkIHZhbHVlIGZvciB0aGVcbiAqIHByb21pc2UuIFRvIGZ1bGZpbGwgdGhlIHByb21pc2UsIGludm9rZSBgcmVzb2x2ZWAgd2l0aCBhbnkgdmFsdWUgdGhhdCBpc1xuICogbm90IGEgdGhlbmFibGUuIFRvIHJlamVjdCB0aGUgcHJvbWlzZSwgaW52b2tlIGByZXNvbHZlYCB3aXRoIGEgcmVqZWN0ZWRcbiAqIHRoZW5hYmxlLCBvciBpbnZva2UgYHJlamVjdGAgd2l0aCB0aGUgcmVhc29uIGRpcmVjdGx5LiBUbyByZXNvbHZlIHRoZVxuICogcHJvbWlzZSB0byBhbm90aGVyIHRoZW5hYmxlLCB0aHVzIHB1dHRpbmcgaXQgaW4gdGhlIHNhbWUgc3RhdGUsIGludm9rZVxuICogYHJlc29sdmVgIHdpdGggdGhhdCBvdGhlciB0aGVuYWJsZS5cbiAqL1xuUS5kZWZlciA9IGRlZmVyO1xuZnVuY3Rpb24gZGVmZXIoKSB7XG4gICAgLy8gaWYgXCJtZXNzYWdlc1wiIGlzIGFuIFwiQXJyYXlcIiwgdGhhdCBpbmRpY2F0ZXMgdGhhdCB0aGUgcHJvbWlzZSBoYXMgbm90IHlldFxuICAgIC8vIGJlZW4gcmVzb2x2ZWQuICBJZiBpdCBpcyBcInVuZGVmaW5lZFwiLCBpdCBoYXMgYmVlbiByZXNvbHZlZC4gIEVhY2hcbiAgICAvLyBlbGVtZW50IG9mIHRoZSBtZXNzYWdlcyBhcnJheSBpcyBpdHNlbGYgYW4gYXJyYXkgb2YgY29tcGxldGUgYXJndW1lbnRzIHRvXG4gICAgLy8gZm9yd2FyZCB0byB0aGUgcmVzb2x2ZWQgcHJvbWlzZS4gIFdlIGNvZXJjZSB0aGUgcmVzb2x1dGlvbiB2YWx1ZSB0byBhXG4gICAgLy8gcHJvbWlzZSB1c2luZyB0aGUgYHJlc29sdmVgIGZ1bmN0aW9uIGJlY2F1c2UgaXQgaGFuZGxlcyBib3RoIGZ1bGx5XG4gICAgLy8gbm9uLXRoZW5hYmxlIHZhbHVlcyBhbmQgb3RoZXIgdGhlbmFibGVzIGdyYWNlZnVsbHkuXG4gICAgdmFyIG1lc3NhZ2VzID0gW10sIHByb2dyZXNzTGlzdGVuZXJzID0gW10sIHJlc29sdmVkUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9IG9iamVjdF9jcmVhdGUoZGVmZXIucHJvdG90eXBlKTtcbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIG9wZXJhbmRzKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9wID09PSBcIndoZW5cIiAmJiBvcGVyYW5kc1sxXSkgeyAvLyBwcm9ncmVzcyBvcGVyYW5kXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NMaXN0ZW5lcnMucHVzaChvcGVyYW5kc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlZFByb21pc2UucHJvbWlzZURpc3BhdGNoLmFwcGx5KHJlc29sdmVkUHJvbWlzZSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZFxuICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmVhcmVyVmFsdWUgPSBuZWFyZXIocmVzb2x2ZWRQcm9taXNlKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShuZWFyZXJWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUHJvbWlzZSA9IG5lYXJlclZhbHVlOyAvLyBzaG9ydGVuIGNoYWluXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lYXJlclZhbHVlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghcmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdGF0ZTogXCJwZW5kaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRQcm9taXNlLmluc3BlY3QoKTtcbiAgICB9O1xuXG4gICAgaWYgKFEubG9uZ1N0YWNrU3VwcG9ydCAmJiBoYXNTdGFja3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBkb24ndCB0cnkgdG8gdXNlIGBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZWAgb3IgdHJhbnNmZXIgdGhlXG4gICAgICAgICAgICAvLyBhY2Nlc3NvciBhcm91bmQ7IHRoYXQgY2F1c2VzIG1lbW9yeSBsZWFrcyBhcyBwZXIgR0gtMTExLiBKdXN0XG4gICAgICAgICAgICAvLyByZWlmeSB0aGUgc3RhY2sgdHJhY2UgYXMgYSBzdHJpbmcgQVNBUC5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBdCB0aGUgc2FtZSB0aW1lLCBjdXQgb2ZmIHRoZSBmaXJzdCBsaW5lOyBpdCdzIGFsd2F5cyBqdXN0XG4gICAgICAgICAgICAvLyBcIltvYmplY3QgUHJvbWlzZV1cXG5cIiwgYXMgcGVyIHRoZSBgdG9TdHJpbmdgLlxuICAgICAgICAgICAgcHJvbWlzZS5zdGFjayA9IGUuc3RhY2suc3Vic3RyaW5nKGUuc3RhY2suaW5kZXhPZihcIlxcblwiKSArIDEpO1xuICAgICAgICAgICAgcHJvbWlzZS5zdGFja0NvdW50ZXIgPSBsb25nU3RhY2tDb3VudGVyKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOT1RFOiB3ZSBkbyB0aGUgY2hlY2tzIGZvciBgcmVzb2x2ZWRQcm9taXNlYCBpbiBlYWNoIG1ldGhvZCwgaW5zdGVhZCBvZlxuICAgIC8vIGNvbnNvbGlkYXRpbmcgdGhlbSBpbnRvIGBiZWNvbWVgLCBzaW5jZSBvdGhlcndpc2Ugd2UnZCBjcmVhdGUgbmV3XG4gICAgLy8gcHJvbWlzZXMgd2l0aCB0aGUgbGluZXMgYGJlY29tZSh3aGF0ZXZlcih2YWx1ZSkpYC4gU2VlIGUuZy4gR0gtMjUyLlxuXG4gICAgZnVuY3Rpb24gYmVjb21lKG5ld1Byb21pc2UpIHtcbiAgICAgICAgcmVzb2x2ZWRQcm9taXNlID0gbmV3UHJvbWlzZTtcblxuICAgICAgICBpZiAoUS5sb25nU3RhY2tTdXBwb3J0ICYmIGhhc1N0YWNrcykge1xuICAgICAgICAgICAgLy8gT25seSBob2xkIGEgcmVmZXJlbmNlIHRvIHRoZSBuZXcgcHJvbWlzZSBpZiBsb25nIHN0YWNrc1xuICAgICAgICAgICAgLy8gYXJlIGVuYWJsZWQgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgcHJvbWlzZS5zb3VyY2UgPSBuZXdQcm9taXNlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJyYXlfcmVkdWNlKG1lc3NhZ2VzLCBmdW5jdGlvbiAodW5kZWZpbmVkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9taXNlLnByb21pc2VEaXNwYXRjaC5hcHBseShuZXdQcm9taXNlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB2b2lkIDApO1xuXG4gICAgICAgIG1lc3NhZ2VzID0gdm9pZCAwO1xuICAgICAgICBwcm9ncmVzc0xpc3RlbmVycyA9IHZvaWQgMDtcbiAgICB9XG5cbiAgICBkZWZlcnJlZC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChyZXNvbHZlZFByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGJlY29tZShRKHZhbHVlKSk7XG4gICAgfTtcblxuICAgIGRlZmVycmVkLmZ1bGZpbGwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKGZ1bGZpbGwodmFsdWUpKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKHJlc29sdmVkUHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVjb21lKHJlamVjdChyZWFzb24pKTtcbiAgICB9O1xuICAgIGRlZmVycmVkLm5vdGlmeSA9IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICBpZiAocmVzb2x2ZWRQcm9taXNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhcnJheV9yZWR1Y2UocHJvZ3Jlc3NMaXN0ZW5lcnMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb2dyZXNzTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzTGlzdGVuZXIocHJvZ3Jlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHZvaWQgMCk7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWZlcnJlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZS1zdHlsZSBjYWxsYmFjayB0aGF0IHdpbGwgcmVzb2x2ZSBvciByZWplY3QgdGhlIGRlZmVycmVkXG4gKiBwcm9taXNlLlxuICogQHJldHVybnMgYSBub2RlYmFja1xuICovXG5kZWZlci5wcm90b3R5cGUubWFrZU5vZGVSZXNvbHZlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICBzZWxmLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZShhcnJheV9zbGljZShhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVzb2x2ZXIge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBub3RoaW5nIGFuZCBhY2NlcHRzXG4gKiB0aGUgcmVzb2x2ZSwgcmVqZWN0LCBhbmQgbm90aWZ5IGZ1bmN0aW9ucyBmb3IgYSBkZWZlcnJlZC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IG1heSBiZSByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiByZXNvbHZlIGFuZCByZWplY3RcbiAqIGZ1bmN0aW9ucywgb3IgcmVqZWN0ZWQgYnkgYSB0aHJvd24gZXhjZXB0aW9uIGluIHJlc29sdmVyXG4gKi9cblEuUHJvbWlzZSA9IHByb21pc2U7IC8vIEVTNlxuUS5wcm9taXNlID0gcHJvbWlzZTtcbmZ1bmN0aW9uIHByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInJlc29sdmVyIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0LCBkZWZlcnJlZC5ub3RpZnkpO1xuICAgIH0gY2F0Y2ggKHJlYXNvbikge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cbnByb21pc2UucmFjZSA9IHJhY2U7IC8vIEVTNlxucHJvbWlzZS5hbGwgPSBhbGw7IC8vIEVTNlxucHJvbWlzZS5yZWplY3QgPSByZWplY3Q7IC8vIEVTNlxucHJvbWlzZS5yZXNvbHZlID0gUTsgLy8gRVM2XG5cbi8vIFhYWCBleHBlcmltZW50YWwuICBUaGlzIG1ldGhvZCBpcyBhIHdheSB0byBkZW5vdGUgdGhhdCBhIGxvY2FsIHZhbHVlIGlzXG4vLyBzZXJpYWxpemFibGUgYW5kIHNob3VsZCBiZSBpbW1lZGlhdGVseSBkaXNwYXRjaGVkIHRvIGEgcmVtb3RlIHVwb24gcmVxdWVzdCxcbi8vIGluc3RlYWQgb2YgcGFzc2luZyBhIHJlZmVyZW5jZS5cblEucGFzc0J5Q29weSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAvL2ZyZWV6ZShvYmplY3QpO1xuICAgIC8vcGFzc0J5Q29waWVzLnNldChvYmplY3QsIHRydWUpO1xuICAgIHJldHVybiBvYmplY3Q7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5wYXNzQnlDb3B5ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vZnJlZXplKG9iamVjdCk7XG4gICAgLy9wYXNzQnlDb3BpZXMuc2V0KG9iamVjdCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElmIHR3byBwcm9taXNlcyBldmVudHVhbGx5IGZ1bGZpbGwgdG8gdGhlIHNhbWUgdmFsdWUsIHByb21pc2VzIHRoYXQgdmFsdWUsXG4gKiBidXQgb3RoZXJ3aXNlIHJlamVjdHMuXG4gKiBAcGFyYW0geCB7QW55Kn1cbiAqIEBwYXJhbSB5IHtBbnkqfVxuICogQHJldHVybnMge0FueSp9IGEgcHJvbWlzZSBmb3IgeCBhbmQgeSBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgYnV0IGEgcmVqZWN0aW9uXG4gKiBvdGhlcndpc2UuXG4gKlxuICovXG5RLmpvaW4gPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHJldHVybiBRKHgpLmpvaW4oeSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24gKHRoYXQpIHtcbiAgICByZXR1cm4gUShbdGhpcywgdGhhdF0pLnNwcmVhZChmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgICAgLy8gVE9ETzogXCI9PT1cIiBzaG91bGQgYmUgT2JqZWN0LmlzIG9yIGVxdWl2XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlEgY2FuJ3Qgam9pbjogbm90IHRoZSBzYW1lOiBcIiArIHggKyBcIiBcIiArIHkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgZmlyc3Qgb2YgYW4gYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmVjb21lIHNldHRsZWQuXG4gKiBAcGFyYW0gYW5zd2VycyB7QXJyYXlbQW55Kl19IHByb21pc2VzIHRvIHJhY2VcbiAqIEByZXR1cm5zIHtBbnkqfSB0aGUgZmlyc3QgcHJvbWlzZSB0byBiZSBzZXR0bGVkXG4gKi9cblEucmFjZSA9IHJhY2U7XG5mdW5jdGlvbiByYWNlKGFuc3dlclBzKSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBTd2l0Y2ggdG8gdGhpcyBvbmNlIHdlIGNhbiBhc3N1bWUgYXQgbGVhc3QgRVM1XG4gICAgICAgIC8vIGFuc3dlclBzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlclApIHtcbiAgICAgICAgLy8gICAgIFEoYW5zd2VyUCkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gVXNlIHRoaXMgaW4gdGhlIG1lYW50aW1lXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhbnN3ZXJQcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgUShhbnN3ZXJQc1tpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnJhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihRLnJhY2UpO1xufTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUHJvbWlzZSB3aXRoIGEgcHJvbWlzZSBkZXNjcmlwdG9yIG9iamVjdCBhbmQgb3B0aW9uYWwgZmFsbGJhY2tcbiAqIGZ1bmN0aW9uLiAgVGhlIGRlc2NyaXB0b3IgY29udGFpbnMgbWV0aG9kcyBsaWtlIHdoZW4ocmVqZWN0ZWQpLCBnZXQobmFtZSksXG4gKiBzZXQobmFtZSwgdmFsdWUpLCBwb3N0KG5hbWUsIGFyZ3MpLCBhbmQgZGVsZXRlKG5hbWUpLCB3aGljaCBhbGxcbiAqIHJldHVybiBlaXRoZXIgYSB2YWx1ZSwgYSBwcm9taXNlIGZvciBhIHZhbHVlLCBvciBhIHJlamVjdGlvbi4gIFRoZSBmYWxsYmFja1xuICogYWNjZXB0cyB0aGUgb3BlcmF0aW9uIG5hbWUsIGEgcmVzb2x2ZXIsIGFuZCBhbnkgZnVydGhlciBhcmd1bWVudHMgdGhhdCB3b3VsZFxuICogaGF2ZSBiZWVuIGZvcndhcmRlZCB0byB0aGUgYXBwcm9wcmlhdGUgbWV0aG9kIGFib3ZlIGhhZCBhIG1ldGhvZCBiZWVuXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBwcm9wZXIgbmFtZS4gIFRoZSBBUEkgbWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCB0aGUgbmF0dXJlXG4gKiBvZiB0aGUgcmV0dXJuZWQgb2JqZWN0LCBhcGFydCBmcm9tIHRoYXQgaXQgaXMgdXNhYmxlIHdoZXJlZXZlciBwcm9taXNlcyBhcmVcbiAqIGJvdWdodCBhbmQgc29sZC5cbiAqL1xuUS5tYWtlUHJvbWlzZSA9IFByb21pc2U7XG5mdW5jdGlvbiBQcm9taXNlKGRlc2NyaXB0b3IsIGZhbGxiYWNrLCBpbnNwZWN0KSB7XG4gICAgaWYgKGZhbGxiYWNrID09PSB2b2lkIDApIHtcbiAgICAgICAgZmFsbGJhY2sgPSBmdW5jdGlvbiAob3ApIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiUHJvbWlzZSBkb2VzIG5vdCBzdXBwb3J0IG9wZXJhdGlvbjogXCIgKyBvcFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbnNwZWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7c3RhdGU6IFwidW5rbm93blwifTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZSA9IG9iamVjdF9jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpO1xuXG4gICAgcHJvbWlzZS5wcm9taXNlRGlzcGF0Y2ggPSBmdW5jdGlvbiAocmVzb2x2ZSwgb3AsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChkZXNjcmlwdG9yW29wXSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRlc2NyaXB0b3Jbb3BdLmFwcGx5KHByb21pc2UsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmYWxsYmFjay5jYWxsKHByb21pc2UsIG9wLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2UuaW5zcGVjdCA9IGluc3BlY3Q7XG5cbiAgICAvLyBYWFggZGVwcmVjYXRlZCBgdmFsdWVPZmAgYW5kIGBleGNlcHRpb25gIHN1cHBvcnRcbiAgICBpZiAoaW5zcGVjdCkge1xuICAgICAgICB2YXIgaW5zcGVjdGVkID0gaW5zcGVjdCgpO1xuICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInJlamVjdGVkXCIpIHtcbiAgICAgICAgICAgIHByb21pc2UuZXhjZXB0aW9uID0gaW5zcGVjdGVkLnJlYXNvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2UudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnNwZWN0ZWQgPSBpbnNwZWN0KCk7XG4gICAgICAgICAgICBpZiAoaW5zcGVjdGVkLnN0YXRlID09PSBcInBlbmRpbmdcIiB8fFxuICAgICAgICAgICAgICAgIGluc3BlY3RlZC5zdGF0ZSA9PT0gXCJyZWplY3RlZFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5zcGVjdGVkLnZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IFByb21pc2VdXCI7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICB2YXIgZG9uZSA9IGZhbHNlOyAgIC8vIGVuc3VyZSB0aGUgdW50cnVzdGVkIHByb21pc2UgbWFrZXMgYXQgbW9zdCBhXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzaW5nbGUgY2FsbCB0byBvbmUgb2YgdGhlIGNhbGxiYWNrc1xuXG4gICAgZnVuY3Rpb24gX2Z1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmdWxmaWxsZWQgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bGZpbGxlZCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVqZWN0ZWQoZXhjZXB0aW9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVqZWN0ZWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgbWFrZVN0YWNrVHJhY2VMb25nKGV4Y2VwdGlvbiwgc2VsZik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3RlZChleGNlcHRpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAobmV3RXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChuZXdFeGNlcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcHJvZ3Jlc3NlZCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHByb2dyZXNzZWQgPT09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzZWQodmFsdWUpIDogdmFsdWU7XG4gICAgfVxuXG4gICAgUS5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfZnVsZmlsbGVkKHZhbHVlKSk7XG4gICAgICAgIH0sIFwid2hlblwiLCBbZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcblxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShfcmVqZWN0ZWQoZXhjZXB0aW9uKSk7XG4gICAgICAgIH1dKTtcbiAgICB9KTtcblxuICAgIC8vIFByb2dyZXNzIHByb3BhZ2F0b3IgbmVlZCB0byBiZSBhdHRhY2hlZCBpbiB0aGUgY3VycmVudCB0aWNrLlxuICAgIHNlbGYucHJvbWlzZURpc3BhdGNoKHZvaWQgMCwgXCJ3aGVuXCIsIFt2b2lkIDAsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgbmV3VmFsdWU7XG4gICAgICAgIHZhciB0aHJldyA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSBfcHJvZ3Jlc3NlZCh2YWx1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocmV3ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChRLm9uZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBRLm9uZXJyb3IoZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRocmV3KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG5RLnRhcCA9IGZ1bmN0aW9uIChwcm9taXNlLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRhcChjYWxsYmFjayk7XG59O1xuXG4vKipcbiAqIFdvcmtzIGFsbW9zdCBsaWtlIFwiZmluYWxseVwiLCBidXQgbm90IGNhbGxlZCBmb3IgcmVqZWN0aW9ucy5cbiAqIE9yaWdpbmFsIHJlc29sdXRpb24gdmFsdWUgaXMgcGFzc2VkIHRocm91Z2ggY2FsbGJhY2sgdW5hZmZlY3RlZC5cbiAqIENhbGxiYWNrIG1heSByZXR1cm4gYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBhd2FpdGVkIGZvci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7US5Qcm9taXNlfVxuICogQGV4YW1wbGVcbiAqIGRvU29tZXRoaW5nKClcbiAqICAgLnRoZW4oLi4uKVxuICogICAudGFwKGNvbnNvbGUubG9nKVxuICogICAudGhlbiguLi4pO1xuICovXG5Qcm9taXNlLnByb3RvdHlwZS50YXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuXG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKHZhbHVlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVycyBhbiBvYnNlcnZlciBvbiBhIHByb21pc2UuXG4gKlxuICogR3VhcmFudGVlczpcbiAqXG4gKiAxLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlLlxuICogMi4gdGhhdCBlaXRoZXIgdGhlIGZ1bGZpbGxlZCBjYWxsYmFjayBvciB0aGUgcmVqZWN0ZWQgY2FsbGJhY2sgd2lsbCBiZVxuICogICAgY2FsbGVkLCBidXQgbm90IGJvdGguXG4gKiAzLiB0aGF0IGZ1bGZpbGxlZCBhbmQgcmVqZWN0ZWQgd2lsbCBub3QgYmUgY2FsbGVkIGluIHRoaXMgdHVybi5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgICAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgdG8gb2JzZXJ2ZVxuICogQHBhcmFtIGZ1bGZpbGxlZCAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHJlamVjdGVkICAgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdpdGggdGhlIHJlamVjdGlvbiBleGNlcHRpb25cbiAqIEBwYXJhbSBwcm9ncmVzc2VkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGludm9rZWQgY2FsbGJhY2tcbiAqL1xuUS53aGVuID0gd2hlbjtcbmZ1bmN0aW9uIHdoZW4odmFsdWUsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUSh2YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkLCBwcm9ncmVzc2VkKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUudGhlblJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZhbHVlOyB9KTtcbn07XG5cblEudGhlblJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gUShwcm9taXNlKS50aGVuUmVzb2x2ZSh2YWx1ZSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyByZWFzb247IH0pO1xufTtcblxuUS50aGVuUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHJlYXNvbikge1xuICAgIHJldHVybiBRKHByb21pc2UpLnRoZW5SZWplY3QocmVhc29uKTtcbn07XG5cbi8qKlxuICogSWYgYW4gb2JqZWN0IGlzIG5vdCBhIHByb21pc2UsIGl0IGlzIGFzIFwibmVhclwiIGFzIHBvc3NpYmxlLlxuICogSWYgYSBwcm9taXNlIGlzIHJlamVjdGVkLCBpdCBpcyBhcyBcIm5lYXJcIiBhcyBwb3NzaWJsZSB0b28uXG4gKiBJZiBpdOKAmXMgYSBmdWxmaWxsZWQgcHJvbWlzZSwgdGhlIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5lYXJlci5cbiAqIElmIGl04oCZcyBhIGRlZmVycmVkIHByb21pc2UgYW5kIHRoZSBkZWZlcnJlZCBoYXMgYmVlbiByZXNvbHZlZCwgdGhlXG4gKiByZXNvbHV0aW9uIGlzIFwibmVhcmVyXCIuXG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcmV0dXJucyBtb3N0IHJlc29sdmVkIChuZWFyZXN0KSBmb3JtIG9mIHRoZSBvYmplY3RcbiAqL1xuXG4vLyBYWFggc2hvdWxkIHdlIHJlLWRvIHRoaXM/XG5RLm5lYXJlciA9IG5lYXJlcjtcbmZ1bmN0aW9uIG5lYXJlcih2YWx1ZSkge1xuICAgIGlmIChpc1Byb21pc2UodmFsdWUpKSB7XG4gICAgICAgIHZhciBpbnNwZWN0ZWQgPSB2YWx1ZS5pbnNwZWN0KCk7XG4gICAgICAgIGlmIChpbnNwZWN0ZWQuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnNwZWN0ZWQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UuXG4gKiBPdGhlcndpc2UgaXQgaXMgYSBmdWxmaWxsZWQgdmFsdWUuXG4gKi9cblEuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZnVuY3Rpb24gaXNQcm9taXNlKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlO1xufVxuXG5RLmlzUHJvbWlzZUFsaWtlID0gaXNQcm9taXNlQWxpa2U7XG5mdW5jdGlvbiBpc1Byb21pc2VBbGlrZShvYmplY3QpIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqZWN0KSAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwZW5kaW5nIHByb21pc2UsIG1lYW5pbmcgbm90XG4gKiBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG4gKi9cblEuaXNQZW5kaW5nID0gaXNQZW5kaW5nO1xuZnVuY3Rpb24gaXNQZW5kaW5nKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInBlbmRpbmdcIjtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuaXNQZW5kaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmluc3BlY3QoKS5zdGF0ZSA9PT0gXCJwZW5kaW5nXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHZhbHVlIG9yIGZ1bGZpbGxlZFxuICogcHJvbWlzZS5cbiAqL1xuUS5pc0Z1bGZpbGxlZCA9IGlzRnVsZmlsbGVkO1xuZnVuY3Rpb24gaXNGdWxmaWxsZWQob2JqZWN0KSB7XG4gICAgcmV0dXJuICFpc1Byb21pc2Uob2JqZWN0KSB8fCBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5pc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCkuc3RhdGUgPT09IFwiZnVsZmlsbGVkXCI7XG59O1xuXG4vKipcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cblEuaXNSZWplY3RlZCA9IGlzUmVqZWN0ZWQ7XG5mdW5jdGlvbiBpc1JlamVjdGVkKG9iamVjdCkge1xuICAgIHJldHVybiBpc1Byb21pc2Uob2JqZWN0KSAmJiBvYmplY3QuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59XG5cblByb21pc2UucHJvdG90eXBlLmlzUmVqZWN0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zcGVjdCgpLnN0YXRlID09PSBcInJlamVjdGVkXCI7XG59O1xuXG4vLy8vIEJFR0lOIFVOSEFORExFRCBSRUpFQ1RJT04gVFJBQ0tJTkdcblxuLy8gVGhpcyBwcm9taXNlIGxpYnJhcnkgY29uc3VtZXMgZXhjZXB0aW9ucyB0aHJvd24gaW4gaGFuZGxlcnMgc28gdGhleSBjYW4gYmVcbi8vIGhhbmRsZWQgYnkgYSBzdWJzZXF1ZW50IHByb21pc2UuICBUaGUgZXhjZXB0aW9ucyBnZXQgYWRkZWQgdG8gdGhpcyBhcnJheSB3aGVuXG4vLyB0aGV5IGFyZSBjcmVhdGVkLCBhbmQgcmVtb3ZlZCB3aGVuIHRoZXkgYXJlIGhhbmRsZWQuICBOb3RlIHRoYXQgaW4gRVM2IG9yXG4vLyBzaGltbWVkIGVudmlyb25tZW50cywgdGhpcyB3b3VsZCBuYXR1cmFsbHkgYmUgYSBgU2V0YC5cbnZhciB1bmhhbmRsZWRSZWFzb25zID0gW107XG52YXIgdW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyA9IFtdO1xudmFyIHRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucygpIHtcbiAgICB1bmhhbmRsZWRSZWFzb25zLmxlbmd0aCA9IDA7XG4gICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5sZW5ndGggPSAwO1xuXG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gdHJ1ZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYWNrUmVqZWN0aW9uKHByb21pc2UsIHJlYXNvbikge1xuICAgIGlmICghdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcnJheV9pbmRleE9mKHVuaGFuZGxlZFJlamVjdGlvbnMsIHByb21pc2UpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHByb2Nlc3MuZW1pdChcInVuaGFuZGxlZFJlamVjdGlvblwiLCByZWFzb24sIHByb21pc2UpO1xuICAgICAgICAgICAgICAgIHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucy5wdXNoKHByb21pc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1bmhhbmRsZWRSZWplY3Rpb25zLnB1c2gocHJvbWlzZSk7XG4gICAgaWYgKHJlYXNvbiAmJiB0eXBlb2YgcmVhc29uLnN0YWNrICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChyZWFzb24uc3RhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaGFuZGxlZFJlYXNvbnMucHVzaChcIihubyBzdGFjaykgXCIgKyByZWFzb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdW50cmFja1JlamVjdGlvbihwcm9taXNlKSB7XG4gICAgaWYgKCF0cmFja1VuaGFuZGxlZFJlamVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBhdCA9IGFycmF5X2luZGV4T2YodW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgaWYgKGF0ICE9PSAtMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MuZW1pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrLnJ1bkFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXRSZXBvcnQgPSBhcnJheV9pbmRleE9mKHJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucywgcHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGF0UmVwb3J0ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmVtaXQoXCJyZWplY3Rpb25IYW5kbGVkXCIsIHVuaGFuZGxlZFJlYXNvbnNbYXRdLCBwcm9taXNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ZWRVbmhhbmRsZWRSZWplY3Rpb25zLnNwbGljZShhdFJlcG9ydCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdW5oYW5kbGVkUmVqZWN0aW9ucy5zcGxpY2UoYXQsIDEpO1xuICAgICAgICB1bmhhbmRsZWRSZWFzb25zLnNwbGljZShhdCwgMSk7XG4gICAgfVxufVxuXG5RLnJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyA9IHJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucztcblxuUS5nZXRVbmhhbmRsZWRSZWFzb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIE1ha2UgYSBjb3B5IHNvIHRoYXQgY29uc3VtZXJzIGNhbid0IGludGVyZmVyZSB3aXRoIG91ciBpbnRlcm5hbCBzdGF0ZS5cbiAgICByZXR1cm4gdW5oYW5kbGVkUmVhc29ucy5zbGljZSgpO1xufTtcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmVzZXRVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgdHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZmFsc2U7XG59O1xuXG5yZXNldFVuaGFuZGxlZFJlamVjdGlvbnMoKTtcblxuLy8vLyBFTkQgVU5IQU5ETEVEIFJFSkVDVElPTiBUUkFDS0lOR1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSByZWplY3RlZCBwcm9taXNlLlxuICogQHBhcmFtIHJlYXNvbiB2YWx1ZSBkZXNjcmliaW5nIHRoZSBmYWlsdXJlXG4gKi9cblEucmVqZWN0ID0gcmVqZWN0O1xuZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciByZWplY3Rpb24gPSBQcm9taXNlKHtcbiAgICAgICAgXCJ3aGVuXCI6IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuICAgICAgICAgICAgLy8gbm90ZSB0aGF0IHRoZSBlcnJvciBoYXMgYmVlbiBoYW5kbGVkXG4gICAgICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB1bnRyYWNrUmVqZWN0aW9uKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQocmVhc29uKSA6IHRoaXM7XG4gICAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiBmYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwicmVqZWN0ZWRcIiwgcmVhc29uOiByZWFzb24gfTtcbiAgICB9KTtcblxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcmVhc29uIGhhcyBub3QgYmVlbiBoYW5kbGVkLlxuICAgIHRyYWNrUmVqZWN0aW9uKHJlamVjdGlvbiwgcmVhc29uKTtcblxuICAgIHJldHVybiByZWplY3Rpb247XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGZ1bGZpbGxlZCBwcm9taXNlIGZvciBhbiBpbW1lZGlhdGUgcmVmZXJlbmNlLlxuICogQHBhcmFtIHZhbHVlIGltbWVkaWF0ZSByZWZlcmVuY2VcbiAqL1xuUS5mdWxmaWxsID0gZnVsZmlsbDtcbmZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZSh7XG4gICAgICAgIFwid2hlblwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uIChuYW1lLCByaHMpIHtcbiAgICAgICAgICAgIHZhbHVlW25hbWVdID0gcmhzO1xuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVwiOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgZGVsZXRlIHZhbHVlW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBcInBvc3RcIjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbiAgICAgICAgICAgIC8vIE1hcmsgTWlsbGVyIHByb3Bvc2VzIHRoYXQgcG9zdCB3aXRoIG5vIG5hbWUgc2hvdWxkIGFwcGx5IGFcbiAgICAgICAgICAgIC8vIHByb21pc2VkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgbmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmFwcGx5KHZvaWQgMCwgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVtuYW1lXS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYXBwbHlcIjogZnVuY3Rpb24gKHRoaXNwLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuYXBwbHkodGhpc3AsIGFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBcImtleXNcIjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdF9rZXlzKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sIHZvaWQgMCwgZnVuY3Rpb24gaW5zcGVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdGU6IFwiZnVsZmlsbGVkXCIsIHZhbHVlOiB2YWx1ZSB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZW5hYmxlcyB0byBRIHByb21pc2VzLlxuICogQHBhcmFtIHByb21pc2UgdGhlbmFibGUgcHJvbWlzZVxuICogQHJldHVybnMgYSBRIHByb21pc2VcbiAqL1xuZnVuY3Rpb24gY29lcmNlKHByb21pc2UpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCwgZGVmZXJyZWQubm90aWZ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuXG4vKipcbiAqIEFubm90YXRlcyBhbiBvYmplY3Qgc3VjaCB0aGF0IGl0IHdpbGwgbmV2ZXIgYmVcbiAqIHRyYW5zZmVycmVkIGF3YXkgZnJvbSB0aGlzIHByb2Nlc3Mgb3ZlciBhbnkgcHJvbWlzZVxuICogY29tbXVuaWNhdGlvbiBjaGFubmVsLlxuICogQHBhcmFtIG9iamVjdFxuICogQHJldHVybnMgcHJvbWlzZSBhIHdyYXBwaW5nIG9mIHRoYXQgb2JqZWN0IHRoYXRcbiAqIGFkZGl0aW9uYWxseSByZXNwb25kcyB0byB0aGUgXCJpc0RlZlwiIG1lc3NhZ2VcbiAqIHdpdGhvdXQgYSByZWplY3Rpb24uXG4gKi9cblEubWFzdGVyID0gbWFzdGVyO1xuZnVuY3Rpb24gbWFzdGVyKG9iamVjdCkge1xuICAgIHJldHVybiBQcm9taXNlKHtcbiAgICAgICAgXCJpc0RlZlwiOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sIGZ1bmN0aW9uIGZhbGxiYWNrKG9wLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaChvYmplY3QsIG9wLCBhcmdzKTtcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBRKG9iamVjdCkuaW5zcGVjdCgpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIFNwcmVhZHMgdGhlIHZhbHVlcyBvZiBhIHByb21pc2VkIGFycmF5IG9mIGFyZ3VtZW50cyBpbnRvIHRoZVxuICogZnVsZmlsbG1lbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gZnVsZmlsbGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdmFyaWFkaWMgYXJndW1lbnRzIGZyb20gdGhlXG4gKiBwcm9taXNlZCBhcnJheVxuICogQHBhcmFtIHJlamVjdGVkIGNhbGxiYWNrIHRoYXQgcmVjZWl2ZXMgdGhlIGV4Y2VwdGlvbiBpZiB0aGUgcHJvbWlzZVxuICogaXMgcmVqZWN0ZWQuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWUgb3IgdGhyb3duIGV4Y2VwdGlvbiBvZlxuICogZWl0aGVyIGNhbGxiYWNrLlxuICovXG5RLnNwcmVhZCA9IHNwcmVhZDtcbmZ1bmN0aW9uIHNwcmVhZCh2YWx1ZSwgZnVsZmlsbGVkLCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKHZhbHVlKS5zcHJlYWQoZnVsZmlsbGVkLCByZWplY3RlZCk7XG59XG5cblByb21pc2UucHJvdG90eXBlLnNwcmVhZCA9IGZ1bmN0aW9uIChmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsKCkudGhlbihmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZC5hcHBseSh2b2lkIDAsIGFycmF5KTtcbiAgICB9LCByZWplY3RlZCk7XG59O1xuXG4vKipcbiAqIFRoZSBhc3luYyBmdW5jdGlvbiBpcyBhIGRlY29yYXRvciBmb3IgZ2VuZXJhdG9yIGZ1bmN0aW9ucywgdHVybmluZ1xuICogdGhlbSBpbnRvIGFzeW5jaHJvbm91cyBnZW5lcmF0b3JzLiAgQWx0aG91Z2ggZ2VuZXJhdG9ycyBhcmUgb25seSBwYXJ0XG4gKiBvZiB0aGUgbmV3ZXN0IEVDTUFTY3JpcHQgNiBkcmFmdHMsIHRoaXMgY29kZSBkb2VzIG5vdCBjYXVzZSBzeW50YXhcbiAqIGVycm9ycyBpbiBvbGRlciBlbmdpbmVzLiAgVGhpcyBjb2RlIHNob3VsZCBjb250aW51ZSB0byB3b3JrIGFuZCB3aWxsXG4gKiBpbiBmYWN0IGltcHJvdmUgb3ZlciB0aW1lIGFzIHRoZSBsYW5ndWFnZSBpbXByb3Zlcy5cbiAqXG4gKiBFUzYgZ2VuZXJhdG9ycyBhcmUgY3VycmVudGx5IHBhcnQgb2YgVjggdmVyc2lvbiAzLjE5IHdpdGggdGhlXG4gKiAtLWhhcm1vbnktZ2VuZXJhdG9ycyBydW50aW1lIGZsYWcgZW5hYmxlZC4gIFNwaWRlck1vbmtleSBoYXMgaGFkIHRoZW1cbiAqIGZvciBsb25nZXIsIGJ1dCB1bmRlciBhbiBvbGRlciBQeXRob24taW5zcGlyZWQgZm9ybS4gIFRoaXMgZnVuY3Rpb25cbiAqIHdvcmtzIG9uIGJvdGgga2luZHMgb2YgZ2VuZXJhdG9ycy5cbiAqXG4gKiBEZWNvcmF0ZXMgYSBnZW5lcmF0b3IgZnVuY3Rpb24gc3VjaCB0aGF0OlxuICogIC0gaXQgbWF5IHlpZWxkIHByb21pc2VzXG4gKiAgLSBleGVjdXRpb24gd2lsbCBjb250aW51ZSB3aGVuIHRoYXQgcHJvbWlzZSBpcyBmdWxmaWxsZWRcbiAqICAtIHRoZSB2YWx1ZSBvZiB0aGUgeWllbGQgZXhwcmVzc2lvbiB3aWxsIGJlIHRoZSBmdWxmaWxsZWQgdmFsdWVcbiAqICAtIGl0IHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlICh3aGVuIHRoZSBnZW5lcmF0b3JcbiAqICAgIHN0b3BzIGl0ZXJhdGluZylcbiAqICAtIHRoZSBkZWNvcmF0ZWQgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqICAgIG9mIHRoZSBnZW5lcmF0b3Igb3IgdGhlIGZpcnN0IHJlamVjdGVkIHByb21pc2UgYW1vbmcgdGhvc2VcbiAqICAgIHlpZWxkZWQuXG4gKiAgLSBpZiBhbiBlcnJvciBpcyB0aHJvd24gaW4gdGhlIGdlbmVyYXRvciwgaXQgcHJvcGFnYXRlcyB0aHJvdWdoXG4gKiAgICBldmVyeSBmb2xsb3dpbmcgeWllbGQgdW50aWwgaXQgaXMgY2F1Z2h0LCBvciB1bnRpbCBpdCBlc2NhcGVzXG4gKiAgICB0aGUgZ2VuZXJhdG9yIGZ1bmN0aW9uIGFsdG9nZXRoZXIsIGFuZCBpcyB0cmFuc2xhdGVkIGludG8gYVxuICogICAgcmVqZWN0aW9uIGZvciB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZGVjb3JhdGVkIGdlbmVyYXRvci5cbiAqL1xuUS5hc3luYyA9IGFzeW5jO1xuZnVuY3Rpb24gYXN5bmMobWFrZUdlbmVyYXRvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHdoZW4gdmVyYiBpcyBcInNlbmRcIiwgYXJnIGlzIGEgdmFsdWVcbiAgICAgICAgLy8gd2hlbiB2ZXJiIGlzIFwidGhyb3dcIiwgYXJnIGlzIGFuIGV4Y2VwdGlvblxuICAgICAgICBmdW5jdGlvbiBjb250aW51ZXIodmVyYiwgYXJnKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICAgICAgICAvLyBVbnRpbCBWOCAzLjE5IC8gQ2hyb21pdW0gMjkgaXMgcmVsZWFzZWQsIFNwaWRlck1vbmtleSBpcyB0aGUgb25seVxuICAgICAgICAgICAgLy8gZW5naW5lIHRoYXQgaGFzIGEgZGVwbG95ZWQgYmFzZSBvZiBicm93c2VycyB0aGF0IHN1cHBvcnQgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIFNNJ3MgZ2VuZXJhdG9ycyB1c2UgdGhlIFB5dGhvbi1pbnNwaXJlZCBzZW1hbnRpY3Mgb2ZcbiAgICAgICAgICAgIC8vIG91dGRhdGVkIEVTNiBkcmFmdHMuICBXZSB3b3VsZCBsaWtlIHRvIHN1cHBvcnQgRVM2LCBidXQgd2UnZCBhbHNvXG4gICAgICAgICAgICAvLyBsaWtlIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gdXNlIGdlbmVyYXRvcnMgaW4gZGVwbG95ZWQgYnJvd3NlcnMsIHNvXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIHN1cHBvcnQgUHl0aG9uLXN0eWxlIGdlbmVyYXRvcnMuICBBdCBzb21lIHBvaW50IHdlIGNhbiByZW1vdmVcbiAgICAgICAgICAgIC8vIHRoaXMgYmxvY2suXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgU3RvcEl0ZXJhdGlvbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIC8vIEVTNiBHZW5lcmF0b3JzXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2VuZXJhdG9yW3ZlcmJdKGFyZyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBRKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdoZW4ocmVzdWx0LnZhbHVlLCBjYWxsYmFjaywgZXJyYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTcGlkZXJNb25rZXkgR2VuZXJhdG9yc1xuICAgICAgICAgICAgICAgIC8vIEZJWE1FOiBSZW1vdmUgdGhpcyBjYXNlIHdoZW4gU00gZG9lcyBFUzYgZ2VuZXJhdG9ycy5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBnZW5lcmF0b3JbdmVyYl0oYXJnKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU3RvcEl0ZXJhdGlvbihleGNlcHRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUShleGNlcHRpb24udmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuKHJlc3VsdCwgY2FsbGJhY2ssIGVycmJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBtYWtlR2VuZXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJuZXh0XCIpO1xuICAgICAgICB2YXIgZXJyYmFjayA9IGNvbnRpbnVlci5iaW5kKGNvbnRpbnVlciwgXCJ0aHJvd1wiKTtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBUaGUgc3Bhd24gZnVuY3Rpb24gaXMgYSBzbWFsbCB3cmFwcGVyIGFyb3VuZCBhc3luYyB0aGF0IGltbWVkaWF0ZWx5XG4gKiBjYWxscyB0aGUgZ2VuZXJhdG9yIGFuZCBhbHNvIGVuZHMgdGhlIHByb21pc2UgY2hhaW4sIHNvIHRoYXQgYW55XG4gKiB1bmhhbmRsZWQgZXJyb3JzIGFyZSB0aHJvd24gaW5zdGVhZCBvZiBmb3J3YXJkZWQgdG8gdGhlIGVycm9yXG4gKiBoYW5kbGVyLiBUaGlzIGlzIHVzZWZ1bCBiZWNhdXNlIGl0J3MgZXh0cmVtZWx5IGNvbW1vbiB0byBydW5cbiAqIGdlbmVyYXRvcnMgYXQgdGhlIHRvcC1sZXZlbCB0byB3b3JrIHdpdGggbGlicmFyaWVzLlxuICovXG5RLnNwYXduID0gc3Bhd247XG5mdW5jdGlvbiBzcGF3bihtYWtlR2VuZXJhdG9yKSB7XG4gICAgUS5kb25lKFEuYXN5bmMobWFrZUdlbmVyYXRvcikoKSk7XG59XG5cbi8vIEZJWE1FOiBSZW1vdmUgdGhpcyBpbnRlcmZhY2Ugb25jZSBFUzYgZ2VuZXJhdG9ycyBhcmUgaW4gU3BpZGVyTW9ua2V5LlxuLyoqXG4gKiBUaHJvd3MgYSBSZXR1cm5WYWx1ZSBleGNlcHRpb24gdG8gc3RvcCBhbiBhc3luY2hyb25vdXMgZ2VuZXJhdG9yLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGlzIGEgc3RvcC1nYXAgbWVhc3VyZSB0byBzdXBwb3J0IGdlbmVyYXRvciByZXR1cm5cbiAqIHZhbHVlcyBpbiBvbGRlciBGaXJlZm94L1NwaWRlck1vbmtleS4gIEluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBFUzZcbiAqIGdlbmVyYXRvcnMgbGlrZSBDaHJvbWl1bSAyOSwganVzdCB1c2UgXCJyZXR1cm5cIiBpbiB5b3VyIGdlbmVyYXRvclxuICogZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgc3Vycm91bmRpbmcgZ2VuZXJhdG9yXG4gKiBAdGhyb3dzIFJldHVyblZhbHVlIGV4Y2VwdGlvbiB3aXRoIHRoZSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKiAvLyBFUzYgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24qICgpIHtcbiAqICAgICAgdmFyIGZvbyA9IHlpZWxkIGdldEZvb1Byb21pc2UoKTtcbiAqICAgICAgdmFyIGJhciA9IHlpZWxkIGdldEJhclByb21pc2UoKTtcbiAqICAgICAgcmV0dXJuIGZvbyArIGJhcjtcbiAqIH0pXG4gKiAvLyBPbGRlciBTcGlkZXJNb25rZXkgc3R5bGVcbiAqIFEuYXN5bmMoZnVuY3Rpb24gKCkge1xuICogICAgICB2YXIgZm9vID0geWllbGQgZ2V0Rm9vUHJvbWlzZSgpO1xuICogICAgICB2YXIgYmFyID0geWllbGQgZ2V0QmFyUHJvbWlzZSgpO1xuICogICAgICBRLnJldHVybihmb28gKyBiYXIpO1xuICogfSlcbiAqL1xuUVtcInJldHVyblwiXSA9IF9yZXR1cm47XG5mdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IFFSZXR1cm5WYWx1ZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogVGhlIHByb21pc2VkIGZ1bmN0aW9uIGRlY29yYXRvciBlbnN1cmVzIHRoYXQgYW55IHByb21pc2UgYXJndW1lbnRzXG4gKiBhcmUgc2V0dGxlZCBhbmQgcGFzc2VkIGFzIHZhbHVlcyAoYHRoaXNgIGlzIGFsc28gc2V0dGxlZCBhbmQgcGFzc2VkXG4gKiBhcyBhIHZhbHVlKS4gIEl0IHdpbGwgYWxzbyBlbnN1cmUgdGhhdCB0aGUgcmVzdWx0IG9mIGEgZnVuY3Rpb24gaXNcbiAqIGFsd2F5cyBhIHByb21pc2UuXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBhZGQgPSBRLnByb21pc2VkKGZ1bmN0aW9uIChhLCBiKSB7XG4gKiAgICAgcmV0dXJuIGEgKyBiO1xuICogfSk7XG4gKiBhZGQoUShhKSwgUShCKSk7XG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGRlY29yYXRlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdGhhdCBoYXMgYmVlbiBkZWNvcmF0ZWQuXG4gKi9cblEucHJvbWlzZWQgPSBwcm9taXNlZDtcbmZ1bmN0aW9uIHByb21pc2VkKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHNwcmVhZChbdGhpcywgYWxsKGFyZ3VtZW50cyldLCBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIHNlbmRzIGEgbWVzc2FnZSB0byBhIHZhbHVlIGluIGEgZnV0dXJlIHR1cm5cbiAqIEBwYXJhbSBvYmplY3QqIHRoZSByZWNpcGllbnRcbiAqIEBwYXJhbSBvcCB0aGUgbmFtZSBvZiB0aGUgbWVzc2FnZSBvcGVyYXRpb24sIGUuZy4sIFwid2hlblwiLFxuICogQHBhcmFtIGFyZ3MgZnVydGhlciBhcmd1bWVudHMgdG8gYmUgZm9yd2FyZGVkIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIHJlc3VsdCB7UHJvbWlzZX0gYSBwcm9taXNlIGZvciB0aGUgcmVzdWx0IG9mIHRoZSBvcGVyYXRpb25cbiAqL1xuUS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuZnVuY3Rpb24gZGlzcGF0Y2gob2JqZWN0LCBvcCwgYXJncykge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2gob3AsIGFyZ3MpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uIChvcCwgYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIFEubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnByb21pc2VEaXNwYXRjaChkZWZlcnJlZC5yZXNvbHZlLCBvcCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIG9mIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZ2V0XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuICovXG5RLmdldCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleSkge1xuICAgIHJldHVybiBRKG9iamVjdCkuZGlzcGF0Y2goXCJnZXRcIiwgW2tleV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwiZ2V0XCIsIFtrZXldKTtcbn07XG5cbi8qKlxuICogU2V0cyB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIG9iamVjdCBvYmplY3RcbiAqIEBwYXJhbSBuYW1lICAgICAgbmFtZSBvZiBwcm9wZXJ0eSB0byBzZXRcbiAqIEBwYXJhbSB2YWx1ZSAgICAgbmV3IHZhbHVlIG9mIHByb3BlcnR5XG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5zZXQgPSBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcInNldFwiLCBba2V5LCB2YWx1ZV0pO1xufTtcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgcHJvcGVydHkgdG8gZGVsZXRlXG4gKiBAcmV0dXJuIHByb21pc2UgZm9yIHRoZSByZXR1cm4gdmFsdWVcbiAqL1xuUS5kZWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiZGVsZXRlXCJdID0gZnVuY3Rpb24gKG9iamVjdCwga2V5KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImRlbGV0ZVwiXSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImRlbGV0ZVwiLCBba2V5XSk7XG59O1xuXG4vKipcbiAqIEludm9rZXMgYSBtZXRob2QgaW4gYSBmdXR1cmUgdHVybi5cbiAqIEBwYXJhbSBvYmplY3QgICAgcHJvbWlzZSBvciBpbW1lZGlhdGUgcmVmZXJlbmNlIGZvciB0YXJnZXQgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSAgICAgIG5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICogQHBhcmFtIHZhbHVlICAgICBhIHZhbHVlIHRvIHBvc3QsIHR5cGljYWxseSBhbiBhcnJheSBvZlxuICogICAgICAgICAgICAgICAgICBpbnZvY2F0aW9uIGFyZ3VtZW50cyBmb3IgcHJvbWlzZXMgdGhhdFxuICogICAgICAgICAgICAgICAgICBhcmUgdWx0aW1hdGVseSBiYWNrZWQgd2l0aCBgcmVzb2x2ZWAgdmFsdWVzLFxuICogICAgICAgICAgICAgICAgICBhcyBvcHBvc2VkIHRvIHRob3NlIGJhY2tlZCB3aXRoIFVSTHNcbiAqICAgICAgICAgICAgICAgICAgd2hlcmVpbiB0aGUgcG9zdGVkIHZhbHVlIGNhbiBiZSBhbnlcbiAqICAgICAgICAgICAgICAgICAgSlNPTiBzZXJpYWxpemFibGUgb2JqZWN0LlxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlXG4gKi9cbi8vIGJvdW5kIGxvY2FsbHkgYmVjYXVzZSBpdCBpcyB1c2VkIGJ5IG90aGVyIG1ldGhvZHNcblEubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblEucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubWFwcGx5ID0gLy8gWFhYIEFzIHByb3Bvc2VkIGJ5IFwiUmVkc2FuZHJvXCJcblByb21pc2UucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAobmFtZSwgYXJncykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJnc10pO1xufTtcblxuLyoqXG4gKiBJbnZva2VzIGEgbWV0aG9kIGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHBhcmFtIG5hbWUgICAgICBuYW1lIG9mIG1ldGhvZCB0byBpbnZva2VcbiAqIEBwYXJhbSAuLi5hcmdzICAgYXJyYXkgb2YgaW52b2NhdGlvbiBhcmd1bWVudHNcbiAqIEByZXR1cm4gcHJvbWlzZSBmb3IgdGhlIHJldHVybiB2YWx1ZVxuICovXG5RLnNlbmQgPSAvLyBYWFggTWFyayBNaWxsZXIncyBwcm9wb3NlZCBwYXJsYW5jZVxuUS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5RLmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAyKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuc2VuZCA9IC8vIFhYWCBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIHBhcmxhbmNlXG5Qcm9taXNlLnByb3RvdHlwZS5tY2FsbCA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5pbnZva2UgPSBmdW5jdGlvbiAobmFtZSAvKi4uLmFyZ3MqLykge1xuICAgIHJldHVybiB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIGFyZ3MgICAgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUS5mYXBwbHkgPSBmdW5jdGlvbiAob2JqZWN0LCBhcmdzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFyZ3NdKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhcHBseSA9IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goXCJhcHBseVwiLCBbdm9pZCAwLCBhcmdzXSk7XG59O1xuXG4vKipcbiAqIENhbGxzIHRoZSBwcm9taXNlZCBmdW5jdGlvbiBpbiBhIGZ1dHVyZSB0dXJuLlxuICogQHBhcmFtIG9iamVjdCAgICBwcm9taXNlIG9yIGltbWVkaWF0ZSByZWZlcmVuY2UgZm9yIHRhcmdldCBmdW5jdGlvblxuICogQHBhcmFtIC4uLmFyZ3MgICBhcnJheSBvZiBhcHBsaWNhdGlvbiBhcmd1bWVudHNcbiAqL1xuUVtcInRyeVwiXSA9XG5RLmZjYWxsID0gZnVuY3Rpb24gKG9iamVjdCAvKiAuLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gUShvYmplY3QpLmRpc3BhdGNoKFwiYXBwbHlcIiwgW3ZvaWQgMCwgYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKV0pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUuZmNhbGwgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImFwcGx5XCIsIFt2b2lkIDAsIGFycmF5X3NsaWNlKGFyZ3VtZW50cyldKTtcbn07XG5cbi8qKlxuICogQmluZHMgdGhlIHByb21pc2VkIGZ1bmN0aW9uLCB0cmFuc2Zvcm1pbmcgcmV0dXJuIHZhbHVlcyBpbnRvIGEgZnVsZmlsbGVkXG4gKiBwcm9taXNlIGFuZCB0aHJvd24gZXJyb3JzIGludG8gYSByZWplY3RlZCBvbmUuXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IGZ1bmN0aW9uXG4gKiBAcGFyYW0gLi4uYXJncyAgIGFycmF5IG9mIGFwcGxpY2F0aW9uIGFyZ3VtZW50c1xuICovXG5RLmZiaW5kID0gZnVuY3Rpb24gKG9iamVjdCAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBwcm9taXNlID0gUShvYmplY3QpO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblByb21pc2UucHJvdG90eXBlLmZiaW5kID0gZnVuY3Rpb24gKC8qLi4uYXJncyovKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmJvdW5kKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS5kaXNwYXRjaChcImFwcGx5XCIsIFtcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBhcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKVxuICAgICAgICBdKTtcbiAgICB9O1xufTtcblxuLyoqXG4gKiBSZXF1ZXN0cyB0aGUgbmFtZXMgb2YgdGhlIG93bmVkIHByb3BlcnRpZXMgb2YgYSBwcm9taXNlZFxuICogb2JqZWN0IGluIGEgZnV0dXJlIHR1cm4uXG4gKiBAcGFyYW0gb2JqZWN0ICAgIHByb21pc2Ugb3IgaW1tZWRpYXRlIHJlZmVyZW5jZSBmb3IgdGFyZ2V0IG9iamVjdFxuICogQHJldHVybiBwcm9taXNlIGZvciB0aGUga2V5cyBvZiB0aGUgZXZlbnR1YWxseSBzZXR0bGVkIG9iamVjdFxuICovXG5RLmtleXMgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChcImtleXNcIiwgW10pO1xufTtcblxuLyoqXG4gKiBUdXJucyBhbiBhcnJheSBvZiBwcm9taXNlcyBpbnRvIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkuICBJZiBhbnkgb2ZcbiAqIHRoZSBwcm9taXNlcyBnZXRzIHJlamVjdGVkLCB0aGUgd2hvbGUgYXJyYXkgaXMgcmVqZWN0ZWQgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FycmF5Kn0gYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqL1xuLy8gQnkgTWFyayBNaWxsZXJcbi8vIGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPXN0cmF3bWFuOmNvbmN1cnJlbmN5JnJldj0xMzA4Nzc2NTIxI2FsbGZ1bGZpbGxlZFxuUS5hbGwgPSBhbGw7XG5mdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICByZXR1cm4gd2hlbihwcm9taXNlcywgZnVuY3Rpb24gKHByb21pc2VzKSB7XG4gICAgICAgIHZhciBwZW5kaW5nQ291bnQgPSAwO1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgICAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uICh1bmRlZmluZWQsIHByb21pc2UsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc25hcHNob3Q7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaXNQcm9taXNlKHByb21pc2UpICYmXG4gICAgICAgICAgICAgICAgKHNuYXBzaG90ID0gcHJvbWlzZS5pbnNwZWN0KCkpLnN0YXRlID09PSBcImZ1bGZpbGxlZFwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSBzbmFwc2hvdC52YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nQ291bnQ7XG4gICAgICAgICAgICAgICAgd2hlbihcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLXBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocHJvbWlzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQubm90aWZ5KHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogcHJvZ3Jlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB2b2lkIDApO1xuICAgICAgICBpZiAocGVuZGluZ0NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHByb21pc2VzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBhbGwodGhpcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2Ugb2YgYW4gYXJyYXkuIFByaW9yIHJlamVjdGVkIHByb21pc2VzIGFyZVxuICogaWdub3JlZC4gIFJlamVjdHMgb25seSBpZiBhbGwgcHJvbWlzZXMgYXJlIHJlamVjdGVkLlxuICogQHBhcmFtIHtBcnJheSp9IGFuIGFycmF5IGNvbnRhaW5pbmcgdmFsdWVzIG9yIHByb21pc2VzIGZvciB2YWx1ZXNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmdWxmaWxsZWQgd2l0aCB0aGUgdmFsdWUgb2YgdGhlIGZpcnN0IHJlc29sdmVkIHByb21pc2UsXG4gKiBvciBhIHJlamVjdGVkIHByb21pc2UgaWYgYWxsIHByb21pc2VzIGFyZSByZWplY3RlZC5cbiAqL1xuUS5hbnkgPSBhbnk7XG5cbmZ1bmN0aW9uIGFueShwcm9taXNlcykge1xuICAgIGlmIChwcm9taXNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFEucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcbiAgICB2YXIgcGVuZGluZ0NvdW50ID0gMDtcbiAgICBhcnJheV9yZWR1Y2UocHJvbWlzZXMsIGZ1bmN0aW9uIChwcmV2LCBjdXJyZW50LCBpbmRleCkge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2luZGV4XTtcblxuICAgICAgICBwZW5kaW5nQ291bnQrKztcblxuICAgICAgICB3aGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBvblByb2dyZXNzKTtcbiAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQocmVzdWx0KSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlcnIpIHtcbiAgICAgICAgICAgIHBlbmRpbmdDb3VudC0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gKFwiUSBjYW4ndCBnZXQgZnVsZmlsbG1lbnQgdmFsdWUgZnJvbSBhbnkgcHJvbWlzZSwgYWxsIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJwcm9taXNlcyB3ZXJlIHJlamVjdGVkLiBMYXN0IGVycm9yIG1lc3NhZ2U6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLm5vdGlmeSh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9ncmVzc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB1bmRlZmluZWQpO1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG5cblByb21pc2UucHJvdG90eXBlLmFueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gYW55KHRoaXMpO1xufTtcblxuLyoqXG4gKiBXYWl0cyBmb3IgYWxsIHByb21pc2VzIHRvIGJlIHNldHRsZWQsIGVpdGhlciBmdWxmaWxsZWQgb3JcbiAqIHJlamVjdGVkLiAgVGhpcyBpcyBkaXN0aW5jdCBmcm9tIGBhbGxgIHNpbmNlIHRoYXQgd291bGQgc3RvcFxuICogd2FpdGluZyBhdCB0aGUgZmlyc3QgcmVqZWN0aW9uLiAgVGhlIHByb21pc2UgcmV0dXJuZWQgYnlcbiAqIGBhbGxSZXNvbHZlZGAgd2lsbCBuZXZlciBiZSByZWplY3RlZC5cbiAqIEBwYXJhbSBwcm9taXNlcyBhIHByb21pc2UgZm9yIGFuIGFycmF5IChvciBhbiBhcnJheSkgb2YgcHJvbWlzZXNcbiAqIChvciB2YWx1ZXMpXG4gKiBAcmV0dXJuIGEgcHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgcHJvbWlzZXNcbiAqL1xuUS5hbGxSZXNvbHZlZCA9IGRlcHJlY2F0ZShhbGxSZXNvbHZlZCwgXCJhbGxSZXNvbHZlZFwiLCBcImFsbFNldHRsZWRcIik7XG5mdW5jdGlvbiBhbGxSZXNvbHZlZChwcm9taXNlcykge1xuICAgIHJldHVybiB3aGVuKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcHJvbWlzZXMgPSBhcnJheV9tYXAocHJvbWlzZXMsIFEpO1xuICAgICAgICByZXR1cm4gd2hlbihhbGwoYXJyYXlfbWFwKHByb21pc2VzLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHdoZW4ocHJvbWlzZSwgbm9vcCwgbm9vcCk7XG4gICAgICAgIH0pKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VzO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUuYWxsUmVzb2x2ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFsbFJlc29sdmVkKHRoaXMpO1xufTtcblxuLyoqXG4gKiBAc2VlIFByb21pc2UjYWxsU2V0dGxlZFxuICovXG5RLmFsbFNldHRsZWQgPSBhbGxTZXR0bGVkO1xuZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlcykge1xuICAgIHJldHVybiBRKHByb21pc2VzKS5hbGxTZXR0bGVkKCk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gYXJyYXkgb2YgcHJvbWlzZXMgaW50byBhIHByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRoZWlyIHN0YXRlcyAoYXNcbiAqIHJldHVybmVkIGJ5IGBpbnNwZWN0YCkgd2hlbiB0aGV5IGhhdmUgYWxsIHNldHRsZWQuXG4gKiBAcGFyYW0ge0FycmF5W0FueSpdfSB2YWx1ZXMgYW4gYXJyYXkgKG9yIHByb21pc2UgZm9yIGFuIGFycmF5KSBvZiB2YWx1ZXMgKG9yXG4gKiBwcm9taXNlcyBmb3IgdmFsdWVzKVxuICogQHJldHVybnMge0FycmF5W1N0YXRlXX0gYW4gYXJyYXkgb2Ygc3RhdGVzIGZvciB0aGUgcmVzcGVjdGl2ZSB2YWx1ZXMuXG4gKi9cblByb21pc2UucHJvdG90eXBlLmFsbFNldHRsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAocHJvbWlzZXMpIHtcbiAgICAgICAgcmV0dXJuIGFsbChhcnJheV9tYXAocHJvbWlzZXMsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgICAgICBwcm9taXNlID0gUShwcm9taXNlKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlZ2FyZGxlc3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2UuaW5zcGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihyZWdhcmRsZXNzLCByZWdhcmRsZXNzKTtcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlcyB0aGUgZmFpbHVyZSBvZiBhIHByb21pc2UsIGdpdmluZyBhbiBvcG9ydHVuaXR5IHRvIHJlY292ZXJcbiAqIHdpdGggYSBjYWxsYmFjay4gIElmIHRoZSBnaXZlbiBwcm9taXNlIGlzIGZ1bGZpbGxlZCwgdGhlIHJldHVybmVkXG4gKiBwcm9taXNlIGlzIGZ1bGZpbGxlZC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZSBmb3Igc29tZXRoaW5nXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBmdWxmaWxsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlmIHRoZVxuICogZ2l2ZW4gcHJvbWlzZSBpcyByZWplY3RlZFxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBjYWxsYmFja1xuICovXG5RLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5RW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCByZWplY3RlZCkge1xuICAgIHJldHVybiBRKG9iamVjdCkudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZhaWwgPSAvLyBYWFggbGVnYWN5XG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKHJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHJlamVjdGVkKTtcbn07XG5cbi8qKlxuICogQXR0YWNoZXMgYSBsaXN0ZW5lciB0aGF0IGNhbiByZXNwb25kIHRvIHByb2dyZXNzIG5vdGlmaWNhdGlvbnMgZnJvbSBhXG4gKiBwcm9taXNlJ3Mgb3JpZ2luYXRpbmcgZGVmZXJyZWQuIFRoaXMgbGlzdGVuZXIgcmVjZWl2ZXMgdGhlIGV4YWN0IGFyZ3VtZW50c1xuICogcGFzc2VkIHRvIGBgZGVmZXJyZWQubm90aWZ5YGAuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgZm9yIHNvbWV0aGluZ1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgdG8gcmVjZWl2ZSBhbnkgcHJvZ3Jlc3Mgbm90aWZpY2F0aW9uc1xuICogQHJldHVybnMgdGhlIGdpdmVuIHByb21pc2UsIHVuY2hhbmdlZFxuICovXG5RLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG5mdW5jdGlvbiBwcm9ncmVzcyhvYmplY3QsIHByb2dyZXNzZWQpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLnRoZW4odm9pZCAwLCB2b2lkIDAsIHByb2dyZXNzZWQpO1xufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uIChwcm9ncmVzc2VkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih2b2lkIDAsIHZvaWQgMCwgcHJvZ3Jlc3NlZCk7XG59O1xuXG4vKipcbiAqIFByb3ZpZGVzIGFuIG9wcG9ydHVuaXR5IHRvIG9ic2VydmUgdGhlIHNldHRsaW5nIG9mIGEgcHJvbWlzZSxcbiAqIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgcHJvbWlzZSBpcyBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuICBGb3J3YXJkc1xuICogdGhlIHJlc29sdXRpb24gdG8gdGhlIHJldHVybmVkIHByb21pc2Ugd2hlbiB0aGUgY2FsbGJhY2sgaXMgZG9uZS5cbiAqIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBjb21wbGV0aW9uLlxuICogQHBhcmFtIHtBbnkqfSBwcm9taXNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB0byBvYnNlcnZlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlblxuICogcHJvbWlzZSwgdGFrZXMgbm8gYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgZ2l2ZW4gcHJvbWlzZSB3aGVuXG4gKiBgYGZpbmBgIGlzIGRvbmUuXG4gKi9cblEuZmluID0gLy8gWFhYIGxlZ2FjeVxuUVtcImZpbmFsbHlcIl0gPSBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaykge1xuICAgIHJldHVybiBRKG9iamVjdClbXCJmaW5hbGx5XCJdKGNhbGxiYWNrKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmZpbiA9IC8vIFhYWCBsZWdhY3lcblByb21pc2UucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2sgfHwgdHlwZW9mIGNhbGxiYWNrLmFwcGx5ICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUSBjYW4ndCBhcHBseSBmaW5hbGx5IGNhbGxiYWNrXCIpO1xuICAgIH1cbiAgICBjYWxsYmFjayA9IFEoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjay5mY2FsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRPRE8gYXR0ZW1wdCB0byByZWN5Y2xlIHRoZSByZWplY3Rpb24gd2l0aCBcInRoaXNcIi5cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmZjYWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBUZXJtaW5hdGVzIGEgY2hhaW4gb2YgcHJvbWlzZXMsIGZvcmNpbmcgcmVqZWN0aW9ucyB0byBiZVxuICogdGhyb3duIGFzIGV4Y2VwdGlvbnMuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2UgYXQgdGhlIGVuZCBvZiBhIGNoYWluIG9mIHByb21pc2VzXG4gKiBAcmV0dXJucyBub3RoaW5nXG4gKi9cblEuZG9uZSA9IGZ1bmN0aW9uIChvYmplY3QsIGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5kb25lKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIHByb2dyZXNzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIHtcbiAgICB2YXIgb25VbmhhbmRsZWRFcnJvciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAvLyBmb3J3YXJkIHRvIGEgZnV0dXJlIHR1cm4gc28gdGhhdCBgYHdoZW5gYFxuICAgICAgICAvLyBkb2VzIG5vdCBjYXRjaCBpdCBhbmQgdHVybiBpdCBpbnRvIGEgcmVqZWN0aW9uLlxuICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1ha2VTdGFja1RyYWNlTG9uZyhlcnJvciwgcHJvbWlzZSk7XG4gICAgICAgICAgICBpZiAoUS5vbmVycm9yKSB7XG4gICAgICAgICAgICAgICAgUS5vbmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBdm9pZCB1bm5lY2Vzc2FyeSBgbmV4dFRpY2tgaW5nIHZpYSBhbiB1bm5lY2Vzc2FyeSBgd2hlbmAuXG4gICAgdmFyIHByb21pc2UgPSBmdWxmaWxsZWQgfHwgcmVqZWN0ZWQgfHwgcHJvZ3Jlc3MgP1xuICAgICAgICB0aGlzLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCwgcHJvZ3Jlc3MpIDpcbiAgICAgICAgdGhpcztcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzICYmIHByb2Nlc3MuZG9tYWluKSB7XG4gICAgICAgIG9uVW5oYW5kbGVkRXJyb3IgPSBwcm9jZXNzLmRvbWFpbi5iaW5kKG9uVW5oYW5kbGVkRXJyb3IpO1xuICAgIH1cblxuICAgIHByb21pc2UudGhlbih2b2lkIDAsIG9uVW5oYW5kbGVkRXJyb3IpO1xufTtcblxuLyoqXG4gKiBDYXVzZXMgYSBwcm9taXNlIHRvIGJlIHJlamVjdGVkIGlmIGl0IGRvZXMgbm90IGdldCBmdWxmaWxsZWQgYmVmb3JlXG4gKiBzb21lIG1pbGxpc2Vjb25kcyB0aW1lIG91dC5cbiAqIEBwYXJhbSB7QW55Kn0gcHJvbWlzZVxuICogQHBhcmFtIHtOdW1iZXJ9IG1pbGxpc2Vjb25kcyB0aW1lb3V0XG4gKiBAcGFyYW0ge0FueSp9IGN1c3RvbSBlcnJvciBtZXNzYWdlIG9yIEVycm9yIG9iamVjdCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlIGlmIGl0IGlzXG4gKiBmdWxmaWxsZWQgYmVmb3JlIHRoZSB0aW1lb3V0LCBvdGhlcndpc2UgcmVqZWN0ZWQuXG4gKi9cblEudGltZW91dCA9IGZ1bmN0aW9uIChvYmplY3QsIG1zLCBlcnJvcikge1xuICAgIHJldHVybiBRKG9iamVjdCkudGltZW91dChtcywgZXJyb3IpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uIChtcywgZXJyb3IpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIHZhciB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFlcnJvciB8fCBcInN0cmluZ1wiID09PSB0eXBlb2YgZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gbmV3IEVycm9yKGVycm9yIHx8IFwiVGltZWQgb3V0IGFmdGVyIFwiICsgbXMgKyBcIiBtc1wiKTtcbiAgICAgICAgICAgIGVycm9yLmNvZGUgPSBcIkVUSU1FRE9VVFwiO1xuICAgICAgICB9XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgfSwgbXMpO1xuXG4gICAgdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gKGV4Y2VwdGlvbikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGV4Y2VwdGlvbik7XG4gICAgfSwgZGVmZXJyZWQubm90aWZ5KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIGdpdmVuIHZhbHVlIChvciBwcm9taXNlZCB2YWx1ZSksIHNvbWVcbiAqIG1pbGxpc2Vjb25kcyBhZnRlciBpdCByZXNvbHZlZC4gUGFzc2VzIHJlamVjdGlvbnMgaW1tZWRpYXRlbHkuXG4gKiBAcGFyYW0ge0FueSp9IHByb21pc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIGEgcHJvbWlzZSBmb3IgdGhlIHJlc29sdXRpb24gb2YgdGhlIGdpdmVuIHByb21pc2UgYWZ0ZXIgbWlsbGlzZWNvbmRzXG4gKiB0aW1lIGhhcyBlbGFwc2VkIHNpbmNlIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBnaXZlbiBwcm9taXNlLlxuICogSWYgdGhlIGdpdmVuIHByb21pc2UgcmVqZWN0cywgdGhhdCBpcyBwYXNzZWQgaW1tZWRpYXRlbHkuXG4gKi9cblEuZGVsYXkgPSBmdW5jdGlvbiAob2JqZWN0LCB0aW1lb3V0KSB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHZvaWQgMCkge1xuICAgICAgICB0aW1lb3V0ID0gb2JqZWN0O1xuICAgICAgICBvYmplY3QgPSB2b2lkIDA7XG4gICAgfVxuICAgIHJldHVybiBRKG9iamVjdCkuZGVsYXkodGltZW91dCk7XG59O1xuXG5Qcm9taXNlLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uICh0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBQYXNzZXMgYSBjb250aW51YXRpb24gdG8gYSBOb2RlIGZ1bmN0aW9uLCB3aGljaCBpcyBjYWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAqIGFyZ3VtZW50cyBwcm92aWRlZCBhcyBhbiBhcnJheSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICpcbiAqICAgICAgUS5uZmFwcGx5KEZTLnJlYWRGaWxlLCBbX19maWxlbmFtZV0pXG4gKiAgICAgIC50aGVuKGZ1bmN0aW9uIChjb250ZW50KSB7XG4gKiAgICAgIH0pXG4gKlxuICovXG5RLm5mYXBwbHkgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYXBwbHkgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIHRoaXMuZmFwcGx5KG5vZGVBcmdzKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFBhc3NlcyBhIGNvbnRpbnVhdGlvbiB0byBhIE5vZGUgZnVuY3Rpb24sIHdoaWNoIGlzIGNhbGxlZCB3aXRoIHRoZSBnaXZlblxuICogYXJndW1lbnRzIHByb3ZpZGVkIGluZGl2aWR1YWxseSwgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZjYWxsKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKVxuICogLnRoZW4oZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAqIH0pXG4gKlxuICovXG5RLm5mY2FsbCA9IGZ1bmN0aW9uIChjYWxsYmFjayAvKi4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gUShjYWxsYmFjaykubmZhcHBseShhcmdzKTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mY2FsbCA9IGZ1bmN0aW9uICgvKi4uLmFyZ3MqLykge1xuICAgIHZhciBub2RlQXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogV3JhcHMgYSBOb2RlSlMgY29udGludWF0aW9uIHBhc3NpbmcgZnVuY3Rpb24gYW5kIHJldHVybnMgYW4gZXF1aXZhbGVudFxuICogdmVyc2lvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlLlxuICogQGV4YW1wbGVcbiAqIFEubmZiaW5kKEZTLnJlYWRGaWxlLCBfX2ZpbGVuYW1lKShcInV0Zi04XCIpXG4gKiAudGhlbihjb25zb2xlLmxvZylcbiAqIC5kb25lKClcbiAqL1xuUS5uZmJpbmQgPVxuUS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoY2FsbGJhY2sgLyouLi5hcmdzKi8pIHtcbiAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJRIGNhbid0IHdyYXAgYW4gdW5kZWZpbmVkIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBRKGNhbGxiYWNrKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5mYmluZCA9XG5Qcm9taXNlLnByb3RvdHlwZS5kZW5vZGVpZnkgPSBmdW5jdGlvbiAoLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IGFycmF5X3NsaWNlKGFyZ3VtZW50cyk7XG4gICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgIHJldHVybiBRLmRlbm9kZWlmeS5hcHBseSh2b2lkIDAsIGFyZ3MpO1xufTtcblxuUS5uYmluZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc3AgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgYmFzZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlQXJncyA9IGJhc2VBcmdzLmNvbmNhdChhcnJheV9zbGljZShhcmd1bWVudHMpKTtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICAgICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgICAgICBmdW5jdGlvbiBib3VuZCgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzcCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBRKGJvdW5kKS5mYXBwbHkobm9kZUFyZ3MpLmZhaWwoZGVmZXJyZWQucmVqZWN0KTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbn07XG5cblByb21pc2UucHJvdG90eXBlLm5iaW5kID0gZnVuY3Rpb24gKC8qdGhpc3AsIC4uLmFyZ3MqLykge1xuICAgIHZhciBhcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAwKTtcbiAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgcmV0dXJuIFEubmJpbmQuYXBwbHkodm9pZCAwLCBhcmdzKTtcbn07XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb2YgYSBOb2RlLXN0eWxlIG9iamVjdCB0aGF0IGFjY2VwdHMgYSBOb2RlLXN0eWxlXG4gKiBjYWxsYmFjayB3aXRoIGEgZ2l2ZW4gYXJyYXkgb2YgYXJndW1lbnRzLCBwbHVzIGEgcHJvdmlkZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2Q7IHRoZSBjYWxsYmFja1xuICogd2lsbCBiZSBwcm92aWRlZCBieSBRIGFuZCBhcHBlbmRlZCB0byB0aGVzZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJucyBhIHByb21pc2UgZm9yIHRoZSB2YWx1ZSBvciBlcnJvclxuICovXG5RLm5tYXBwbHkgPSAvLyBYWFggQXMgcHJvcG9zZWQgYnkgXCJSZWRzYW5kcm9cIlxuUS5ucG9zdCA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gUShvYmplY3QpLm5wb3N0KG5hbWUsIGFyZ3MpO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubm1hcHBseSA9IC8vIFhYWCBBcyBwcm9wb3NlZCBieSBcIlJlZHNhbmRyb1wiXG5Qcm9taXNlLnByb3RvdHlwZS5ucG9zdCA9IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJncyB8fCBbXSk7XG4gICAgdmFyIGRlZmVycmVkID0gZGVmZXIoKTtcbiAgICBub2RlQXJncy5wdXNoKGRlZmVycmVkLm1ha2VOb2RlUmVzb2x2ZXIoKSk7XG4gICAgdGhpcy5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvZiBhIE5vZGUtc3R5bGUgb2JqZWN0IHRoYXQgYWNjZXB0cyBhIE5vZGUtc3R5bGVcbiAqIGNhbGxiYWNrLCBmb3J3YXJkaW5nIHRoZSBnaXZlbiB2YXJpYWRpYyBhcmd1bWVudHMsIHBsdXMgYSBwcm92aWRlZFxuICogY2FsbGJhY2sgYXJndW1lbnQuXG4gKiBAcGFyYW0gb2JqZWN0IGFuIG9iamVjdCB0aGF0IGhhcyB0aGUgbmFtZWQgbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBtZXRob2Qgb2Ygb2JqZWN0XG4gKiBAcGFyYW0gLi4uYXJncyBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kOyB0aGUgY2FsbGJhY2sgd2lsbFxuICogYmUgcHJvdmlkZWQgYnkgUSBhbmQgYXBwZW5kZWQgdG8gdGhlc2UgYXJndW1lbnRzLlxuICogQHJldHVybnMgYSBwcm9taXNlIGZvciB0aGUgdmFsdWUgb3IgZXJyb3JcbiAqL1xuUS5uc2VuZCA9IC8vIFhYWCBCYXNlZCBvbiBNYXJrIE1pbGxlcidzIHByb3Bvc2VkIFwic2VuZFwiXG5RLm5tY2FsbCA9IC8vIFhYWCBCYXNlZCBvbiBcIlJlZHNhbmRybydzXCIgcHJvcG9zYWxcblEubmludm9rZSA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWUgLyouLi5hcmdzKi8pIHtcbiAgICB2YXIgbm9kZUFyZ3MgPSBhcnJheV9zbGljZShhcmd1bWVudHMsIDIpO1xuICAgIHZhciBkZWZlcnJlZCA9IGRlZmVyKCk7XG4gICAgbm9kZUFyZ3MucHVzaChkZWZlcnJlZC5tYWtlTm9kZVJlc29sdmVyKCkpO1xuICAgIFEob2JqZWN0KS5kaXNwYXRjaChcInBvc3RcIiwgW25hbWUsIG5vZGVBcmdzXSkuZmFpbChkZWZlcnJlZC5yZWplY3QpO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufTtcblxuUHJvbWlzZS5wcm90b3R5cGUubnNlbmQgPSAvLyBYWFggQmFzZWQgb24gTWFyayBNaWxsZXIncyBwcm9wb3NlZCBcInNlbmRcIlxuUHJvbWlzZS5wcm90b3R5cGUubm1jYWxsID0gLy8gWFhYIEJhc2VkIG9uIFwiUmVkc2FuZHJvJ3NcIiBwcm9wb3NhbFxuUHJvbWlzZS5wcm90b3R5cGUubmludm9rZSA9IGZ1bmN0aW9uIChuYW1lIC8qLi4uYXJncyovKSB7XG4gICAgdmFyIG5vZGVBcmdzID0gYXJyYXlfc2xpY2UoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIG5vZGVBcmdzLnB1c2goZGVmZXJyZWQubWFrZU5vZGVSZXNvbHZlcigpKTtcbiAgICB0aGlzLmRpc3BhdGNoKFwicG9zdFwiLCBbbmFtZSwgbm9kZUFyZ3NdKS5mYWlsKGRlZmVycmVkLnJlamVjdCk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIElmIGEgZnVuY3Rpb24gd291bGQgbGlrZSB0byBzdXBwb3J0IGJvdGggTm9kZSBjb250aW51YXRpb24tcGFzc2luZy1zdHlsZSBhbmRcbiAqIHByb21pc2UtcmV0dXJuaW5nLXN0eWxlLCBpdCBjYW4gZW5kIGl0cyBpbnRlcm5hbCBwcm9taXNlIGNoYWluIHdpdGhcbiAqIGBub2RlaWZ5KG5vZGViYWNrKWAsIGZvcndhcmRpbmcgdGhlIG9wdGlvbmFsIG5vZGViYWNrIGFyZ3VtZW50LiAgSWYgdGhlIHVzZXJcbiAqIGVsZWN0cyB0byB1c2UgYSBub2RlYmFjaywgdGhlIHJlc3VsdCB3aWxsIGJlIHNlbnQgdGhlcmUuICBJZiB0aGV5IGRvIG5vdFxuICogcGFzcyBhIG5vZGViYWNrLCB0aGV5IHdpbGwgcmVjZWl2ZSB0aGUgcmVzdWx0IHByb21pc2UuXG4gKiBAcGFyYW0gb2JqZWN0IGEgcmVzdWx0IChvciBhIHByb21pc2UgZm9yIGEgcmVzdWx0KVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZWJhY2sgYSBOb2RlLmpzLXN0eWxlIGNhbGxiYWNrXG4gKiBAcmV0dXJucyBlaXRoZXIgdGhlIHByb21pc2Ugb3Igbm90aGluZ1xuICovXG5RLm5vZGVpZnkgPSBub2RlaWZ5O1xuZnVuY3Rpb24gbm9kZWlmeShvYmplY3QsIG5vZGViYWNrKSB7XG4gICAgcmV0dXJuIFEob2JqZWN0KS5ub2RlaWZ5KG5vZGViYWNrKTtcbn1cblxuUHJvbWlzZS5wcm90b3R5cGUubm9kZWlmeSA9IGZ1bmN0aW9uIChub2RlYmFjaykge1xuICAgIGlmIChub2RlYmFjaykge1xuICAgICAgICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBRLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBub2RlYmFjayhlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcblxuUS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUS5ub0NvbmZsaWN0IG9ubHkgd29ya3Mgd2hlbiBRIGlzIHVzZWQgYXMgYSBnbG9iYWxcIik7XG59O1xuXG4vLyBBbGwgY29kZSBiZWZvcmUgdGhpcyBwb2ludCB3aWxsIGJlIGZpbHRlcmVkIGZyb20gc3RhY2sgdHJhY2VzLlxudmFyIHFFbmRpbmdMaW5lID0gY2FwdHVyZUxpbmUoKTtcblxucmV0dXJuIFE7XG5cbn0pO1xuIiwidmFyIGJhY2sgPSBmdW5jdGlvbigpe1xuXG4gIHRoaXMubGlzdCA9IHt9O1xuICB0aGlzLmRlZmF1bHQgPSBudWxsO1xuXG4gIHRoaXMuTUVOVSAgICAgPSA4O1xuICB0aGlzLk9WRVJSSURFID0gNjtcbiAgdGhpcy5NT0RBTCAgICA9IDQ7XG4gIHRoaXMuRElBTE9HICAgPSAzO1xufTtcblxuYmFjay5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ocHJpb3JpdHksIGNiKXtcblxuICB0aGlzLmxpc3RbcHJpb3JpdHldID0gY2I7XG59O1xuXG5iYWNrLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMubGlzdCA9IHt9O1xufVxuXG5iYWNrLnByb3RvdHlwZS5zZXREZWZhdWx0ID0gZnVuY3Rpb24oY2Ipe1xuXG4gIHRoaXMuZGVmYXVsdCA9IGNiO1xufTtcblxuYmFjay5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24ocHJpb3JpdHkpe1xuXG4gIGRlbGV0ZSB0aGlzLmxpc3RbcHJpb3JpdHldO1xufTtcblxuYmFjay5wcm90b3R5cGUub3ZlcnJpZGUgPSBmdW5jdGlvbihjYil7XG5cbiAgdGhpcy5hZGQodGhpcy5PVkVSUklERSwgY2IpO1xufTtcblxuYmFjay5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKXtcblxuICB2YXIgY2FsbCA9IHRoaXMuZGVmYXVsdDtcbiAgXG4gIC8vOSBpcyBtYXggcHJpb3JpdHlcbiAgZm9yKHZhciBpID0gMDsgaSA8IDEwOyBpKyspe1xuICAgIFxuICAgIGlmKCEhdGhpcy5saXN0W2ldKXtcbiAgICAgIFxuICAgICAgY2FsbCA9IHRoaXMubGlzdFtpXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGNhbGwoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IGJhY2s7XG5cbiIsInZhciBRID0gcmVxdWlyZSgncScpO1xuXG52YXIgYmFzZSA9IGZ1bmN0aW9uKCl7fTtcbm1vZHVsZS5leHBvcnRzID0gYmFzZTtcblxuYmFzZS5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG4gIFxuICB2YXIgZGVmID0gUS5kZWZlcigpO1xuICBkZWYucmVzb2x2ZSgpO1xuICByZXR1cm4gZGVmLnByb21pc2U7XG59O1xuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBjb250cm9sbGVyID0gZnVuY3Rpb24ocGFyYW1zKXtcblxuICBCYXNlLmNhbGwodGhpcyk7XG5cbiAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gIHRoaXMudmlldyAgID0gbnVsbDtcbn07XG5jb250cm9sbGVyLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xuY29udHJvbGxlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb250cm9sbGVyO1xuXG5jb250cm9sbGVyLnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMudmlldy5yZW5kZXIoKTtcbn07XG5cbmNvbnRyb2xsZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpeyAvKiBGb3IgZXh0ZW5kICovICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRyb2xsZXI7XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBmb3JtID0gZnVuY3Rpb24oKXtcbiAgXG4gIHRoaXMuZWxlbWVudHMgICA9IFtdO1xuICB0aGlzLnZhbGlkYXRvcnMgPSBbXTtcbn07XG5mb3JtLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xuZm9ybS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBmb3JtO1xubW9kdWxlLmV4cG9ydHMgPSBmb3JtO1xuXG5mb3JtLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihlbGVtZW50KXtcblxuICB0aGlzLmVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG59O1xuXG5mb3JtLnByb3RvdHlwZS5hZGRWYWxpZGF0b3IgPSBmdW5jdGlvbih2YWxpZGF0b3Ipe1xuXG4gIHRoaXMudmFsaWRhdG9ycy5wdXNoKHZhbGlkYXRvcik7XG59O1xuXG5mb3JtLnByb3RvdHlwZS5pc1ZhbGlkRm9ybSA9IGZ1bmN0aW9uKGNiKXtcblxuICB2YXIgdmFsdWVzICA9IHRoaXMuZ2V0VmFsdWVzKCk7XG4gIHZhciBjbG9uZV92ID0gW107XG5cbiAgZm9yKHZhciB2IGluIHRoaXMudmFsaWRhdG9ycykgY2xvbmVfdi5wdXNoKHRoaXMudmFsaWRhdG9yc1t2XSk7XG4gIGNsb25lX3YucmV2ZXJzZSgpO1xuXG4gIHZhciBmaXJzdF92YWxpZGF0b3IgPSBjbG9uZV92LnBvcCgpO1xuICBcbiAgdmFyIGZ1bmNfdiA9IGZ1bmN0aW9uKHZhbGlkYXRvcil7XG4gIFxuICAgIC8vZW5kZWQgd2l0aG91dCBlcnJvclxuICAgIGlmKCF2YWxpZGF0b3IpIHJldHVybiBjYih0cnVlKTtcblxuICAgIHZhbGlkYXRvci5pc1ZhbGlkKHZhbHVlcywgZnVuY3Rpb24ocmVzKXtcblxuICAgICAgLy9zdG9wIHdoZW4gZmFsc2VcbiAgICAgIGlmKCFyZXMpIHJldHVybiBjYihmYWxzZSk7XG4gICAgICB2YXIgbmV4dF92YWxpZGF0b3IgPSBjbG9uZV92LnBvcCgpO1xuXG4gICAgICByZXR1cm4gZnVuY192KG5leHRfdmFsaWRhdG9yKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gZnVuY192KGZpcnN0X3ZhbGlkYXRvcik7XG59O1xuXG5mb3JtLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24oY2IsIG9iail7XG4gIFxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIHByb21pc2VzID0gW107XG4gIGZvcih2YXIgZSBpbiB0aGlzLmVsZW1lbnRzKXtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG4gICAgdmFyIGRlZiA9IFEuZGVmZXIoKTtcbiAgICAoZnVuY3Rpb24oZWxlbSwgZGVmZiwgbyl7XG4gICAgICBlbGVtLmlzVmFsaWQoZGVmZi5yZXNvbHZlLCBvKTtcbiAgICB9KShlbGVtZW50LCBkZWYsIG9iaik7XG4gICAgcHJvbWlzZXMucHVzaChkZWYucHJvbWlzZSk7XG4gIH1cblxuICBRLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihkYXRhKXtcblxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZGF0YSk7XG4gICAgdmFyIHJlcyAgPSBhcmdzLmluZGV4T2YoZmFsc2UpIDwgMDtcbiAgICBpZighcmVzKSByZXR1cm4gY2IoZmFsc2UpO1xuICAgIHJldHVybiBzZWxmLmlzVmFsaWRGb3JtKGNiKTtcbiAgfSk7XG59O1xuXG5mb3JtLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbih2YWx1ZXMpe1xuXG4gIGZvcih2YXIgZSBpbiB0aGlzLmVsZW1lbnRzKXtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG4gICAgdmFyIG5hbWUgICAgPSAhIWVsZW1lbnQubmFtZSA/IGVsZW1lbnQubmFtZSA6IGVsZW1lbnQuYXR0cignbmFtZScpO1xuICAgIGlmKCEhbmFtZSAmJiB2YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIGVsZW1lbnQudmFsKHZhbHVlc1tuYW1lXSk7XG4gIH1cbn07XG5cbmZvcm0ucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlcyA9IHt9O1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG5cbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG5cbiAgICBpZighIWVsZW1lbnQuZ2V0VmFsdWVzKXtcbiAgICAgIHZhbHVlcyA9IE9iamVjdC5hc3NpZ24odmFsdWVzLCBlbGVtZW50LmdldFZhbHVlcygpKTtcbiAgICB9ZWxzZXtcblxuICAgICAgdmFyIG5hbWUgICAgPSAhIWVsZW1lbnQubmFtZSA/IGVsZW1lbnQubmFtZSA6IGVsZW1lbnQuYXR0cignbmFtZScpO1xuICAgICAgdmFyIHZhbHVlICAgPSBlbGVtZW50LmdldFZhbHVlKCk7XG4gICAgICBpZighIW5hbWUpICB2YWx1ZXNbbmFtZV0gPSB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgPyB2YWx1ZS50cmltKCkgOiB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQmFzZSc6ICAgICAgIHJlcXVpcmUoJy4vYmFzZScpLFxuICAnRm9ybSc6ICAgICAgIHJlcXVpcmUoJy4vZm9ybScpLFxuICAnYmFjayc6ICAgICAgIHJlcXVpcmUoJy4vYmFjaycpLFxuICAnQ29udHJvbGxlcic6IHJlcXVpcmUoJy4vY29udHJvbGxlcicpLFxuICAndmlldyc6ICAgICAgIHJlcXVpcmUoJy4vdmlldy9pbmRleCcpLFxuICAndmFsaWRhdGUnOiAgIHJlcXVpcmUoJy4vdmFsaWRhdGUvaW5kZXgnKSxcbiAgJ3BsdWdpbnMnOiAgICByZXF1aXJlKCcuL3BsdWdpbnMvaW5kZXgnKSxcbn07XG4iLCJ2YXIgbWdkYXRlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGxhbmcgPSAoJChlbGVtZW50KS5kYXRhKFwibGFuZ1wiKSAhPT0gdW5kZWZpbmVkKSA/ICQoZWxlbWVudCkuZGF0YShcImxhbmdcIikgOiAncHQnO1xuICAgIGNvbnNvbGUubG9nKGxhbmcpXG4gICAgJChlbGVtZW50KS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHZhbCA9ICQodGhpcykudmFsKCk7XG4gICAgICAgICQodGhpcykuYXR0cigncmVhZG9ubHknLCB0cnVlKTtcbiAgICAgICAgdmFyIGRheSA9ICcnLCBtb250aCA9ICcnLCB5ZWFyID0gJyc7XG4gICAgICAgIHZhciBhcnJheVZhbHVlID0gdmFsLnNwbGl0KCctJylcbiAgICAgICAgdmFyIHZhbGlkID0gc2VsZi52YWxpZERhdGUoYXJyYXlWYWx1ZVsyXSwgYXJyYXlWYWx1ZVsxXSwgYXJyYXlWYWx1ZVswXSlcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkIHx8IHZhbCA9PT0gJycgfHwgdmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgZGF5ID0gdG9kYXkuZ2V0RGF0ZSgpO1xuICAgICAgICAgICAgbW9udGggPSB0b2RheS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgICAgIHllYXIgPSB0b2RheS5nZXRGdWxsWWVhcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF5ID0gTnVtYmVyKGFycmF5VmFsdWVbMl0pO1xuICAgICAgICAgICAgbW9udGggPSBOdW1iZXIoYXJyYXlWYWx1ZVsxXSk7XG4gICAgICAgICAgICB5ZWFyID0gTnVtYmVyKGFycmF5VmFsdWVbMF0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuaW5pdCgkKHRoaXMpLCBkYXksIG1vbnRoLCB5ZWFyLCBsYW5nKTtcbiAgICB9KTtcbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChlbGVtZW50LCBkYXksIG1vbnRoLCB5ZWFyLCBsYW5nKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmRheSA9IGRheTtcbiAgICB0aGlzLm1vbnRoID0gbW9udGg7XG4gICAgdGhpcy55ZWFyID0geWVhcjtcblxuICAgIHRoaXMubGFuZyA9IGxhbmc7XG4gICAgdGhpcy5uTG9hZFllYXJzUHJldiA9IDE1MDtcbiAgICB0aGlzLm5Mb2FkWWVhcnNOZXh0ID0gNTA7XG5cbiAgICB0aGlzLnF1aWNrTG9hZCA9IHRydWU7XG5cbiAgICB0aGlzLmxvYWRIdG1sKCk7XG4gICAgJChcIiNNR19EYXRlX0JhY2tcIikuZmFkZUluKFwiZmFzdFwiKTtcbiAgICB0aGlzLmRheUFkanVzdCA9IDE7XG4gICAgdGhpcy5tb250aEFkanVzdCA9IDE7XG4gICAgdGhpcy55ZWFyQWRqdXN0ID0gMTtcbiAgICB0aGlzLmxvYWREYXlzKCk7XG4gICAgdGhpcy5sb2FkWWVhcnMoKTtcbiAgICBlbE1vbnRoID0gdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgZWxEYXkgPSB0aGlzLmxvYWREYXlzKCk7XG5cbiAgICB0aGlzLnNldFllYXIodGhpcy55ZWFyKTtcbiAgICB0aGlzLnNldE1vbnRoKGVsTW9udGgpO1xuICAgIHRoaXMuc2V0RGF5KGVsRGF5KTtcbiAgICB0aGlzLmV2ZW50cygpO1xuICAgIHRoaXMud2FpdCA9IDUwO1xuXG59O1xubWdkYXRlLnByb3RvdHlwZS5zZXREYXkgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5qdW1wVG9EYXkoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXJcIikuaHRtbCgnJyk7XG4gICAgICAgIHZhciBzZWxlY3RlZCA9IHRoaXMubG9hZERheXMoKTtcbiAgICAgICAgdGhpcy5qdW1wVG9EYXkoc2VsZWN0ZWQpO1xuICAgIH1cbn1cbm1nZGF0ZS5wcm90b3R5cGUuZ29Ub0RheSA9IGZ1bmN0aW9uIChlbGVtZW50LCB2ZWxvY2l0eSkge1xuXG4gICAgaWYgKHZlbG9jaXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmVsb2NpdHkgPSAyMDA7XG4gICAgfVxuXG4gICAgdmFyIGNvbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuICAgIHRoaXMuZGF5QWRqdXN0ID0gMDtcbiAgICB0aGlzLmRheSA9IE51bWJlcihlbGVtZW50LmRhdGEoJ2RheScpKTtcbiAgICAkKFwiI2RTZWxlY3RlZFwiKS5hdHRyKCdpZCcsICcnKTtcbiAgICBlbGVtZW50LmF0dHIoXCJpZFwiLCAnZFNlbGVjdGVkJyk7XG4gICAgdGhpcy5sb2FkRGF5cygpO1xuICAgIHNjcm9sbFZhbHVlID0gdGhpcy5nZXRTY3JvbGxWYWx1ZUVsKGVsZW1lbnQpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb250LmFuaW1hdGUoe3Njcm9sbFRvcDogc2Nyb2xsVmFsdWV9LCB2ZWxvY2l0eSwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmIChlbGVtZW50LmRhdGEoJ3R5cGUnKSA9PT0gJ2YnKSB7XG4gICAgICAgICAgICB2YXIgcmVhbElkID0gXCJkXCIgKyBzZWxmLmRheTtcbiAgICAgICAgICAgIHNlbGYuanVtcFRvRGF5KHJlYWxJZCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRheUFkanVzdCA9IDE7XG4gICAgICAgIH0sIHNlbGYud2FpdCk7XG5cbiAgICB9KTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmp1bXBUb0RheSA9IGZ1bmN0aW9uIChlbCkge1xuICAgIHRoaXMuZGF5ID0gZWwuZGF0YSgnZGF5Jyk7XG5cbiAgICB2YXIgY29udCA9IGVsLnBhcmVudCgpO1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0U2Nyb2xsVmFsdWVFbChlbCk7XG5cbiAgICBjb250LnNjcm9sbFRvcChuZXdWYWx1ZSk7XG59XG5tZ2RhdGUucHJvdG90eXBlLmdldERheUh0bWwgPSBmdW5jdGlvbiAoZGF5LCBzZWxlY3RlZCkge1xuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgJChkaXYpLmF0dHIoXCJkYXRhLWRheVwiLCBkYXkpO1xuICAgIGlmIChzZWxlY3RlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAkKGRpdikuYXR0cihcImlkXCIsICdkU2VsZWN0ZWQnKTtcbiAgICB9XG4gICAgaWYgKGRheSA+IDI4KSB7XG4gICAgICAgICQoZGl2KS5hdHRyKFwiY2xhc3NcIiwgJ2QnICsgZGF5KTtcbiAgICB9XG4gICAgdmFyIG5EYXkgPSAoZGF5IDwgMTApID8gJzAnICsgZGF5IDogZGF5O1xuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobkRheSk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHQpO1xuXG4gICAgcmV0dXJuICQoZGl2KTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLnJlbG9hZERheXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxhc3REYXkgPSB0aGlzLmxhc3REYXlNb250aCh0aGlzLnllYXIsIHRoaXMubW9udGgpO1xuICAgIHZhciBkaWYgPSBsYXN0RGF5IC0gdGhpcy5kYXk7XG4gICAgZWwgPSAkKFwiI2RTZWxlY3RlZFwiKTtcbiAgICBpZiAoZGlmIDwgMCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA+IGRpZjsgaS0tKSB7XG4gICAgICAgICAgICBwcmV2ID0gZWwucHJldigpO1xuICAgICAgICAgICAgZWwgPSBwcmV2O1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuZ29Ub0RheShlbCk7XG4gICAgJChcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXJcIikuaHRtbCgnJyk7XG4gICAgdGhpcy5sb2FkRGF5cygpO1xufVxubWdkYXRlLnByb3RvdHlwZS5sb2FkRGF5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGl2ID0gdGhpcy5nZXREYXlIdG1sKHRoaXMuZGF5LCB0cnVlKTtcbiAgICBpZiAoJChcIiNkU2VsZWN0ZWRcIikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyXCIpLmFwcGVuZChkaXYpO1xuICAgIH1cbiAgICB2YXIgbGFzdERheSA9IHRoaXMubGFzdERheU1vbnRoKHRoaXMueWVhciwgdGhpcy5tb250aClcbiAgICB0aGlzLmxvYWRQcmV2RGF5cyhsYXN0RGF5KTtcbiAgICB0aGlzLmxvYWROZXh0RGF5cyhsYXN0RGF5KTtcblxuICAgIHJldHVybiAkKCcjZFNlbGVjdGVkJyk7XG59O1xubWdkYXRlLnByb3RvdHlwZS5sb2FkUHJldkRheXMgPSBmdW5jdGlvbiAobGFzdERheSkge1xuXG4gICAgdmFyIHNlbGVjdGVkID0gJChcIiNkU2VsZWN0ZWRcIik7XG4gICAgdmFyIHREYXkgPSB0aGlzLmRheSAtIDE7XG4gICAgdmFyIHByZXYgPSBzZWxlY3RlZC5wcmV2KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2MDsgaSsrKSB7XG4gICAgICAgIGlmICh0RGF5ID09PSAwKSB7XG4gICAgICAgICAgICB0RGF5ID0gbGFzdERheTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0RGF5SHRtbCh0RGF5KTtcbiAgICAgICAgaWYgKHByZXYubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlclwiKS5wcmVwZW5kKGh0bWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJldi5odG1sKGh0bWwuaHRtbCgpKVxuICAgICAgICB9XG4gICAgICAgIHByZXYgPSBwcmV2LnByZXYoKTtcbiAgICAgICAgLS10RGF5O1xuICAgIH1cblxuICAgIHZhciBpMiA9IDA7XG4gICAgd2hpbGUgKHByZXYubGVuZ3RoICE9IDApIHtcbiAgICAgICAgaWYgKHREYXkgPT09IDApIHtcbiAgICAgICAgICAgIHREYXkgPSBsYXN0RGF5O1xuICAgICAgICB9XG4gICAgICAgIHZhciB0UHJldiA9IHByZXYucHJldigpO1xuICAgICAgICBwcmV2LnJlbW92ZSgpO1xuICAgICAgICBwcmV2ID0gdFByZXY7XG4gICAgICAgIC0tdERheTtcbiAgICB9XG5cbn1cblxuXG5tZ2RhdGUucHJvdG90eXBlLmxvYWROZXh0RGF5cyA9IGZ1bmN0aW9uIChsYXN0RGF5KSB7XG5cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiI2RTZWxlY3RlZFwiKTtcbiAgICB2YXIgdERheSA9IHRoaXMuZGF5ICsgMTtcbiAgICB2YXIgbmV4dCA9IHNlbGVjdGVkLm5leHQoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwOyBpKyspIHtcbiAgICAgICAgaWYgKHREYXkgPT09IGxhc3REYXkgKyAxKSB7XG4gICAgICAgICAgICB0RGF5ID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLmdldERheUh0bWwodERheSk7XG4gICAgICAgICAgICAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlclwiKS5hcHBlbmQoaHRtbCk7XG5cbiAgICAgICAgfVxuICAgICAgICBuZXh0ID0gbmV4dC5uZXh0KCk7XG4gICAgICAgICsrdERheTtcbiAgICB9XG5cbiAgICB3aGlsZSAobmV4dC5sZW5ndGggIT0gMCkge1xuICAgICAgICBpZiAodERheSA9PT0gbGFzdERheSArIDEpIHtcbiAgICAgICAgICAgIHREYXkgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0TmV4dCA9IG5leHQubmV4dCgpO1xuICAgICAgICBuZXh0LnJlbW92ZSgpO1xuICAgICAgICBuZXh0ID0gdE5leHQ7XG4gICAgICAgICsrdERheTtcbiAgICB9XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmluZmluaXRlU2Nyb2xsRGF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ID0gJChcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXJcIik7XG4gICAgdmFyIHdhaXQgPSAyNTA7XG5cblxuICAgIGlmICh0aGlzLmRheUFkanVzdCA9PT0gMSkge1xuICAgICAgICBjbGVhclRpbWVvdXQoJC5kYXRhKHRoaXMsICdzY3JvbGxUaW1lcicpKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmFkanVzdFNjcm9sbERheSgpO1xuICAgICAgICB9LCB3YWl0KSk7XG4gICAgfVxuXG59O1xubWdkYXRlLnByb3RvdHlwZS5hZGp1c3RTY3JvbGxEYXkgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAodGhpcy5kYXlBZGp1c3QgPT09IDEpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjZWwgPSAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlciBkaXY6bnRoLWNoaWxkKDEpXCIpO1xuICAgICAgICA7XG4gICAgICAgIHZhciBoYWxmQ2VsSGVpZ2h0ID0gY2VsLmhlaWdodCgpIC8gMjtcblxuICAgICAgICAkKFwiI01HX0RhdGVfZGF5IC5zY3JvbGxlciBkaXZcIikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvL2lmKCQodGhpcykuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jaycpe1xuICAgICAgICAgICAgaWYgKCQodGhpcykucG9zaXRpb24oKS50b3AgPiAtaGFsZkNlbEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciBjb3JyZWN0ID0gJCh0aGlzKS5uZXh0KCkubmV4dCgpO1xuICAgICAgICAgICAgICAgIHNlbGYuZ29Ub0RheShjb3JyZWN0LCA1MClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5tZ2RhdGUucHJvdG90eXBlLnNldE1vbnRoID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuanVtcFRvTW9udGgoZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKS5odG1sKCcnKTtcbiAgICAgICAgdmFyIHNlbGVjdGVkID0gdGhpcy5sb2FkTW9udGhzKCk7XG4gICAgICAgIHRoaXMuanVtcFRvTW9udGgoc2VsZWN0ZWQpO1xuICAgIH1cbn07XG5tZ2RhdGUucHJvdG90eXBlLmdvVG9Nb250aCA9IGZ1bmN0aW9uIChlbGVtZW50LCB2ZWxvY2l0eSkge1xuXG4gICAgdmFyIGVsWWVhciA9IE51bWJlcihlbGVtZW50LmRhdGEoXCJ5ZWFyXCIpKTtcblxuICAgIGlmICh2ZWxvY2l0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZlbG9jaXR5ID0gMjAwO1xuICAgIH1cbiAgICB2YXIgY29udCA9IGVsZW1lbnQucGFyZW50KCk7XG4gICAgdGhpcy5tb250aEFkanVzdCA9IDA7XG4gICAgdGhpcy5tb250aCA9IGVsZW1lbnQuZGF0YSgnbW9udGgnKTtcbiAgICAkKFwiI21TZWxlY3RlZFwiKS5hdHRyKCdpZCcsICcnKTtcbiAgICBlbGVtZW50LmF0dHIoXCJpZFwiLCAnbVNlbGVjdGVkJyk7XG5cbiAgICB0aGlzLnJlbG9hZERheXMoKTtcbiAgICB0aGlzLmxvYWRNb250aHMoKTtcbiAgICBzY3JvbGxWYWx1ZSA9IHRoaXMuZ2V0U2Nyb2xsVmFsdWVFbChlbGVtZW50KTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29udC5hbmltYXRlKHtzY3JvbGxUb3A6IHNjcm9sbFZhbHVlfSwgdmVsb2NpdHksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLm1vbnRoQWRqdXN0ID0gMTtcblxuICAgICAgICB9LCBzZWxmLndhaXQpO1xuXG4gICAgfSk7XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmp1bXBUb01vbnRoID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdGhpcy5tb250aCA9IGVsLmRhdGEoJ21vbnRoJyk7XG4gICAgdmFyIGNvbnQgPSBlbC5wYXJlbnQoKTtcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmdldFNjcm9sbFZhbHVlRWwoZWwpO1xuXG4gICAgY29udC5zY3JvbGxUb3AobmV3VmFsdWUpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuaW5maW5pdGVTY3JvbGxNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udCA9ICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXJcIik7XG4gICAgdmFyIHdhaXQgPSAyNTA7XG5cbiAgICBpZiAodGhpcy5tb250aEFkanVzdCA9PT0gMSkge1xuICAgICAgICBjbGVhclRpbWVvdXQoJC5kYXRhKHRoaXMsICdzY3JvbGxUaW1lcicpKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmFkanVzdFNjcm9sbE1vbnRoKCk7XG4gICAgICAgIH0sIHdhaXQpKTtcbiAgICB9XG5cbn07XG5tZ2RhdGUucHJvdG90eXBlLmFkanVzdFNjcm9sbE1vbnRoID0gZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKHRoaXMubW9udGhBZGp1c3QgPT09IDEpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjZWwgPSAkKFwiI01HX0RhdGVfbW9udGggLnNjcm9sbGVyIGRpdjpudGgtY2hpbGQoMSlcIik7XG4gICAgICAgIDtcbiAgICAgICAgdmFyIGhhbGZDZWxIZWlnaHQgPSBjZWwuaGVpZ2h0KCkgLyAyO1xuICAgICAgICAkKFwiI01HX0RhdGVfbW9udGggLnNjcm9sbGVyIGRpdlwiKS5lYWNoKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCQodGhpcykucG9zaXRpb24oKS50b3AgPiAtaGFsZkNlbEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHZhciBjb3JyZWN0ID0gJCh0aGlzKS5uZXh0KCkubmV4dCgpO1xuICAgICAgICAgICAgICAgIHNlbGYuZ29Ub01vbnRoKGNvcnJlY3QsIDUwKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5tZ2RhdGUucHJvdG90eXBlLmxvYWRNb250aHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZGl2ID0gdGhpcy5nZXRNb250aEh0bWwodGhpcy5tb250aCwgdGhpcy55ZWFyLCB0cnVlKTtcbiAgICBpZiAoJChcIiNtU2VsZWN0ZWRcIikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXJcIikuYXBwZW5kKGRpdik7XG4gICAgfVxuICAgIHRoaXMubG9hZFByZXZNb250aHMoKTtcbiAgICB0aGlzLmxvYWROZXh0TW9udGhzKCk7XG5cbiAgICByZXR1cm4gJCgnI21TZWxlY3RlZCcpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuZ2V0TW9udGhIdG1sID0gZnVuY3Rpb24gKG1vbnRoLCB5ZWFyLCBzZWxlY3RlZCkge1xuICAgIGlmIChtb250aCA9PT0gMCkge1xuICAgICAgICBtb250aCA9IDEyO1xuICAgICAgICAtLXllYXI7XG4gICAgfVxuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LnNldEF0dHJpYnV0ZShcImRhdGEtbW9udGhcIiwgbW9udGgpO1xuXG4gICAgaWYgKHNlbGVjdGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGl2LnNldEF0dHJpYnV0ZShcImlkXCIsICdtU2VsZWN0ZWQnKTtcbiAgICB9XG5cbiAgICB2YXIgbk1vbnRoID0gdGhpcy5tb250aE5hbWVzW3RoaXMubGFuZ11bbW9udGhdO1xuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobk1vbnRoKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQodCk7XG5cbiAgICByZXR1cm4gJChkaXYpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUubG9hZFByZXZNb250aHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgc2VsZWN0ZWQgPSAkKFwiI21TZWxlY3RlZFwiKTtcbiAgICB2YXIgdE1vbnRoID0gdGhpcy5tb250aCAtIDE7XG4gICAgdmFyIHRZZWFyID0gdGhpcy55ZWFyO1xuXG4gICAgdmFyIHByZXYgPSBzZWxlY3RlZC5wcmV2KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2MDsgaSsrKSB7XG4gICAgICAgIGlmICh0TW9udGggPT09IDApIHtcbiAgICAgICAgICAgIHRNb250aCA9IDEyO1xuICAgICAgICAgICAgdFllYXItLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmV2Lmxlbmd0aCA9PT0gMCkge1xuXG4gICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0TW9udGhIdG1sKHRNb250aCwgdFllYXIpO1xuICAgICAgICAgICAgJChcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlclwiKS5wcmVwZW5kKGh0bWwpO1xuXG4gICAgICAgIH1cbiAgICAgICAgcHJldiA9IHByZXYucHJldigpO1xuICAgICAgICAtLXRNb250aDtcbiAgICB9XG5cbiAgICB3aGlsZSAocHJldi5sZW5ndGggIT0gMCkge1xuICAgICAgICBpZiAodE1vbnRoID09PSAwKSB7XG4gICAgICAgICAgICB0TW9udGggPSAxMjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdFByZXYgPSBwcmV2LnByZXYoKTtcbiAgICAgICAgcHJldi5yZW1vdmUoKTtcbiAgICAgICAgcHJldiA9IHRQcmV2O1xuICAgICAgICAtLXRNb250aDtcbiAgICB9XG59O1xuXG5tZ2RhdGUucHJvdG90eXBlLmxvYWROZXh0TW9udGhzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxlY3RlZCA9ICQoXCIjbVNlbGVjdGVkXCIpO1xuICAgIHZhciB0TW9udGggPSB0aGlzLm1vbnRoICsgMTtcbiAgICB2YXIgdFllYXIgPSB0aGlzLnllYXI7XG5cbiAgICB2YXIgbmV4dCA9IHNlbGVjdGVkLm5leHQoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwOyBpKyspIHtcbiAgICAgICAgaWYgKHRNb250aCA9PT0gMTMpIHtcbiAgICAgICAgICAgIHRNb250aCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dC5sZW5ndGggPT09IDApIHtcblxuICAgICAgICAgICAgdmFyIGh0bWwgPSB0aGlzLmdldE1vbnRoSHRtbCh0TW9udGgsIHRZZWFyKTtcbiAgICAgICAgICAgICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXJcIikuYXBwZW5kKGh0bWwpO1xuXG4gICAgICAgIH1cbiAgICAgICAgbmV4dCA9IG5leHQubmV4dCgpO1xuICAgICAgICArK3RNb250aDtcbiAgICB9XG5cbiAgICB3aGlsZSAobmV4dC5sZW5ndGggIT0gMCkge1xuICAgICAgICBpZiAodE1vbnRoID09PSAxMykge1xuICAgICAgICAgICAgdE1vbnRoID0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdE5leHQgPSBuZXh0Lm5leHQoKTtcbiAgICAgICAgbmV4dC5yZW1vdmUoKTtcbiAgICAgICAgbmV4dCA9IHROZXh0O1xuICAgICAgICArK3RNb250aDtcblxuICAgIH1cbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUuc2V0WWVhciA9IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICB0aGlzLmp1bXBUb1llYXIoXCJ5XCIgKyBudW1iZXIpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuZ29Ub1llYXIgPSBmdW5jdGlvbiAoaWQsIHZlbG9jaXR5KSB7XG5cbiAgICB2YXIgZWxlbWVudCA9ICQoXCIjXCIgKyBpZCk7XG4gICAgaWYgKHZlbG9jaXR5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmVsb2NpdHkgPSAyMDA7XG4gICAgfVxuICAgIHZhciBjb250ID0gZWxlbWVudC5wYXJlbnQoKTtcbiAgICB2YXIgcHJldlllYXIgPSB0aGlzLnllYXI7XG4gICAgdGhpcy55ZWFyQWRqdXN0ID0gMDtcbiAgICB0aGlzLnllYXIgPSBOdW1iZXIoZWxlbWVudC5odG1sKCkpO1xuXG4gICAgdGhpcy5yZWxvYWREYXlzKCk7XG4gICAgaWYgKHRoaXMucXVpY2tMb2FkID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLmxvYWRZZWFycygpO1xuICAgIH1cblxuICAgIHNjcm9sbFZhbHVlID0gdGhpcy5nZXRTY3JvbGxWYWx1ZShpZCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbnQuYW5pbWF0ZSh7c2Nyb2xsVG9wOiBzY3JvbGxWYWx1ZX0sIHZlbG9jaXR5LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi55ZWFyQWRqdXN0ID0gMTtcbiAgICAgICAgfSwgc2VsZi53YWl0KTtcblxuICAgIH0pO1xuICAgIG1heFNjcm9sbCA9IGNvbnQucHJvcChcInNjcm9sbEhlaWdodFwiKVxuXG59O1xubWdkYXRlLnByb3RvdHlwZS5qdW1wVG9ZZWFyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIGVsID0gJChcIiNcIiArIGlkKTtcbiAgICB0aGlzLnllYXIgPSBOdW1iZXIoZWwuaHRtbCgpKTtcbiAgICB2YXIgY29udCA9IGVsLnBhcmVudCgpO1xuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0U2Nyb2xsVmFsdWUoaWQpO1xuXG4gICAgY29udC5zY3JvbGxUb3AobmV3VmFsdWUpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUuaW5maW5pdGVTY3JvbGxZZWFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb250ID0gJChcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyXCIpO1xuICAgIHZhciB3YWl0ID0gMjUwO1xuXG4gICAgaWYgKHRoaXMueWVhckFkanVzdCA9PT0gMSkge1xuICAgICAgICBjbGVhclRpbWVvdXQoJC5kYXRhKHRoaXMsICdzY3JvbGxUaW1lcicpKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAkLmRhdGEodGhpcywgJ3Njcm9sbFRpbWVyJywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmFkanVzdFNjcm9sbFllYXIoKTtcbiAgICAgICAgfSwgd2FpdCkpO1xuICAgIH1cbn07XG5tZ2RhdGUucHJvdG90eXBlLmFkanVzdFNjcm9sbFllYXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAodGhpcy55ZWFyQWRqdXN0ID09PSAxKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2VsID0gJChcIiN5XCIgKyB0aGlzLnllYXIpO1xuICAgICAgICB2YXIgaGFsZkNlbEhlaWdodCA9IGNlbC5oZWlnaHQoKSAvIDI7XG4gICAgICAgICQoXCIjTUdfRGF0ZV95ZWFyIC5zY3JvbGxlciBkaXZcIikuZWFjaChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIGlmICgkKHRoaXMpLnBvc2l0aW9uKCkudG9wID4gLWhhbGZDZWxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29ycmVjdCA9ICQodGhpcykubmV4dCgpLm5leHQoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmdvVG9ZZWFyKGNvcnJlY3QuYXR0cignaWQnKSwgNTApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUubG9hZFllYXJzID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjYXJyZWdhIGFubycpXG4gICAgdGhpcy5sb2FkUHJldlllYXJzKCk7XG4gICAgaWYgKCQoXCIjeVwiICsgdGhpcy55ZWFyKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGh0bWwgPSB0aGlzLmdldFllYXJIdG1sKHRoaXMueWVhcik7XG4gICAgICAgICQoXCIjTUdfRGF0ZV95ZWFyIC5zY3JvbGxlclwiKS5hcHBlbmQoaHRtbCk7XG4gICAgfVxuICAgIHRoaXMubG9hZE5leHRZZWFycygpO1xuXG59O1xubWdkYXRlLnByb3RvdHlwZS5nZXRZZWFySHRtbCA9IGZ1bmN0aW9uICh5ZWFyKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgJChkaXYpLmF0dHIoXCJ5XCIgKyB5ZWFyKVxuICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoeWVhcik7XG4gICAgZGl2LmFwcGVuZENoaWxkKHQpO1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3knICsgeWVhcik7XG4gICAgcmV0dXJuIGRpdjtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmxvYWRQcmV2WWVhcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy55ZWFyIC0gMTtcbiAgICB2YXIgZW5kID0gKHRoaXMucXVpY2tMb2FkID09PSB0cnVlKSA/IHRoaXMueWVhciAtIHRoaXMubkxvYWRZZWFyc1ByZXYgOiB0aGlzLnllYXIgLSAzMDtcbiAgICBjb25zb2xlLmxvZygncHJldicsIGVuZCk7XG4gICAgd2hpbGUgKHN0YXJ0ID49IGVuZCkge1xuICAgICAgICBpZiAoJChcIiN5XCIgKyBzdGFydCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9IHRoaXMuZ2V0WWVhckh0bWwoc3RhcnQpO1xuICAgICAgICAgICAgJChcIiNNR19EYXRlX3llYXIgLnNjcm9sbGVyXCIpLnByZXBlbmQoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgd2hpbGUgKCQoXCIjeVwiICsgc3RhcnQpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgJChcIiN5XCIgKyBzdGFydCkucmVtb3ZlKCk7XG4gICAgICAgIHN0YXJ0LS07XG4gICAgfVxufTtcbm1nZGF0ZS5wcm90b3R5cGUubG9hZE5leHRZZWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnQgPSB0aGlzLnllYXIgKyAxO1xuICAgIHZhciBlbmQgPSAodGhpcy5xdWlja0xvYWQgPT09IHRydWUpID8gdGhpcy55ZWFyICsgdGhpcy5uTG9hZFllYXJzTmV4dCA6IHRoaXMueWVhciArIDMwO1xuICAgIGNvbnNvbGUubG9nKCduZXh0JywgZW5kKTtcbiAgICB3aGlsZSAoc3RhcnQgPD0gZW5kKSB7XG4gICAgICAgIGlmICgkKFwiI3lcIiArIHN0YXJ0KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZhciBodG1sID0gdGhpcy5nZXRZZWFySHRtbChzdGFydCk7XG4gICAgICAgICAgICAkKFwiI01HX0RhdGVfeWVhciAuc2Nyb2xsZXJcIikuYXBwZW5kKGh0bWwpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0Kys7XG4gICAgfVxuICAgIHdoaWxlICgkKFwiI3lcIiArIHN0YXJ0KS5sZW5ndGggPiAwKSB7XG4gICAgICAgICQoXCIjeVwiICsgc3RhcnQpLnJlbW92ZSgpO1xuICAgICAgICBzdGFydCsrO1xuICAgIH1cbn07XG5cbm1nZGF0ZS5wcm90b3R5cGUuZ2V0U2Nyb2xsVmFsdWUgPSBmdW5jdGlvbiAoaWQpIHtcblxuICAgIHZhciBlbGVtZW50ID0gJChcIiNcIiArIGlkKTtcbiAgICB2YXIgc2Nyb2xsVGFyZ2V0ID0gZWxlbWVudC5wcmV2KCkucHJldigpO1xuICAgIHZhciBjb250ID0gZWxlbWVudC5wYXJlbnQoKTtcblxuICAgIHZhciBzY3JvbGxWYWx1ZSA9IGNvbnQuc2Nyb2xsVG9wKCkgKyBzY3JvbGxUYXJnZXQucG9zaXRpb24oKS50b3A7XG5cbiAgICByZXR1cm4gc2Nyb2xsVmFsdWU7XG59O1xubWdkYXRlLnByb3RvdHlwZS5nZXRTY3JvbGxWYWx1ZUVsID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcblxuICAgIHZhciBzY3JvbGxUYXJnZXQgPSBlbGVtZW50LnByZXYoKS5wcmV2KCk7XG4gICAgdmFyIGNvbnQgPSBlbGVtZW50LnBhcmVudCgpO1xuXG4gICAgdmFyIHNjcm9sbFZhbHVlID0gY29udC5zY3JvbGxUb3AoKSArIHNjcm9sbFRhcmdldC5wb3NpdGlvbigpLnRvcDtcblxuICAgIHJldHVybiBzY3JvbGxWYWx1ZTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmV2ZW50cyA9IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKFwiYm9keVwiKS5kZWxlZ2F0ZShcIiNNR19EYXRlX2RheSAuc2Nyb2xsZXIgZGl2XCIsIFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZi5kYXlBZGp1c3QgPT09IDEpIHtcbiAgICAgICAgICAgIHNlbGYuZ29Ub0RheSgkKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjTUdfRGF0ZV9kYXkgLnNjcm9sbGVyXCIpLnNjcm9sbChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuaW5maW5pdGVTY3JvbGxEYXkoKTtcbiAgICB9KTtcbiAgICAkKFwiYm9keVwiKS5kZWxlZ2F0ZShcIiNNR19EYXRlX21vbnRoIC5zY3JvbGxlciBkaXZcIiwgXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLm1vbnRoQWRqdXN0ID09PSAxKSB7XG4gICAgICAgICAgICBzZWxmLmdvVG9Nb250aCgkKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjTUdfRGF0ZV9tb250aCAuc2Nyb2xsZXJcIikuc2Nyb2xsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5pbmZpbml0ZVNjcm9sbE1vbnRoKCk7XG4gICAgfSk7XG4gICAgJChcImJvZHlcIikuZGVsZWdhdGUoXCIjTUdfRGF0ZV95ZWFyIC5zY3JvbGxlciBkaXZcIiwgXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLnllYXJBZGp1c3QgPT09IDEpIHtcbiAgICAgICAgICAgIHNlbGYuZ29Ub1llYXIoJCh0aGlzKS5hdHRyKCdpZCcpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICQoXCIjTUdfRGF0ZV95ZWFyIC5zY3JvbGxlclwiKS5zY3JvbGwoZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmluZmluaXRlU2Nyb2xsWWVhcigpO1xuICAgIH0pO1xuICAgICQoXCIjTUdfRGF0ZV9CdXR0b25zIC5jYW5jZWxcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuY2FuY2VsKCk7XG4gICAgfSk7XG4gICAgJChcIiNNR19EYXRlX0J1dHRvbnMgLnNlbmRcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuc2VuZCgpXG4gICAgfSk7XG59O1xuXG5tZ2RhdGUucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKFwiI01HX0RhdGVfQmFja1wiKS5mYWRlT3V0KFwiZmFzdFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG59O1xubWdkYXRlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkYXkgPSB0aGlzLmRheTtcbiAgICB2YXIgbW9udGggPSB0aGlzLm1vbnRoO1xuICAgIHZhciB5ZWFyID0gdGhpcy55ZWFyO1xuICAgIGlmIChkYXkgPCAxMCkge1xuICAgICAgICBkYXkgPSAnMCcgKyBkYXk7XG4gICAgfVxuICAgIGlmIChtb250aCA8IDEwKSB7XG4gICAgICAgIG1vbnRoID0gJzAnICsgbW9udGg7XG4gICAgfVxuICAgIHZhciBjb3VudFllYXIgPSB5ZWFyLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgIHZhciBkaWZZZWFyID0gNCAtIGNvdW50WWVhcjtcbiAgICB3aGlsZSAoZGlmWWVhciA+IDApIHtcbiAgICAgICAgeWVhciA9ICcwJyArIHllYXI7XG4gICAgICAgIGRpZlllYXItLTtcbiAgICB9XG4gICAgdGhpcy5lbGVtZW50LnZhbCh5ZWFyICsgJy0nICsgbW9udGggKyAnLScgKyBkYXkpO1xuICAgIHRoaXMuY2FuY2VsKCk7XG59O1xuXG5tZ2RhdGUucHJvdG90eXBlLm1vbnRoTmFtZXMgPSB7XG4gICAgcHQ6IFsnJywgJ0phbmVpcm8nLCAnRmV2ZXJlaXJvJywgJ01hcsOnbycsICdBYnJpbCcsICdNYWlvJywgJ0p1bmhvJywgJ0p1bGhvJywgJ0Fnb3N0bycsICdTZXRlbWJybycsICdPdXR1YnJvJywgJ05vdmVtYnJvJywgJ0RlemVtYnJvJ10sXG4gICAgZXM6IFsnJywgJ0VuZXJvJywgJ0ZlYnJlcm8nLCAnTWFyem8nLCAnQWJyaWwnLCAnTWF5bycsICdKdW5pbycsICdKdWxpbycsICdBZ29zdG8nLCAnU2VwdGllbWJyZScsICdPY3R1YnJlJywgJ05vdmllbWJyZScsICdEaWNpZW1icmUnXSxcbiAgICBlbjogWycnLCAnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddXG59O1xubWdkYXRlLnByb3RvdHlwZS50ZXh0ID0ge1xuICAgIHB0OiB7Y2FuY2VsOiAnY2FuY2VsYXInLCBzZW5kOiAnY29uZmlybWFyJ30sXG4gICAgZXM6IHtjYW5jZWw6ICdjYW5jZWxhcicsIHNlbmQ6ICdjb25maXJtYXInfSxcbiAgICBlbjoge2NhbmNlbDogJ2NhbmNlbCcsIHNlbmQ6ICdjb25maXJtJ30sXG59O1xuXG4vL21nZGF0ZS5wcm90b3R5cGUubW9udGhOYW1lcyA9IHtlbmdVUzogWycnLCdKYW5laXJvJywgJ0ZldmVyZWlybycsICdNYXLDp28nLCAnQWJyaWwnLCAnTWFpbycsICdKdW5obycsICdKdWxobycsICdBZ29zdG8nLCAnU2V0ZW1icm8nLCAnT3V0dWJybycsICdOb3ZlbWJybycsICdEZXplbWJybyddfTtcbi8vbWdkYXRlLnByb3RvdHlwZS50ZXh0ID0ge2VuZ1VTOiB7Y2FuY2VsOiAnY2FuY2VsJywgc2VuZDogJ3NlbmQnfX07XG5cbm1nZGF0ZS5wcm90b3R5cGUubGFzdERheU1vbnRoID0gZnVuY3Rpb24gKHllYXIsIG1vbnRoKSB7XG4gICAgdmFyIHllYXIgPSBOdW1iZXIoeWVhcik7XG4gICAgdmFyIG1vbnRoID0gTnVtYmVyKG1vbnRoKTtcbiAgICB2YXIgbGFzdERheSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoKTtcbiAgICBsYXN0RGF5LnNldERhdGUoMCk7XG4gICAgcmV0dXJuIGxhc3REYXkuZ2V0VVRDRGF0ZSgpO1xufTtcbm1nZGF0ZS5wcm90b3R5cGUudmFsaWREYXRlID0gZnVuY3Rpb24gKGQsIG0sIHkpIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHksIG0gLSAxLCBkKTtcbiAgICByZXR1cm4gKGRhdGUuZ2V0RnVsbFllYXIoKSA9PSB5ICYmIGRhdGUuZ2V0TW9udGgoKSArIDEgPT0gbSAmJiBkYXRlLmdldERhdGUoKSA9PSBkKTtcbn07XG5tZ2RhdGUucHJvdG90eXBlLmxvYWRIdG1sID0gZnVuY3Rpb24gKCkge1xuICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCQoXCIjTUdfRGF0ZV9CYWNrXCIpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIgbWdEYXRlQmFjayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG1nRGF0ZUJhY2suc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX0JhY2snKTtcbiAgICAgICAgdmFyIG1nRGF0ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG1nRGF0ZUNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfQ29udGFpbmVyJyk7XG5cbiAgICAgICAgbWdEYXRlQmFjay5hcHBlbmRDaGlsZChtZ0RhdGVDb250YWluZXIpO1xuXG4gICAgICAgIHZhciBtZ0RhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBtZ0RhdGUuc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlJyk7XG4gICAgICAgIG1nRGF0ZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ01HX0RhdGUnKTtcbiAgICAgICAgdmFyIG1nRGF0ZUJ1dHRvbnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBtZ0RhdGVCdXR0b25zLnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9CdXR0b25zJyk7XG5cbiAgICAgICAgbWdEYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKG1nRGF0ZSk7XG5cbiAgICAgICAgdmFyIGNlbERheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNlbERheS5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfY2VsZGF5Jyk7XG4gICAgICAgIHZhciBkYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkYXkuc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX2RheScpO1xuICAgICAgICB2YXIgc2Nyb2xsZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzY3JvbGxlci5jbGFzc05hbWUgPSAnc2Nyb2xsZXInO1xuICAgICAgICBtZ0RhdGUuYXBwZW5kQ2hpbGQoY2VsRGF5KTtcbiAgICAgICAgY2VsRGF5LmFwcGVuZENoaWxkKGRheSk7XG4gICAgICAgIGRheS5hcHBlbmRDaGlsZChzY3JvbGxlcik7XG5cbiAgICAgICAgdmFyIGNlbE1vbnRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsTW9udGguc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX2NlbG1vbnRoJyk7XG4gICAgICAgIHZhciBtb250aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG1vbnRoLnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9tb250aCcpO1xuICAgICAgICB2YXIgc2Nyb2xsZXIyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgc2Nyb2xsZXIyLmNsYXNzTmFtZSA9ICdzY3JvbGxlcic7XG5cbiAgICAgICAgbWdEYXRlLmFwcGVuZENoaWxkKGNlbE1vbnRoKTtcbiAgICAgICAgY2VsTW9udGguYXBwZW5kQ2hpbGQobW9udGgpO1xuICAgICAgICBtb250aC5hcHBlbmRDaGlsZChzY3JvbGxlcjIpO1xuXG4gICAgICAgIHZhciBjZWxZZWFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY2VsWWVhci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ01HX0RhdGVfY2VseWVhcicpO1xuICAgICAgICB2YXIgeWVhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHllYXIuc2V0QXR0cmlidXRlKCdpZCcsICdNR19EYXRlX3llYXInKTtcbiAgICAgICAgdmFyIHNjcm9sbGVyMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHNjcm9sbGVyMy5jbGFzc05hbWUgPSAnc2Nyb2xsZXInO1xuXG4gICAgICAgIG1nRGF0ZS5hcHBlbmRDaGlsZChjZWxZZWFyKTtcbiAgICAgICAgY2VsWWVhci5hcHBlbmRDaGlsZCh5ZWFyKTtcbiAgICAgICAgeWVhci5hcHBlbmRDaGlsZChzY3JvbGxlcjMpO1xuXG4gICAgICAgIHZhciBjb3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGNvdmVyLnNldEF0dHJpYnV0ZSgnaWQnLCAnTUdfRGF0ZV9jb3ZlcicpO1xuICAgICAgICBjb3Zlci5jbGFzc05hbWUgPSAnTUdfRGF0ZSc7XG5cbiAgICAgICAgbWdEYXRlLmFwcGVuZENoaWxkKGNvdmVyKTtcbiAgICAgICAgdmFyIGQxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIGQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIGQzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY292ZXIuYXBwZW5kQ2hpbGQoZDEpO1xuICAgICAgICBjb3Zlci5hcHBlbmRDaGlsZChkMik7XG4gICAgICAgIGNvdmVyLmFwcGVuZENoaWxkKGQzKTtcblxuICAgICAgICBtZ0RhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQobWdEYXRlQnV0dG9ucyk7XG5cbiAgICAgICAgdmFyIGlwQ2FuY2VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpcENhbmNlbC5pZCA9IFwiTUdfRGF0ZV9DYW5jZWxcIjtcbiAgICAgICAgaXBDYW5jZWwudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICAgIGlwQ2FuY2VsLmNsYXNzTmFtZSA9ICdjYW5jZWwnO1xuICAgICAgICBpcENhbmNlbC52YWx1ZSA9IHNlbGYudGV4dFt0aGlzLmxhbmddWydjYW5jZWwnXTtcbiAgICAgICAgdmFyIGlwU2VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaXBTZW5kLmlkID0gXCJNR19EYXRlX1NlbmRcIjtcbiAgICAgICAgaXBTZW5kLnR5cGUgPSBcImJ1dHRvblwiO1xuICAgICAgICBpcFNlbmQuY2xhc3NOYW1lID0gJ3NlbmQnO1xuICAgICAgICBpcFNlbmQudmFsdWUgPSBzZWxmLnRleHRbdGhpcy5sYW5nXVsnc2VuZCddO1xuICAgICAgICBtZ0RhdGVCdXR0b25zLmFwcGVuZENoaWxkKGlwQ2FuY2VsKTtcbiAgICAgICAgbWdEYXRlQnV0dG9ucy5hcHBlbmRDaGlsZChpcFNlbmQpO1xuXG4gICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChtZ0RhdGVCYWNrKTtcbiAgICB9XG59O1xuXG4kLmZuLm1nZGF0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbmV3IG1nZGF0ZSgkKHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWdkYXRlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdEYXRlJzogICByZXF1aXJlKCcuL2RhdGUnKSxcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBhdE9yQmVsb3cgPSBmdW5jdGlvbihsaW1pdCl7XG5cbiAgdGhpcy5saW1pdCA9IGxpbWl0XG4gIHRoaXMubXNnICAgPSAnVmFsb3Igc3VwZXJpb3IgYW8gbGltaXRlIGRlICcgKyB0aGlzLmxpbWl0O1xufTtcbmF0T3JCZWxvdy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbmF0T3JCZWxvdy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhdE9yQmVsb3c7XG5tb2R1bGUuZXhwb3J0cyA9IGF0T3JCZWxvdztcblxuYXRPckJlbG93LnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24odmFsdWUsIGNiKXtcbiAgXG4gIGlmKCF2YWx1ZSkgcmV0dXJuIGNiKHRydWUpO1xuXG4gIGlmKHZhbHVlID4gdGhpcy5saW1pdCkgcmV0dXJuIGNiKGZhbHNlKTtcbiAgY2IodHJ1ZSk7XG59O1xuXG5hdE9yQmVsb3cubG9hZCA9IGZ1bmN0aW9uKHBhcmFtcyl7XG4gICAgXG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcbiAgdmFyIGZpcnN0ID0gcGFyYW1zWzBdO1xuXG4gIGlmKHR5cGVvZiBmaXJzdCAhPSAnbnVtYmVyJyl7XG4gICAgZGVmZXIucmVqZWN0KGZpcnN0ICsgJyBpcyBub3QgYSBudW1iZXInKTtcblxuICB9ZWxzZXtcbiAgICBcbiAgICBmaXJzdCA9IHBhcnNlSW50KGZpcnN0KTtcbiAgICB2YXIgdmFsaWRhdG9yID0gbmV3IGF0T3JCZWxvdyhmaXJzdCk7XG4gICAgZGVmZXIucmVzb2x2ZSh2YWxpZGF0b3IpO1xuICB9XG5cbiAgcmV0dXJuIGRlZmVyLnJlc29sdmU7XG59O1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxudmFyIGF0T3JPdmVyID0gZnVuY3Rpb24obGltaXQpe1xuXG4gIHRoaXMubGltaXQgPSBsaW1pdFxuICB0aGlzLm1zZyAgPSAnVmFsb3IgaW5mZXJpb3IgYW8gbGltaXRlIGRlICcgKyB0aGlzLmxpbWl0O1xufTtcbmF0T3JPdmVyLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xuYXRPck92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYXRPck92ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGF0T3JPdmVyO1xuXG5hdE9yT3Zlci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKHZhbHVlLCBjYil7XG5cbiAgaWYoIXZhbHVlKSByZXR1cm4gY2IodHJ1ZSk7XG5cbiAgaWYodmFsdWUgPCB0aGlzLmxpbWl0KSByZXR1cm4gY2IoZmFsc2UpO1xuICBjYih0cnVlKTtcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4uL2Jhc2UnKTtcblxudmFyIGJhc2UgPSBmdW5jdGlvbigpe307XG5iYXNlLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xuYmFzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlO1xubW9kdWxlLmV4cG9ydHMgPSBiYXNlO1xuXG4iLCJ2YXIgQ2hlY2tlZCA9IGZ1bmN0aW9uKGVsZW1lbnRzKXtcblxuICBjb25zb2xlLmxvZygnREVQUkVDSUVEIScpO1xuXG4gIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgdGhpcy5tc2cgPSAnU2VsZWNpb25lIHVtIGRvcyBjYW1wb3MnO1xufTtcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tlZDtcblxuQ2hlY2tlZC5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKHZhbHVlLCBjYil7XG5cbiAgICB2YXIgcmVzID0gZmFsc2U7XG4gICAgaWYodGhpcy5lbGVtZW50cy5maWx0ZXIoJzpjaGVja2VkJykuc2l6ZSgpID09IDEpIHJlcyA9IHRydWU7XG5cbiAgICBjYihyZXMpO1xufTtcbiIsInZhciBDb250YWluZXIgPSBmdW5jdGlvbigpe1xuICBcbiAgY29uc29sZS5sb2coJ0RFUFJFQ0lFRCEnKTtcblxuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhaW5lcjtcblxuQ29udGFpbmVyLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihlbGVtZW50KXtcblxuICAgIHRoaXMuZWxlbWVudHMucHVzaChlbGVtZW50KTtcbn07XG5cbkNvbnRhaW5lci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmope1xuXG4gIHZhciBwcm9taXNlcyA9IFtdO1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbZV07XG4gICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKXtcbiAgICAgICAgICBlbGVtZW50LmlzVmFsaWQoZnVuY3Rpb24ocmVzKXsgZGVmLnJlc29sdmUocmVzKTsgfSwgb2JqKTtcbiAgICAgIH0pO1xuICAgICAgcHJvbWlzZXMucHVzaChkZWYpO1xuICB9XG5cbiAgJC53aGVuLmFwcGx5KHVuZGVmaW5lZCwgcHJvbWlzZXMpLnByb21pc2UoKS5kb25lKGZ1bmN0aW9uKCl7XG5cbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGNiKGFyZ3MuaW5kZXhPZihmYWxzZSkgPCAwKTtcbiAgfSk7XG59O1xuXG5Db250YWluZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlcyA9IHt9O1xuICBmb3IodmFyIGUgaW4gdGhpcy5lbGVtZW50cyl7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzW2VdO1xuICAgIHZhciBuYW1lICAgID0gISFlbGVtZW50Lm5hbWUgPyBlbGVtZW50Lm5hbWUgOiBlbGVtZW50LmF0dHIoJ25hbWUnKTtcbiAgICBpZighIW5hbWUpICB2YWx1ZXNbbmFtZV0gPSBlbGVtZW50LmdldFZhbHVlKCk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbnZhciBkYXRlQXRPckJlbG93ID0gZnVuY3Rpb24oZGF0ZSl7XG5cbiAgdGhpcy5kYXRlID0gZGF0ZTtcbiAgdGhpcy5tc2cgID0gJ0RhdGEgZnV0dXJhIGludsOhbGlkYSc7XG59O1xuZGF0ZUF0T3JCZWxvdy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbmRhdGVBdE9yQmVsb3cucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZGF0ZUF0T3JCZWxvdztcbm1vZHVsZS5leHBvcnRzID0gZGF0ZUF0T3JCZWxvdztcblxuZGF0ZUF0T3JCZWxvdy5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKHZhbHVlLCBjYil7XG5cbiAgdmFyIHZhbHVlID0gdmFsdWUgaW5zdGFuY2VvZiBEYXRlID8gdmFsdWUgOiBuZXcgRGF0ZSh2YWx1ZS5zcGxpdCgnLScpKTtcbiAgaWYodmFsdWUuZ2V0VGltZSgpID4gdGhpcy5kYXRlLmdldFRpbWUoKSkgcmV0dXJuIGNiKGZhbHNlKTtcbiAgY2IodHJ1ZSk7XG59O1xuXG4vKiBQYXJhbXMgZXg6IFstMzY1XSA9PiAxIHllYXIgYWdvIG9yIGJlbG93XG4gICAgICAgICAgICAgIFswMS8wMS8yMDE4XSA9PiAwMS8wMS8yMDE4IG9yIGJlbG93XG4qL1xuZGF0ZUF0T3JCZWxvdy5sb2FkID0gZnVuY3Rpb24ocGFyYW1zKXtcblxuICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XG4gIHZhciBmaXJzdCA9IHBhcmFtc1swXTtcbiAgdmFyIGRhdGUgID0gbmV3IERhdGUoKTtcblxuICBpZighIWZpcnN0KXtcbiAgICBcbiAgICBpZih0eXBlb2YgZmlyc3QgPT0gJ251bWJlcicpe1xuICAgIFxuICAgICAgZmlyc3QgICAgPSBwYXJzZUludChmaXJzdCk7XG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBmaXJzdCk7XG5cbiAgICB9ZWxzZXtcbiAgICBcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShmaXJzdC5yZXBsYWNlKC8tL2csICcvJykpO1xuICAgIH1cbiAgfVxuXG4gIHZhciB2YWxpZGF0b3IgPSBuZXcgZGF0ZUF0T3JCZWxvdyhkYXRlKTtcbiAgZGVmZXIucmVzb2x2ZShkYXRlKTtcblxuICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBkYXRlQXRPck92ZXIgPSBmdW5jdGlvbihkYXRlKXtcblxuICB0aGlzLmRhdGUgPSAhIWRhdGUgPyBkYXRlIDogbmV3IERhdGUoKTtcbiAgdGhpcy5tc2cgID0gJ0EgZGF0YSBkZXZlIHNlciBpZ3VhbCBvdSBzdXBlcmlvciBhIHswfScuZm9ybWF0KGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xufTtcbmRhdGVBdE9yT3Zlci5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbmRhdGVBdE9yT3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBkYXRlQXRPck92ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGRhdGVBdE9yT3ZlcjtcblxuZGF0ZUF0T3JPdmVyLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24odmFsdWUsIGNiKXtcblxuICB2YXIgdmFsdWUgPSB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgPyB2YWx1ZSA6IG5ldyBEYXRlKHZhbHVlLnJlcGxhY2UoLy0vZywgJy8nKSk7XG4gIHZhciBjbG9uZSA9IG5ldyBEYXRlKHRoaXMuZGF0ZSk7XG4gIGNsb25lLnNldERhdGUoY2xvbmUuZ2V0RGF0ZSgpIC0gMSlcbiAgaWYodmFsdWUuZ2V0VGltZSgpID4gY2xvbmUuZ2V0VGltZSgpKSByZXR1cm4gY2IodHJ1ZSk7XG4gIGNiKGZhbHNlKTtcbn07XG5cbi8qIFBhcmFtcyBleDogWy0zNjVdID0+IDEgeWVhciBhZ28gb3Igb3ZlciBcbiAgICAgICAgICAgICAgWzAxLzAxLzIwMThdID0+IDAxLzAxLzIwMTggb3Igb3ZlclxuKi9cbmRhdGVBdE9yT3Zlci5sb2FkID0gZnVuY3Rpb24ocGFyYW1zKXtcblxuICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XG4gIHZhciBmaXJzdCA9IHBhcmFtc1swXTtcbiAgdmFyIGRhdGUgID0gbmV3IERhdGUoKTtcblxuICBpZighIWZpcnN0KXtcbiAgICBcbiAgICBpZih0eXBlb2YgZmlyc3QgPT0gJ251bWJlcicpe1xuICAgIFxuICAgICAgZmlyc3QgICAgPSBwYXJzZUludChmaXJzdCk7XG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBmaXJzdCk7XG5cbiAgICB9ZWxzZXtcbiAgICBcbiAgICAgIGRhdGUgPSBuZXcgRGF0ZShmaXJzdC5yZXBsYWNlKC8tL2csICcvJykpO1xuICAgIH1cbiAgfVxuXG4gIHZhciB2YWxpZGF0b3IgPSBuZXcgZGF0ZUF0T3JPdmVyKGRhdGUpO1xuICBkZWZlci5yZXNvbHZlKGRhdGUpO1xuXG4gIHJldHVybiBkZWZlci5wcm9taXNlO1xufTtcbiIsInZhciBEZWNvcmF0b3IgPSBmdW5jdGlvbihlbGVtZW50LCBtc2cpIHtcblxuICAgIGlmKGVsZW1lbnQudmFsaWRhdG9ycykgcmV0dXJuIGVsZW1lbnQ7XG5cbiAgICBlbGVtZW50LnZhbGlkYXRvcnMgPSBbXTtcbiAgICBlbGVtZW50LmZpbHRlcnMgICAgPSBbXTtcblxuICAgIGlmKCFlbGVtZW50Lm5hbWUpIGVsZW1lbnQubmFtZSA9IGVsZW1lbnQuYXR0cignbmFtZScpO1xuXG4gICAgZWxlbWVudC5hZGRWYWxpZGF0b3IgPSBmdW5jdGlvbih2YWxpZGF0b3Ipe1xuICAgICAgICBlbGVtZW50LnZhbGlkYXRvcnMucHVzaCh2YWxpZGF0b3IpO1xuICAgIH07XG5cbiAgICBlbGVtZW50LmFkZEZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcil7XG4gICAgICAgIGVsZW1lbnQuZmlsdGVyLnB1c2goZmlsdGVyKTtcbiAgICB9O1xuXG4gICAgZWxlbWVudC5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHZhbHVlID0gZWxlbWVudC52YWwoKS50cmltKCk7XG4gICAgICAgIGZvcih2YXIgZiBpbiBlbGVtZW50LmZpbHRlcnMpe1xuXG4gICAgICAgICAgdmFyIGZpbHRlciA9IGVsZW1lbnQuZmlsdGVyc1tmXTtcbiAgICAgICAgICB2YXIgdmFsdWUgID0gZmlsdGVyLmZpbHRlcih2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcblxuICAgIGVsZW1lbnQuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmopIHtcblxuICAgICAgICB2YXIgc2VsZiA9IGVsZW1lbnQ7XG4gICAgICAgIHZhciByZXMgPSB0cnVlO1xuICAgICAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgdmFyIHZhbHVlID0gZWxlbWVudC5nZXRWYWx1ZSgpO1xuICAgICAgICBpZiAobXNnKSBtc2cudGV4dCgnJyk7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcblxuICAgICAgICBmb3IodmFyIHYgaW4gZWxlbWVudC52YWxpZGF0b3JzKXtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSBlbGVtZW50LnZhbGlkYXRvcnNbdl07XG4gICAgICAgICAgICB2YXIgZGVmID0gbmV3ICQuRGVmZXJyZWQoZnVuY3Rpb24oZGVmKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLmlzVmFsaWQodmFsdWUsIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyAmJiBtc2cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZy50ZXh0KHZhbGlkYXRvci5tc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoISFlbGVtZW50LmFkZENsYXNzKSBlbGVtZW50LmFkZENsYXNzKCdpbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmLnJlc29sdmUocmVzKTtcbiAgICAgICAgICAgICAgICB9LCBvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKGRlZik7XG4gICAgICAgIH1cblxuXG4gICAgICAgICQud2hlbi5hcHBseSh1bmRlZmluZWQsIHByb21pc2VzKS5wcm9taXNlKCkuZG9uZShmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgaWYgKGFyZ3MuaW5kZXhPZihmYWxzZSkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGNiKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGVjb3JhdG9yO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdDb250YWluZXInOiAgICAgICAgIHJlcXVpcmUoJy4vY29udGFpbmVyJyksXG4gICdEZWNvcmF0b3InOiAgICAgICAgIHJlcXVpcmUoJy4vZGVjb3JhdG9yJyksXG4gICdDaGVja2VkJzogICAgICAgICAgIHJlcXVpcmUoJy4vY2hlY2tlZCcpLFxuICAnTm90RW1wdHknOiAgICAgICAgICByZXF1aXJlKCcuL25vdEVtcHR5JyksXG4gICdOb3RFbXB0eURlcGVuZGVudCc6IHJlcXVpcmUoJy4vbm90RW1wdHlEZXBlbmRlbnQnKSxcbiAgJ0RhdGVBdE9yQmVsb3cnOiAgICAgcmVxdWlyZSgnLi9kYXRlQXRPckJlbG93JyksXG4gICdEYXRlQXRPck92ZXInOiAgICAgIHJlcXVpcmUoJy4vZGF0ZUF0T3JPdmVyJyksXG4gICdBdE9yQmVsb3cnOiAgICAgICAgIHJlcXVpcmUoJy4vQXRPckJlbG93JyksXG4gICdBdE9yT3Zlcic6ICAgICAgICAgIHJlcXVpcmUoJy4vQXRPck92ZXInKSxcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG52YXIgTm90RW1wdHkgPSBmdW5jdGlvbigpe1xuXG4gICAgdGhpcy5tc2cgPSAnQ2FtcG8gb2JyaWdhdMOzcmlvJztcbn07XG5Ob3RFbXB0eS5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbk5vdEVtcHR5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE5vdEVtcHR5O1xubW9kdWxlLmV4cG9ydHMgPSBOb3RFbXB0eTtcblxuTm90RW1wdHkucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbih2YWx1ZSwgY2Ipe1xuXG4gICAgdmFyIHZhbHVlID0gdHlwZW9mKHZhbHVlKSA9PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6IHZhbHVlO1xuICAgIGlmKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PSAnJyl7XG4gICAgICAgIHJldHVybiBjYihmYWxzZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNiKHRydWUpO1xufTtcbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG5cbnZhciBOb3RFbXB0eURlcGVuZGVudCA9IGZ1bmN0aW9uKGRlcCl7XG5cbiAgdGhpcy5kZXBlbmRlbnQgPSBkZXA7XG4gIHRoaXMubXNnID0gJ0NhbXBvIG9icmlnYXTDs3Jpbyc7XG59O1xuTm90RW1wdHlEZXBlbmRlbnQucHJvdG90eXBlID0gbmV3IEJhc2U7XG5Ob3RFbXB0eURlcGVuZGVudC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBOb3RFbXB0eURlcGVuZGVudDtcbm1vZHVsZS5leHBvcnRzID0gTm90RW1wdHlEZXBlbmRlbnQ7XG5cbk5vdEVtcHR5RGVwZW5kZW50LnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24odmFsdWUsIGNiKXtcblxuICBpZih2YWx1ZSA9PSAnJyl7XG4gICAgICB2YXIgZGVwID0gdGhpcy5kZXBlbmRlbnQudmFsKCk7XG4gICAgICBpZihkZXAgIT0gJycpIHJldHVybiBjYihmYWxzZSk7XG4gIH1cblxuICByZXR1cm4gY2IodHJ1ZSk7XG59O1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuLi9iYXNlJyk7XG52YXIgUSAgICA9IHJlcXVpcmUoJ3EnKTtcblxudmFyIENFID0gZnVuY3Rpb24odGFnKXtcblxuICB2YXIgZWxlbWVudCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcbiAgZm9yKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKyl7XG4gICAgICBlbGVtZW50LmFkZENsYXNzKGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgcmV0dXJuIGVsZW1lbnQ7XG59O1xud2luZG93LkNFID0gQ0U7XG5cbnZhciBiYXNlID0gZnVuY3Rpb24oQyl7XG4gIFxuICBCYXNlLmNhbGwodGhpcyk7XG5cbiAgdGhpcy5DID0gQzsgLy9Db250cm9sbGVyXG4gIHRoaXMuY29udGFpbmVyID0gQ0UoJ2RpdicsICdib3gnKTtcblxuICB0aGlzLnByZV9tYWtlID0gW107XG4gIHRoaXMucG9zX21ha2UgPSBbXTtcbn07XG5iYXNlLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xuYmFzZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBiYXNlO1xuXG5iYXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmNvbnRhaW5lci5odG1sKCk7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmICA9IHRoaXM7XG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcbiAgdGhpcy5jb250YWluZXIuaHRtbCgnJyk7XG5cbiAgdmFyIHByZV9wcm9taXNlcyA9IFtdO1xuICB2YXIgcG9zX3Byb21pc2VzID0gW107XG5cbiAgdmFyIG9ubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICBmb3IodmFyIGsgaW4gc2VsZi5wb3NfbWFrZSl7XG4gICAgICB2YXIgcG9zX2Z1bmN0aW9uID0gc2VsZi5wb3NfbWFrZVtrXTtcbiAgICAgIChmdW5jdGlvbihmdW5jLCBjdHgpeyBcblxuICAgICAgICB2YXIgcmVzcCA9IGZ1bmMuY2FsbChjdHgpO1xuICAgICAgICBpZih0eXBlb2YocmVzcCkgPT0gJ29iamVjdCcpIHBvc19wcm9taXNlcy5wdXNoKHJlc3ApO1xuICAgICAgXG4gICAgICB9KShwb3NfZnVuY3Rpb24sIHNlbGYpO1xuICAgIH1cblxuICAgIFEuYWxsKHBvc19wcm9taXNlcykudGhlbihmdW5jdGlvbigpe1xuICAgICAgZGVmZXIucmVzb2x2ZShzZWxmLmNvbnRhaW5lcik7XG4gICAgfSwgY29uc29sZS5sb2cpLmRvbmUoKTtcbiAgfVxuXG4gIHZhciBvbnByZSA9IGZ1bmN0aW9uKCl7IHNlbGYubWFrZSgpLnRoZW4ob25tYWtlLCBjb25zb2xlLmxvZykuZG9uZSgpOyB9O1xuXG4gIGZvcih2YXIgayBpbiB0aGlzLnByZV9tYWtlKXtcbiAgICB2YXIgcHJlX2Z1bmN0aW9uID0gdGhpcy5wcmVfbWFrZVtrXTtcbiAgICB2YXIgcmVzcCA9IHByZV9mdW5jdGlvbi5jYWxsKHNlbGYpO1xuICAgIGlmKHR5cGVvZihyZXNwKSA9PSAnb2JqZWN0JykgcHJlX3Byb21pc2VzLnB1c2gocmVzcCk7XG4gIH1cbiAgUS5hbGwocHJlX3Byb21pc2VzKS50aGVuKG9ucHJlLCBjb25zb2xlLmxvZykuZG9uZSgpO1xuXG4gIHJldHVybiBkZWZlci5wcm9taXNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlO1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuLi9iYXNlJyk7XG52YXIgUSAgICA9IHJlcXVpcmUoJ3EnKTtcblxudmFyIGJhc2UgPSBmdW5jdGlvbihuYW1lKXtcblxuICBCYXNlLmNhbGwodGhpcyk7XG5cbiAgdGhpcy5uYW1lICAgICAgPSAhIW5hbWUgPyBuYW1lIDogJyc7XG4gIHRoaXMuY29udGFpbmVyID0gQ0UoJ2xhYmVsJywgJ2l0ZW0nLCAnaXRlbS1pbnB1dCcsICdpdGVtLXN0YWNrZWQtbGFiZWwnKTtcblxuICB0aGlzLmNvbnRhaW5lcl9jaGlsZCA9IG51bGw7XG5cblx0dGhpcy5sYWJlbCAgICAgPSBudWxsO1xuXHR0aGlzLmlucHV0cyAgICA9IG51bGw7XG5cdHRoaXMudGl0bGUgICAgID0gbnVsbDtcblx0dGhpcy5tZXNzYWdlICAgPSBudWxsO1xuXHR0aGlzLnZhbHVlICAgICA9ICcnO1xuXG4gIHRoaXMucHJlX21ha2UgID0gW107XG4gIHRoaXMucG9zX21ha2UgID0gW107XG5cbiAgdGhpcy52YWxpZGF0b3JzID0gW107XG4gIHRoaXMuZmlsdGVycyAgICA9IFtdO1xuXG4gIHRoaXMuX3RpdGxlICAgID0gJyc7XG4gIHRoaXMuX2VkaXQgICAgID0gdHJ1ZTtcbiAgdGhpcy5fbWFrZSAgICAgPSBmYWxzZTtcblxuICB0aGlzLmZvcmNlZCAgICAgICA9IG51bGw7IC8vRm9yY2UgdmFsaWRhdGlvblxuXG4gIHRoaXMuX2luaXRDaGlsZHJlbigpO1xuICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xufTtcbmJhc2UucHJvdG90eXBlID0gbmV3IEJhc2U7XG5iYXNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGJhc2U7XG5tb2R1bGUuZXhwb3J0cyA9IGJhc2U7XG5cbmJhc2UucHJvdG90eXBlLl9pbml0Q2hpbGRyZW4gPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLmNoaWxkX2NvbnRhaW5lciA9IHRoaXMuY2hpbGRfY29udGFpbmVyID0gQ0UoJ2RpdicsICdib3gnKTtcblxuICB0aGlzLnBvc19tYWtlLnB1c2goZnVuY3Rpb24oKXtcblxuICAgIHZhciBkZWYgPSBRLmRlZmVyKCk7XG5cbiAgICBzZWxmLmNoaWxkX2NvbnRhaW5lci5odG1sKCcnKTtcbiAgICBzZWxmLmNvbnRhaW5lci5hZnRlcihzZWxmLmNoaWxkX2NvbnRhaW5lcik7XG4gIFxuICAgIGRlZi5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRlZi5wcm9taXNlO1xuICB9KTtcbn07XG5cbmJhc2UucHJvdG90eXBlLnJlbW92ZUNoaWxkcmVuID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiAgPSB0aGlzO1xuICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XG4gIFxuICB0aGlzLmNoaWxkX2NvbnRhaW5lci5mYWRlT3V0KGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgc2VsZi5fY2hpbGRyZW4gPSBbXTtcbiAgICBzZWxmLmNoaWxkX2NvbnRhaW5lci5odG1sKCcnKTtcbiAgICBzZWxmLmNoaWxkX2NvbnRhaW5lci5zaG93KCk7XG4gICAgZGVmZXIucmVzb2x2ZSgpO1xuICB9KTtcblxuICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbn07XG5cbmJhc2UucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKGZpZWxkKXtcblxuICBpZihmaWVsZCBpbnN0YW5jZW9mIGJhc2Upe1xuXG4gICAgdGhpcy5fY2hpbGRyZW4ucHVzaChmaWVsZCk7XG4gICAgZmllbGQuY29udGFpbmVyLmhpZGUoKTtcbiAgICB0aGlzLmNoaWxkX2NvbnRhaW5lci5hcHBlbmQoZmllbGQuY29udGFpbmVyKTtcbiAgICBmaWVsZC5jb250YWluZXIuZmFkZUluKCk7XG5cbiAgfWVsc2V7XG4gICAgXG4gICAgZmllbGQuaGlkZSgpO1xuICAgIHRoaXMuY2hpbGRfY29udGFpbmVyLmFwcG5lZChmaWVsZCk7XG4gICAgZmllbGQuZmFkZUluKCk7XG4gIH1cbn07XG5cbmJhc2UucHJvdG90eXBlLmVkaXQgPSBmdW5jdGlvbihmbGFnKXtcbiAgIFxuICB0aGlzLl9lZGl0ID0gZmxhZztcbn07XG5cbmJhc2UucHJvdG90eXBlLmFkZFZhbGlkYXRvciA9IGZ1bmN0aW9uKHZhbGlkYXRvcil7XG4gIHRoaXMudmFsaWRhdG9ycy5wdXNoKHZhbGlkYXRvcik7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5hZGRGaWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpe1xuICB0aGlzLmZpbHRlci5wdXNoKGZpbHRlcik7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5zZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKXtcbiAgdGhpcy5fdGl0bGUgPSB0aXRsZTtcbiAgaWYodGhpcy50aXRsZSkgdGhpcy50aXRsZS50ZXh0KHRpdGxlKTtcbn07XG5cbmJhc2UucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24oKXtcblxuICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICBmb3IodmFyIGYgaW4gdGhpcy5maWx0ZXJzKXtcbiAgICB2YXIgZmlsdGVyID0gdGhpcy5maWx0ZXJzW2ZdO1xuICAgIHZhciB2YWx1ZSAgPSBmaWx0ZXIuZmlsdGVyKHZhbHVlKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbmJhc2UucHJvdG90eXBlLm9uaXN2YWxpZCA9IGZ1bmN0aW9uKHJlcyl7fTtcblxuYmFzZS5wcm90b3R5cGUuZm9yY2VWYWxpZCA9IGZ1bmN0aW9uKHJlcywgbWVzc2FnZSl7XG5cbiAgaWYocmVzID09IG51bGwpe1xuICAgIHRoaXMuZm9yY2VkID0gbnVsbDtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmZvcmNlZCA9IFtyZXMsIG1lc3NhZ2VdO1xufTtcblxuYmFzZS5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uKGNiLCBvYmopIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciByZXMgPSB0cnVlO1xuICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgdmFyIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG4gIHNlbGYubWVzc2FnZS50ZXh0KCcnKTtcbiAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKTtcblxuICBpZighIXRoaXMuZm9yY2VkKXtcbiAgICB0aGlzLm1lc3NhZ2UudGV4dCh0aGlzLmZvcmNlZFsxXSk7XG4gICAgdGhpcy5jb250YWluZXIuYWRkQ2xhc3MoJ2ludmFsaWQnKTtcbiAgICByZXR1cm4gY2IodGhpcy5mb3JjZWRbMF0pO1xuICB9XG5cbiAgZm9yKHZhciB2IGluIHRoaXMudmFsaWRhdG9ycyl7XG4gICAgdmFyIHZhbGlkYXRvciA9IHRoaXMudmFsaWRhdG9yc1t2XTtcbiAgICB2YXIgZGVmID0gUS5kZWZlcigpO1xuICAgIHByb21pc2VzLnB1c2goZGVmLnByb21pc2UpO1xuICAgIChmdW5jdGlvbigkdmFsaWRhdG9yLCAkZGVmLCAkb2JqKXtcbiAgICAgICR2YWxpZGF0b3IuaXNWYWxpZCh2YWx1ZSwgZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGlmKCFyZXMpe1xuICAgICAgICAgIHNlbGYubWVzc2FnZS50ZXh0KCR2YWxpZGF0b3IubXNnKTtcbiAgICAgICAgICBzZWxmLmNvbnRhaW5lci5hZGRDbGFzcygnaW52YWxpZCcpO1xuICAgICAgICB9XG4gICAgICAgICRkZWYucmVzb2x2ZShyZXMpO1xuICAgICAgfSwgJG9iaik7XG4gICAgXG4gICAgfSkodmFsaWRhdG9yLCBkZWYsIG9iaik7XG4gIH1cblxuICAvL2NoaWxkIHZhbGlkYXRpb25zXG4gIGZvcih2YXIgZCBpbiB0aGlzLl9jaGlsZHJlbil7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bZF07XG4gICAgdmFyIGRlZiA9IFEuZGVmZXIoKTtcbiAgICBwcm9taXNlcy5wdXNoKGRlZi5wcm9taXNlKTtcbiAgICAoZnVuY3Rpb24oJGNoaWxkLCAkZGVmLCAkb2JqKXtcblxuICAgICAgJGNoaWxkLmlzVmFsaWQoJGRlZi5yZXNvbHZlLCAkZGVmLnJlamVjdCwgJG9iaik7XG5cbiAgICB9KShjaGlsZCwgZGVmLCBvYmopO1xuICB9XG5cbiAgUS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICBcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRhdGEpO1xuICAgIGlmIChhcmdzLmluZGV4T2YoZmFsc2UpID49IDApIHtcbiAgICAgIHNlbGYub25pc3ZhbGlkKGZhbHNlKTtcbiAgICAgIGNiKGZhbHNlKTtcbiAgICB9ZWxzZXtcbiAgICAgIHNlbGYub25pc3ZhbGlkKHRydWUpO1xuICAgICAgY2IodHJ1ZSk7XG4gICAgfVxuICB9KTtcbn07XG5cbmJhc2UucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlcyA9IHt9O1xuXG4gIHZhciB2YWx1ZSAgPSB0aGlzLnZhbCgpO1xuICB2YWx1ZXNbdGhpcy5uYW1lXSA9IHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6IHZhbHVlO1xuXG4gIGZvcih2YXIgZCBpbiB0aGlzLl9jaGlsZHJlbil7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5fY2hpbGRyZW5bZF07XG4gICAgdmFsdWVzID0gT2JqZWN0LmFzc2lnbih2YWx1ZXMsIGNoaWxkLmdldFZhbHVlcygpKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5tYWtlU2hvdyA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLmlucHV0cy5odG1sKCcnKTtcblxuICB2YXIgdmFsdWUgPSAhIXRoaXMudmFsdWUgPyB0aGlzLnZhbHVlIDogJy0tLSc7XG5cbiAgaWYodmFsdWUgaW5zdGFuY2VvZiBEYXRlKXtcbiAgICB2YWx1ZSA9IHZhbHVlLmdldERpc3BsYXkoKTtcbiAgfVxuXG4gIHZhciBzcGFuID0gQ0UoJ3NwYW4nLCAnaW5wdXRfYXJlYScpO1xuICBzcGFuLmNzcyh7J3BhZGRpbi10b3AnOiAnNnB4J30pO1xuICBzcGFuLnRleHQodmFsdWUpO1xuXG4gIHRoaXMuaW5wdXRzLmFwcGVuZChzcGFuKTtcbn07XG5cbmJhc2UucHJvdG90eXBlLm1ha2UgPSBmdW5jdGlvbigpe1xuICBcbiAgdGhpcy5jb250YWluZXIuaHRtbCgnJyk7XG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcblxuICBpZighIXRoaXMuX3RpdGxlKXtcbiAgICB0aGlzLnRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJyk7XG4gICAgdGhpcy50aXRsZS50ZXh0KHRoaXMuX3RpdGxlKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy50aXRsZSk7XG4gIH1cblxuICB0aGlzLm1lc3NhZ2UgPSBDRSgnc3BhbicsICd3ZGwnLCAnZXJyb3InKTtcbiAgdGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMubWVzc2FnZSk7XG5cbiAgdGhpcy5pbnB1dHMgPSBDRSgnZGl2JywgJ2JveCcpO1xuICB0aGlzLm1ha2VJbnB1dHMoKTtcbiAgdGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMuaW5wdXRzKTtcblxuICB0aGlzLl9tYWtlID0gdHJ1ZTtcblxuICBkZWZlci5yZXNvbHZlKCk7XG4gIHJldHVybiBkZWZlci5wcm9taXNlO1xufTtcblxuYmFzZS5wcm90b3R5cGUudmFsID0gZnVuY3Rpb24odmFsdWUpe1xuXG4gIGlmKHZhbHVlID09PSB1bmRlZmluZWQpe1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICB9ZWxzZXtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgaWYodGhpcy5fbWFrZSkgdGhpcy5tYWtlSW5wdXRzKCk7XG4gIH1cbn07XG5cbmJhc2UucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcblxuICBzZWxmLnZhbCgnJyk7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5hdHRyICAgICAgICA9IGZ1bmN0aW9uKCl7IC8qZm9yIG92ZXJ3cml0ZSovIH07XG5iYXNlLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uKCl7IC8qZm9yIG92ZXJ3cml0ZSovIH07XG5iYXNlLnByb3RvdHlwZS5tYWtlSW5wdXRzICA9IGZ1bmN0aW9uKCl7IC8qZm9yIG92ZXJ3cml0ZSovIH07XG5iYXNlLnByb3RvdHlwZS5vbmNoYW5nZSAgICA9IGZ1bmN0aW9uKCl7IC8qZm9yIG92ZXJ3cml0ZSovIH07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgQmFzZS5jYWxsKHRoaXMsIG5hbWUpO1xuXG4gIHRoaXMuY29udGFpbmVyID0gQ0UoJ2RpdicsICdpdGVtIGl0ZW0taWNvbi1yaWdodCcpO1xuICB0aGlzLmNvbnRhaW5lci5jc3Moeyd3aGl0ZS1zcGFjZSc6ICdub3JtYWwnfSk7XG59O1xudmlldy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbnZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gdmlldztcbm1vZHVsZS5leHBvcnRzID0gdmlldztcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdGhpcy5jb250YWluZXIuaHRtbCgnJyk7XG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcblxuICB0aGlzLnRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJyk7XG4gIHRoaXMudGl0bGUudGV4dCh0aGlzLl90aXRsZSk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0aGlzLnRpdGxlKTtcblxuICAvL2NoZWNrYm94IG5vdCBoYXZlIG1lc3NhZ2VcbiAgdGhpcy5tZXNzYWdlID0gQ0UoJ3NwYW4nLCAnd2RsJywgJ2Vycm9yJyk7XG5cbiAgdGhpcy5pbnB1dHMgPSBDRSgnc3BhbicsICdpdGVtLWNoZWNrYm94Jyk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0aGlzLmlucHV0cyk7XG4gIHRoaXMubWFrZUlucHV0cygpO1xuXG4gIGRlZmVyLnJlc29sdmUoKTtcbiAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG59O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlSW5wdXRzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuaW5wdXRzLmh0bWwoJycpO1xuXG4gIHZhciBsYWJlbCA9IENFKCdsYWJlbCcsICdjaGVja2JveCcpO1xuICB0aGlzLmlucHV0cy5hcHBlbmQobGFiZWwpO1xuXG4gIHZhciB2YWx1ZSA9ICEhdGhpcy52YWx1ZTtcblxuICBpZih0aGlzLl9lZGl0KXtcblxuICAgIHZhciBpbnB1dCA9IENFKCdpbnB1dCcpLmF0dHIoeyd0eXBlJzogJ2NoZWNrYm94JywgbmFtZTogdGhpcy5uYW1lfSkuY3NzKHsnZmxvYXQnOiAncmlnaHQnfSk7XG4gICAgaWYodmFsdWUpIGlucHV0LmF0dHIoJ2NoZWNrZWQnLCAnY2hlY2tlZCcpO1xuICAgIGlucHV0LmNsaWNrKGZ1bmN0aW9uKCl7IHNlbGYudmFsdWUgPSAkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpOyB9KTtcbiAgICBsYWJlbC5hcHBlbmQoaW5wdXQpO1xuICB9ZWxzZXtcbiAgIFxuICAgIHZhciBzcGFuID0gQ0UoJ3NwYW4nLCAnbWF0ZXJpYWwtaWNvbnMgd2RyJyk7XG4gICAgaWYodmFsdWUpIHNwYW4uaHRtbCgnJiN4RTVDQTsnKTtcbiAgICBsYWJlbC5hcHBlbmQoc3Bhbik7XG4gIH1cbn1cbiIsInZhciBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJyk7XG52YXIgUSAgICA9IHJlcXVpcmUoJ3EnKTtcblxudmFyIHZpZXcgPSBmdW5jdGlvbihuYW1lKXtcblxuICBCYXNlLmNhbGwodGhpcywgbmFtZSk7XG59O1xudmlldy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbnZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gdmlldztcbm1vZHVsZS5leHBvcnRzID0gdmlldztcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIGRlZmVyID0gUS5kZWZlcigpO1xuICB0aGlzLmNvbnRhaW5lci5odG1sKCcnKTtcblxuICB0aGlzLnRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJyk7XG4gIHRoaXMudGl0bGUudGV4dCh0aGlzLl90aXRsZSk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0aGlzLnRpdGxlKTtcblxuICB0aGlzLm1lc3NhZ2UgPSBDRSgnc3BhbicsICd3ZGwnLCAnZXJyb3InKTtcbiAgdGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMubWVzc2FnZSk7XG5cbiAgdGhpcy5pbnB1dHMgPSBDRSgnZGl2JywgJ2JveCcsICdkYXRlQ29udGFpbmVyJyk7XG4gIHRoaXMubWFrZUlucHV0cygpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pbnB1dHMpO1xuXG4gIHRoaXMuX21ha2UgPSB0cnVlO1xuXG4gIGRlZmVyLnJlc29sdmUoKTtcbiAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG59O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlSW5wdXRzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiAgPSB0aGlzO1xuICBcbiAgdGhpcy5pbnB1dHMub2ZmKCdmb2N1c291dCcpO1xuICB0aGlzLmlucHV0cy5odG1sKCcnKTtcbiBcbiAgdmFyIGRheSAgID0gQ0UoJ2lucHV0JywgJ3dkbCcpLmF0dHIoeyd0eXBlJzogJ251bWJlcicsIG1heGxlbmd0aDogXCIyXCIsIG1heDogXCIzMVwiLCBtaW46IFwiMVwiLCBwbGFjZWhvbGRlcjogJ2RkJ30pO1xuICB2YXIgbW9udGggPSBDRSgnaW5wdXQnLCAnd2RsJykuYXR0cih7J3R5cGUnOiAnbnVtYmVyJywgbWF4bGVuZ3RoOiBcIjJcIiwgbWF4OiBcIjEyXCIsIG1pbjogXCIxXCIsIHBsYWNlaG9sZGVyOiAnbW0nfSk7XG4gIHZhciB5ZWFyICA9IENFKCdpbnB1dCcsICd3ZGwnKS5hdHRyKHsndHlwZSc6ICdudW1iZXInLCBtYXhsZW5ndGg6IFwiNFwiLCBtYXg6IFwiOTk5OVwiLCBtaW46IFwiMVwiLCBwbGFjZWhvbGRlcjogJ2FhYWEnfSk7XG5cbiAgaWYoIXRoaXMuX2VkaXQpe1xuICAgIGRheS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIG1vbnRoLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgeWVhci5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICB9XG5cbiAgdGhpcy5pbnB1dHMuYXBwZW5kKGRheSk7XG4gIHRoaXMuaW5wdXRzLmFwcGVuZChDRSgnc3BhbicsICd3ZGwnKS50ZXh0KCcvJykpO1xuICB0aGlzLmlucHV0cy5hcHBlbmQobW9udGgpO1xuICB0aGlzLmlucHV0cy5hcHBlbmQoQ0UoJ3NwYW4nLCAnd2RsJykudGV4dCgnLycpKTtcbiAgdGhpcy5pbnB1dHMuYXBwZW5kKHllYXIpO1xuXG4gIGRheS5rZXl1cChmdW5jdGlvbihlKXtcbiAgXG4gICAgdmFyIHZhbHVlID0gZGF5LnZhbCgpO1xuICAgIGlmKHZhbHVlLmxlbmd0aCA+IDEpIG1vbnRoLmZvY3VzKCk7XG5cbiAgfSkuZm9jdXNvdXQoZnVuY3Rpb24oZSl7XG4gIFxuICAgIHZhciB2YWx1ZSA9IGRheS52YWwoKS50cmltKCk7XG4gICAgaWYodmFsdWUgPT0gJzAnKSByZXR1cm4gZGF5LnZhbCgnJyk7XG4gICAgaWYodmFsdWUubGVuZ3RoID09IDEpe1xuICAgICAgZGF5LnZhbCgnMCcgKyB2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICBtb250aC5rZXl1cChmdW5jdGlvbihlKXtcbiAgXG4gICAgdmFyIHZhbHVlID0gbW9udGgudmFsKCkudHJpbSgpO1xuICAgIGlmKHZhbHVlLmxlbmd0aCA+IDEpIHJldHVybiB5ZWFyLmZvY3VzKCk7XG4gICAgaWYodmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4gZGF5LmZvY3VzKCkuc2VsZWN0KCk7XG5cbiAgfSkuZm9jdXNvdXQoZnVuY3Rpb24oZSl7XG4gIFxuICAgIHZhciB2YWx1ZSA9IG1vbnRoLnZhbCgpLnRyaW0oKTtcbiAgICBpZih2YWx1ZSA9PSAnMCcpIHJldHVybiBtb250aC52YWwoJycpO1xuICAgIGlmKHZhbHVlLmxlbmd0aCA9PSAxKXtcbiAgICAgIG1vbnRoLnZhbCgnMCcgKyB2YWx1ZSk7XG4gICAgfVxuICB9KTtcblxuICB5ZWFyLmtleXVwKGZ1bmN0aW9uKGUpe1xuICAgIFxuICAgIHZhciB2YWx1ZSA9IHllYXIudmFsKCk7XG4gICAgaWYodmFsdWUubGVuZ3RoID4gNCkgcmV0dXJuIHllYXIudmFsKHZhbHVlLnN1YnN0cigwLDQpKTtcbiAgICBpZih2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiBtb250aC5mb2N1cygpLnNlbGVjdCgpO1xuICB9KTtcblxuICBpZighIXRoaXMudmFsdWUpe1xuICAgIFxuICAgIGlmKHRoaXMudmFsdWUgaW5zdGFuY2VvZiBEYXRlKXtcbiAgICAgIGRheS52YWwodGhpcy52YWx1ZS5nZXREYXRlKCkpO1xuICAgICAgZGF5LnRyaWdnZXIoJ2ZvY3Vzb3V0Jyk7XG5cbiAgICAgIG1vbnRoLnZhbCh0aGlzLnZhbHVlLmdldE1vbnRoKCkgKyAxKTtcbiAgICAgIG1vbnRoLnRyaWdnZXIoJ2ZvY3Vzb3V0Jyk7XG5cbiAgICAgIHllYXIudmFsKHRoaXMudmFsdWUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICB5ZWFyLnRyaWdnZXIoJ2ZvY3Vzb3V0Jyk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuaW5wdXRzLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpe1xuXG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpO1xuICAgIHZhciB2X2RheSAgID0gZGF5LnZhbCgpLnRyaW0oKTtcbiAgICB2YXIgdl9tb250aCA9IG1vbnRoLnZhbCgpLnRyaW0oKTtcbiAgICB2YXIgdl95ZWFyICA9IHllYXIudmFsKCkudHJpbSgpO1xuXG4gICAgaWYodl95ZWFyLmxlbmd0aCAhPSA0KSB2X3llYXIgPSAnJztcbiAgICBpZih2X2RheSAhPT0gJycgJiYgdl9tb250aCAhPT0gJycgJiYgeWVhciAhPT0gJycpe1xuXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHZfeWVhciwgdl9tb250aCAtIDEsIHZfZGF5KTtcbiAgICAgIHZhciBjaGVjayA9IGRhdGUuZ2V0RnVsbFllYXIoKSA9PSB2X3llYXIgJiYgZGF0ZS5nZXRNb250aCgpICsgMSA9PSB2X21vbnRoICYmIGRhdGUuZ2V0RGF0ZSgpID09IHZfZGF5O1xuICAgICAgaWYoY2hlY2spe1xuICAgICAgICBzZWxmLnZhbHVlID0gZGF0ZTtcbiAgICAgICAgc2VsZi5pbnB1dHMucmVtb3ZlQ2xhc3MoJ3dyb25nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxmLnZhbHVlID0gJyc7XG4gICAgc2VsZi5pbnB1dHMuYWRkQ2xhc3MoJ3dyb25nJyk7XG4gIH0pO1xuXG4gIHNlbGYuaW5wdXRzLmZpbmQoJ2lucHV0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGUpe1xuXG4gICAgdmFyIHRoYXQgID0gJCh0aGlzKTtcbiAgICBcbiAgICB2YXIgdmFsdWUgPSB0aGF0LnZhbCgpLnRyaW0oKTtcbiAgICB2YXIgbWF4ICAgPSB0aGF0LmF0dHIoJ21heGxlbmd0aCcpO1xuICAgIGlmKHZhbHVlLmxlbmd0aCA+IG1heCl7XG4gICAgICAgIHRoYXQudmFsKHZhbHVlLnN1YnN0cmluZygwLCBtYXgpKTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQmFzZSc6ICAgICAgICAgIHJlcXVpcmUoJy4vYmFzZScpLFxuICAnUmFkaW8nOiAgICAgICAgIHJlcXVpcmUoJy4vcmFkaW8nKSxcbiAgJ1Bob25lJzogICAgICAgICByZXF1aXJlKCcuL3Bob25lJyksXG4gICdUZXh0JzogICAgICAgICAgcmVxdWlyZSgnLi90ZXh0JyksXG4gICdEYXRlJzogICAgICAgICAgcmVxdWlyZSgnLi9kYXRlJyksXG4gICdOdW1lcmljJzogICAgICAgcmVxdWlyZSgnLi9udW1lcmljJyksXG4gICdDaGVja2JveCc6ICAgICAgcmVxdWlyZSgnLi9jaGVja2JveCcpLFxuICAnU2VsZWN0JzogICAgICAgIHJlcXVpcmUoJy4vc2VsZWN0JyksXG4gICdUZXh0TXVsdGlSb3cnOiAgcmVxdWlyZSgnLi90ZXh0TXVsdGlSb3cnKSxcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG52YXIgdmlldyA9IGZ1bmN0aW9uKG5hbWUsIGRlY2ltYWwpe1xuXG4gIEJhc2UuY2FsbCh0aGlzLCBuYW1lKTtcblxuICB0aGlzLmRlY2ltYWwgPSAhIWRlY2ltYWwgPyBkZWNpbWFsIDogMjtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5zdGVwID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc3RlcCA9ICcuJztcbiAgZm9yKHZhciBpID0gMTsgaSA8IHRoaXMuZGVjaW1hbDsgaSsrKXtcbiAgICBzdGVwICs9ICcwJztcbiAgfVxuICBzdGVwICs9ICcxJztcbiAgcmV0dXJuIHN0ZXA7XG59O1xuXG52aWV3LnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHZhbHVlID0gQmFzZS5wcm90b3R5cGUuZ2V0VmFsdWUuY2FsbCh0aGlzKTtcbiAgaWYodHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCIpe1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgnLCcsICcuJyk7XG4gIH1cblxuICByZXR1cm4gISF2YWx1ZSA/IHBhcnNlRmxvYXQodmFsdWUpIDogbnVsbDtcbn07XG5cbnZpZXcucHJvdG90eXBlLm1ha2VJbnB1dHMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5pbnB1dHMuaHRtbCgnJyk7XG5cbiAgdmFyIGlucHV0ID0gQ0UoJ2lucHV0JykuYXR0cih7J3R5cGUnOiAnbnVtYmVyJywgJ3N0ZXAnOiB0aGlzLnN0ZXAoKSwgJ21pbic6IDAsICdtYXgnOiAxMCwgbmFtZTogdGhpcy5uYW1lfSk7XG4gIHRoaXMuaW5wdXRzLmFwcGVuZChpbnB1dCk7XG5cbiAgaWYoISF0aGlzLnZhbHVlKSBpbnB1dC52YWwodGhpcy52YWx1ZS5mb3JtYXRNb25leShzZWxmLmRlY2ltYWwsICcuJywgJycpKTtcbiAgaWYoIXRoaXMuX2VkaXQpICBpbnB1dC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXG4gIGlucHV0LmtleXVwKGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICR0aGlzICA9ICQodGhpcyk7XG4gICAgICB2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcbiAgICAgIHZhciB2YWx1ZSAgPSB2YWx1ZS5yZXBsYWNlKCcuJywnJyk7XG4gICAgICB2YXIgdmFsdWUgID0gcGFyc2VJbnQodmFsdWUpO1xuICAgICAgc2VsZi52YWx1ZSA9ICh2YWx1ZS9NYXRoLnBvdygxMCwgc2VsZi5kZWNpbWFsKSkuZm9ybWF0TW9uZXkoc2VsZi5kZWNpbWFsLCAnLicsICcnKTtcbiAgICAgICR0aGlzLnZhbChzZWxmLnZhbHVlKTtcblxuICB9KS5mb2N1c291dChmdW5jdGlvbihlKXtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgdmFsdWUgPSAkdGhpcy52YWwoKS5yZXBsYWNlKCcuJywnJyk7XG4gICAgICB2YXIgdmFsdWUgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgICBpZih2YWx1ZSA9PSAwKXtcbiAgICAgICAgc2VsZi52YWx1ZSA9IG51bGw7IFxuICAgICAgICAkdGhpcy52YWwoJycpO1xuICAgICAgfVxuICB9KTtcbn1cblxuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG52YXIgdmlldyA9IGZ1bmN0aW9uKG5hbWUpe1xuXG4gIEJhc2UuY2FsbCh0aGlzLCBuYW1lKTtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlSW5wdXRzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuaW5wdXRzLmh0bWwoJycpO1xuXG4gIHRoaXMucGhvbmUgPSBDRSgnaW5wdXQnKS5hdHRyKCd0eXBlJywgJ3RlbCcpO1xuICB0aGlzLnBob25lLmtleXVwKGZ1bmN0aW9uKGUpeyBcblxuICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgdmFyIHZhbCAgID0gJHRoaXMudmFsKCk7XG5cbiAgICBpZihlLmtleUNvZGUgPT0gOCB8fCBlLmtleUNvZGUgPT0gMjI5KXtcbiAgICAgIHZhbCA9ICcnO1xuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IHNlbGYuZm9ybWF0LmNhbGwoc2VsZiwgdmFsKTsgXG4gICAgJHRoaXMudmFsKHZhbHVlKTtcbiAgfSk7XG5cblxuICBpZighIXRoaXMudmFsdWUpIHRoaXMucGhvbmUudmFsKHRoaXMuZm9ybWF0KHRoaXMudmFsdWUpKTtcbiAgaWYoIXRoaXMuX2VkaXQpICB0aGlzLnBob25lLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG5cbiAgdGhpcy5pbnB1dHMuYXBwZW5kKHRoaXMucGhvbmUpO1xufTtcblxudmlldy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24odmFsdWUpe1xuXG4gIHRoaXMudmFsdWUgPSB0aGlzLmZpbHRlcih2YWx1ZSkuc2xpY2UoMCwgMTEpO1xuICB2YXIgbGVuICAgID0gdGhpcy52YWx1ZS5sZW5ndGg7XG4gIHZhciByZXNwICAgPSAnKCc7XG5cbiAgcmVzcCArPSB0aGlzLnZhbHVlLnNsaWNlKDAsIDIpO1xuICBcbiAgaWYobGVuIDwgMikgcmV0dXJuIHJlc3A7XG5cbiAgcmVzcCArPSAnKSAnO1xuXG4gIHZhciByZXN0ID0gMTEgLSBsZW47XG4gIGZvcih2YXIgaSA9IDA7IGkgPCByZXN0OyBpKyspe1xuICAgIGlmKGkgPT0gMCl7XG4gICAgICByZXNwICs9ICcgJztcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3AgKz0gJ18nO1xuICAgIH1cbiAgfVxuXG4gIGlmKGxlbiA+IDYpe1xuICBcbiAgICByZXNwICs9IHRoaXMudmFsdWUuc2xpY2UoMiwgKGxlbi02KSsyKTtcbiAgICByZXNwICs9ICctJztcbiAgICByZXNwICs9IHRoaXMudmFsdWUuc2xpY2UoKGxlbi02KSsyLCAxMSk7XG4gIH1lbHNle1xuICBcbiAgICByZXNwICs9IHRoaXMudmFsdWUuc2xpY2UoMiwgNik7XG4gIH1cblxuICByZXR1cm4gcmVzcDtcbn07XG5cbnZpZXcucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKHZhbHVlKXtcblxuICB2YXIgcmVnZXggPSAvXFxkKy9nO1xuICB2YXIgbWF0Y2ggPSB2YWx1ZS5tYXRjaChyZWdleCk7XG5cbiAgaWYoISFtYXRjaCkgcmV0dXJuIG1hdGNoLmpvaW4oJycpO1xuICByZXR1cm4gJyc7XG59O1xuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgQmFzZS5jYWxsKHRoaXMsIG5hbWUpO1xuICB0aGlzLmxpc3QgPSBbXTtcblxuICB0aGlzLmNvbnRhaW5lciA9IENFKCdkaXYnLCAnYm94Jyk7XG4gIHRoaXMubGFiZWwgICAgID0gbnVsbDtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlID0gZnVuY3Rpb24oKXtcbiAgXG4gIHRoaXMuY29udGFpbmVyLmh0bWwoJycpO1xuICB2YXIgZGVmZXIgPSBRLmRlZmVyKCk7XG5cbiAgaWYoISF0aGlzLl90aXRsZSl7XG5cbiAgICB0aGlzLmxhYmVsID0gQ0UoJ2xhYmVsJywgJ2l0ZW0nLCAnaXRlbS1pbnB1dCcsICdpdGVtLXN0YWNrZWQtbGFiZWwnKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5sYWJlbCk7XG5cbiAgICB0aGlzLnRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJyk7XG4gICAgdGhpcy50aXRsZS50ZXh0KHRoaXMuX3RpdGxlKTtcbiAgICB0aGlzLmxhYmVsLmFwcGVuZCh0aGlzLnRpdGxlKTtcbiAgfVxuXG4gIHRoaXMubWVzc2FnZSA9IENFKCdzcGFuJywgJ3dkbCcsICdlcnJvcicpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5tZXNzYWdlKTtcblxuICB0aGlzLmlucHV0cyA9IENFKCdkaXYnLCAnYm94Jyk7XG4gIHRoaXMubWFrZUlucHV0cygpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQodGhpcy5pbnB1dHMpO1xuXG4gIHRoaXMuX21ha2UgPSB0cnVlO1xuXG4gIGRlZmVyLnJlc29sdmUoKTtcbiAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG59O1xuXG52aWV3LnByb3RvdHlwZS5tYWtlSW5wdXRzID0gZnVuY3Rpb24oKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuaW5wdXRzLmh0bWwoJycpO1xuXG4gIGZvcih2YXIgeCBpbiB0aGlzLmxpc3Qpe1xuXG4gICAgdmFyIGtleSAgID0gdGhpcy5saXN0W3hdWzBdO1xuICAgIHZhciBsYWJlbCA9IHRoaXMubGlzdFt4XVsxXTtcblxuICAgIHZhciBpbnB1dCA9IENFKCdpbnB1dCcpLmF0dHIoe3R5cGU6ICdyYWRpbycsIG5hbWU6IHRoaXMubmFtZSwgdmFsdWU6IGtleX0pO1xuICAgIGlmKCF0aGlzLl9lZGl0KSBpbnB1dC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIGlucHV0LmNzcyh7ZmxvYXQ6ICdyaWdodCcsIHdpZHRoOiAnMzBweCcsIGhlaWdodDogJzJlbScsIGJvcmRlcjogJzBweCd9KTtcbiAgICB0aGlzLmlucHV0cy5hcHBlbmQoQ0UoJ2xhYmVsJywgJ2l0ZW0nKS50ZXh0KGxhYmVsKS5hcHBlbmQoaW5wdXQpKTtcblxuICAgIGlmKHRoaXMudmFsdWUgPT0ga2V5KSBpbnB1dC5hdHRyKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgfVxuXG4gIHRoaXMuaW5wdXRzLmNoYW5nZShmdW5jdGlvbihlKXsgc2VsZi52YWx1ZSA9IHNlbGYuY29udGFpbmVyLmZpbmQoJzpjaGVja2VkJykudmFsKCk7IHNlbGYub25jaGFuZ2UuY2FsbChzZWxmLCBlKTsgfSk7XG59O1xuXG52aWV3LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihrZXksIGxhYmVsKXtcbiAgdGhpcy5saXN0LnB1c2goW2tleSwgbGFiZWxdKTtcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciB2aWV3ID0gZnVuY3Rpb24obmFtZSl7XG5cbiAgQmFzZS5jYWxsKHRoaXMsIG5hbWUpO1xuICB0aGlzLmxpc3QgICAgICA9IFtdO1xuICB0aGlzLmNvbnRhaW5lciA9IENFKCdsYWJlbCcsICdpdGVtJywgJ2l0ZW0tc2VsZWN0Jyk7XG59O1xudmlldy5wcm90b3R5cGUgPSBuZXcgQmFzZTtcbnZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gdmlldztcbm1vZHVsZS5leHBvcnRzID0gdmlldztcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdGhpcy5jb250YWluZXIuaHRtbCgnJyk7XG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcblxuICB0aGlzLnRpdGxlID0gQ0UoJ3NwYW4nLCAnd2RsJyk7XG4gIHRoaXMudGl0bGUudGV4dCh0aGlzLl90aXRsZSk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0aGlzLnRpdGxlKTtcblxuICB0aGlzLm1lc3NhZ2UgPSBDRSgnc3BhbicsICd3ZGwnLCAnZXJyb3InKTtcbiAgdGhpcy5jb250YWluZXIuYXBwZW5kKHRoaXMubWVzc2FnZSk7XG5cbiAgdGhpcy5pbnB1dHMgPSBDRSgnc2VsZWN0Jyk7XG4gIGlmKCF0aGlzLl9lZGl0KSAgdGhpcy5pbnB1dHMuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgdGhpcy5tYWtlSW5wdXRzKCk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZCh0aGlzLmlucHV0cyk7XG5cbiAgdGhpcy5fbWFrZSA9IHRydWU7XG5cbiAgZGVmZXIucmVzb2x2ZSgpO1xuICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbn07XG5cbnZpZXcucHJvdG90eXBlLm1ha2VJbnB1dHMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLmlucHV0cy5odG1sKCcnKTtcbiAgdGhpcy5pbnB1dHMub2ZmKCdjaGFuZ2UnKTtcbiAgXG4gIHZhciBvcHRpb24gPSBDRSgnb3B0aW9uJykuY3NzKHsnZGlzcGxheSc6ICdub25lJ30pLnZhbCgnJyk7XG4gIHRoaXMuaW5wdXRzLmFwcGVuZChvcHRpb24pO1xuXG4gIGZvcih2YXIgeCBpbiB0aGlzLmxpc3Qpe1xuXG4gICAgdmFyIGtleSAgID0gdGhpcy5saXN0W3hdWzBdO1xuICAgIHZhciBsYWJlbCA9IHRoaXMubGlzdFt4XVsxXTtcblxuICAgIHZhciBvcHRpb24gPSBDRSgnb3B0aW9uJykudmFsKGtleSkudGV4dChsYWJlbCk7XG4gICAgdGhpcy5pbnB1dHMuYXBwZW5kKG9wdGlvbik7XG5cbiAgICBpZih0aGlzLnZhbHVlID09IGtleSkgb3B0aW9uLmF0dHIoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJyk7XG4gIH1cblxuICB0aGlzLmlucHV0cy5vbignY2hhbmdlJywgZnVuY3Rpb24oKXsgc2VsZi52YWx1ZSA9IHNlbGYuY29udGFpbmVyLmZpbmQoJzpzZWxlY3RlZCcpLnZhbCgpOyBzZWxmLm9uY2hhbmdlLmNhbGwoc2VsZiwgc2VsZi52YWx1ZSk7IH0pO1xufTtcblxudmlldy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oa2V5LCBsYWJlbCl7XG4gIHRoaXMubGlzdC5wdXNoKFtrZXksIGxhYmVsXSk7XG59O1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxudmFyIHZpZXcgPSBmdW5jdGlvbihuYW1lKXtcblxuICBCYXNlLmNhbGwodGhpcywgbmFtZSk7XG5cbiAgdGhpcy5tYXhsZW5ndGggPSBudWxsO1xufTtcbnZpZXcucHJvdG90eXBlID0gbmV3IEJhc2U7XG52aWV3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHZpZXc7XG5tb2R1bGUuZXhwb3J0cyA9IHZpZXc7XG5cbnZpZXcucHJvdG90eXBlLnNldE1heGxlbmdodCA9IGZ1bmN0aW9uKHNpemUpe1xuXG4gIHRoaXMubWF4bGVuZ3RoID0gc2l6ZTtcbn07XG5cbnZpZXcucHJvdG90eXBlLm1ha2VJbnB1dHMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5pbnB1dHMuaHRtbCgnJyk7XG4gIHZhciBpbnB1dCA9IENFKCdpbnB1dCcpLmF0dHIoeyd0eXBlJzogJ3RleHQnLCBuYW1lOiB0aGlzLm5hbWV9KTtcblxuICBpZighIXRoaXMubWF4bGVuZ3RoKXtcbiAgICBpbnB1dC5hdHRyKCdtYXhsZW5ndGgnLCB0aGlzLm1heGxlbmd0aCk7XG4gIH1lbHNle1xuICAgIGlucHV0LnJlbW92ZUF0dHIoJ21heGxlbmd0aCcpO1xuICB9XG5cbiAgaWYoISF0aGlzLnZhbHVlKSBpbnB1dC52YWwodGhpcy52YWx1ZSk7XG4gIGlmKCF0aGlzLl9lZGl0KSAgaW5wdXQuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgaW5wdXQua2V5dXAoZnVuY3Rpb24oZSl7IHNlbGYudmFsdWUgPSBpbnB1dC52YWwoKTsgc2VsZi5rZXl1cC5jYWxsKHNlbGYsIGUpOyB9KTtcbiAgdGhpcy5pbnB1dHMuYXBwZW5kKGlucHV0KTtcbn07XG5cbnZpZXcucHJvdG90eXBlLmtleXVwID0gZnVuY3Rpb24oKXt9O1xuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxudmFyIHZpZXcgPSBmdW5jdGlvbihuYW1lKXtcblxuICBCYXNlLmNhbGwodGhpcywgbmFtZSk7XG4gIHRoaXMubGlzdCAgICAgID0gW107XG4gIHRoaXMuc2VxdWVuY2UgID0gMDtcbn07XG52aWV3LnByb3RvdHlwZSA9IG5ldyBCYXNlO1xudmlldy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSB2aWV3O1xubW9kdWxlLmV4cG9ydHMgPSB2aWV3O1xuXG52aWV3LnByb3RvdHlwZS5zZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKXtcbiAgdGhpcy50aXRsZSA9IHRpdGxlO1xufTtcblxudmlldy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciBkaXYgPSBDRSgnZGl2JywgJ2Zvcm0tZ3JvdXAnKTtcbiAgdmFyIGxhYmVsID0gQ0UoJ2xhYmVsJykudGV4dCh0aGlzLnRpdGxlKTtcbiAgZGl2LmFwcGVuZChsYWJlbCk7XG5cbiAgdGhpcy5pbnB1dCA9IENFKCdpbnB1dCcsICdmb3JtLWNvbnRyb2wnKS5hdHRyKHt0eXBlOiAndGV4dCd9KTtcbiAgdGhpcy5pbnB1dC5mb2N1c291dChmdW5jdGlvbigpeyBzZWxmLmFkZC5jYWxsKHNlbGYpOyB9KTtcbiAgZGl2LmFwcGVuZCh0aGlzLmlucHV0KTtcblxuICB0aGlzLmxpc3QgPSBDRSgnZGl2JywgJ2JveCcpO1xuICBkaXYuYXBwZW5kKHRoaXMubGlzdCk7XG5cbiAgdGhpcy5vdXRwdXQgPSBDRSgnaW5wdXQnKS5hdHRyKHt0eXBlOiAnaGlkZGVuJywgbmFtZTogdGhpcy5uYW1lfSk7XG4gIGRpdi5hcHBlbmQodGhpcy5vdXRwdXQpO1xuXG4gIHJldHVybiBkaXY7XG59O1xuXG52aWV3LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBmb3VuZCA9IGZhbHNlO1xuXG4gIHZhciB0ZXh0ICA9IHRoaXMuaW5wdXQudmFsKCkudHJpbSgpO1xuICBpZih0ZXh0ID09ICcnKSByZXR1cm47XG5cbiAgdmFyIHJvd2lkID0gcGFyc2VJbnQodGhpcy5pbnB1dC5hdHRyKCdyb3dpZCcpKTtcblxuICBpZihpc05hTihyb3dpZCkpIHJvd2lkID0gLS10aGlzLnNlcXVlbmNlO1xuXG4gIHZhciB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICBmb3IodmFyIHYgaW4gdmFsdWVzKXtcbiAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbdl07XG4gICAgaWYodmFsdWUuaWQgPT0gcm93aWQpe1xuICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgdmFsdWVzW3ZdLnZhbHVlID0gdGV4dDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmKCFmb3VuZCl7XG4gICAgdmFsdWVzLnB1c2goe2lkOiByb3dpZCwgdmFsdWU6IHRleHR9KTtcbiAgfVxuXG4gIHRoaXMuc2V0VmFsdWVzKHZhbHVlcyk7XG4gIHRoaXMucmVmcmVzaCh2YWx1ZXMpO1xuICB0aGlzLmNsZWFyX2lucHV0KCk7XG4gIHRoaXMuaW5wdXQuZm9jdXMoKTtcbn07XG5cbnZpZXcucHJvdG90eXBlLmNsZWFyX2lucHV0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5pbnB1dC52YWwoJycpO1xuICB0aGlzLmlucHV0LmF0dHIoJ3Jvd2lkJywgJycpO1xufTtcblxudmlldy5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKHZhbHVlcyl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHRoaXMubGlzdC5odG1sKCcnKTtcbiAgdmFyIGRpdiA9IENFKCdkaXYnLCAnYm94JykuY3NzKHsnYm9yZGVyJzogJzFweCBzb2xpZCAjY2NjJywgJ21hcmdpbi10b3AnOiAnNXB4J30pO1xuICB0aGlzLmxpc3QuYXBwZW5kKGRpdik7XG5cbiAgdmFyIHZhbHVlcyA9ICEhdmFsdWVzID8gdmFsdWVzIDogdGhpcy5nZXRWYWx1ZXMoKTtcblxuICBpZih2YWx1ZXMubGVuZ3RoID09IDApe1xuICAgIGRpdi5yZW1vdmUoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IodmFyIHYgaW4gdmFsdWVzKXtcbiAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbdl07XG4gICAgdmFyIHJvdyAgID0gQ0UoJ2RpdicsICdib3gnKS5jc3Moeydib3JkZXItYm90dG9tJzogJzFweCBzb2xpZCAjY2NjJywgJ3BhZGRpbmcnOiAnNXB4J30pLmF0dHIoJ3Jvd2lkJywgdmFsdWUuaWQpO1xuICAgIGRpdi5hcHBlbmQocm93KTtcbiAgICB2YXIgdGV4dCAgPSBDRSgnc3BhbicsICdsZWZ0JykudGV4dCh2YWx1ZS52YWx1ZSk7XG4gICAgcm93LmFwcGVuZCh0ZXh0KTtcblxuICAgIChmdW5jdGlvbih2YWx1ZSl7XG5cbiAgICAgIHZhciBkZWwgID0gQ0UoJ2J1dHRvbicsICdidG4nLCAnYnRuLWRhbmdlcicsICdidG4teHMnLCAncmlnaHQnKS5hdHRyKHt0eXBlOiAnYnV0dG9uJ30pLnRleHQoJ0FwYWdhcicpO1xuICAgICAgZGVsLmNsaWNrKGZ1bmN0aW9uKCl7IHNlbGYuZGVsZXRlLmNhbGwoc2VsZiwgdmFsdWUuaWQpIH0pO1xuICAgICAgcm93LmFwcGVuZChkZWwpO1xuXG4gICAgICB2YXIgZWRpdCA9IENFKCdidXR0b24nLCAnYnRuJywgJ2J0bi13YXJuaW5nJywgJ2J0bi14cycsICdyaWdodCcpLmF0dHIoe3R5cGU6ICdidXR0b24nfSkudGV4dCgnRWRpdGFyJyk7XG4gICAgICBlZGl0LmNsaWNrKGZ1bmN0aW9uKCl7IHNlbGYuZWRpdC5jYWxsKHNlbGYsIHZhbHVlLmlkKSB9KTtcbiAgICAgIHJvdy5hcHBlbmQoZWRpdCk7XG5cbiAgICB9KSh2YWx1ZSk7XG4gIH07XG59O1xuXG52aWV3LnByb3RvdHlwZS5lZGl0ID0gZnVuY3Rpb24oaWQpe1xuXG4gIHZhciB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICB2YXIgc2VsZiAgID0gdGhpcztcblxuICBmb3IodmFyIHYgaW4gdmFsdWVzKXtcbiAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbdl07XG4gICAgaWYodmFsdWUuaWQgPT0gaWQpe1xuICAgICAgc2VsZi5pbnB1dC52YWwodmFsdWUudmFsdWUpO1xuICAgICAgc2VsZi5pbnB1dC5hdHRyKCdyb3dpZCcsIHZhbHVlLmlkKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxudmlldy5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24oaWQpe1xuXG4gIHZhciB2YWx1ZXMgPSB0aGlzLmdldFZhbHVlcygpO1xuICB2YXIgc2VsZiAgID0gdGhpcztcblxuICBmb3IodmFyIHYgaW4gdmFsdWVzKXtcbiAgICB2YXIgdmFsdWUgPSB2YWx1ZXNbdl07XG4gICAgaWYodmFsdWUuaWQgPT0gaWQpe1xuXG4gICAgICB2YWx1ZXMuc3BsaWNlKHYsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zZXRWYWx1ZXModmFsdWVzKTtcbiAgdGhpcy5yZWZyZXNoKCk7XG59O1xuXG52aWV3LnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBqc29uX2RhdGEgPSB0aGlzLm91dHB1dC52YWwoKTtcbiAgaWYoanNvbl9kYXRhID09ICcnKSBqc29uX2RhdGEgPSAnW10nO1xuICByZXR1cm4gSlNPTi5wYXJzZShqc29uX2RhdGEpO1xufTtcblxudmlldy5wcm90b3R5cGUuc2V0VmFsdWVzID0gZnVuY3Rpb24odmFsdWVzKXtcblxuICB2YXIganNvbl9kYXRhID0gSlNPTi5zdHJpbmdpZnkodmFsdWVzKTtcbiAgdGhpcy5vdXRwdXQudmFsKGpzb25fZGF0YSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdCYXNlJzogICByZXF1aXJlKCcuL2Jhc2UnKSxcbiAgJ01vZGFsJzogIHJlcXVpcmUoJy4vbW9kYWwnKSxcbiAgJ2ZpZWxkJzogIHJlcXVpcmUoJy4vZmllbGQvaW5kZXgnKSxcbiAgJ21vZGFsJzogIHJlcXVpcmUoJy4vbW9kYWwvaW5kZXgnKSxcbn07XG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4vbW9kYWwvYmFzZScpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBtb2RhbCA9IGZ1bmN0aW9uKCl7XG5cbiAgQmFzZS5jYWxsKHRoaXMpO1xuXG4gIHRoaXMuX3RpdGxlICAgICAgICA9ICcnO1xuICB0aGlzLl9ib2R5ICAgICAgICAgPSBudWxsO1xuICB0aGlzLl9sZWZ0X2J1dHRvbiAgPSBudWxsO1xuICB0aGlzLl9yaWdodF9idXR0b24gPSBudWxsO1xufTtcbm1vZGFsLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xubW9kYWwucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbW9kYWw7XG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xuXG5cbm1vZGFsLnByb3RvdHlwZS5zZXRCb2R5ID0gZnVuY3Rpb24oYm9keSl7XG5cbiAgdGhpcy5fYm9keSA9IGJvZHk7XG59O1xuXG5tb2RhbC5wcm90b3R5cGUuc2V0TGVmdEJ1dHRvbiA9IGZ1bmN0aW9uKGJ1dHRvbil7XG4gIFxuICB0aGlzLl9sZWZ0X2J1dHRvbiA9IGJ1dHRvbjtcbn07XG5cbm1vZGFsLnByb3RvdHlwZS5zZXRSaWdodEJ1dHRvbiA9IGZ1bmN0aW9uKGJ1dHRvbil7XG5cbiAgdGhpcy5fcmlnaHRfYnV0dG9uID0gYnV0dG9uO1xufTtcblxubW9kYWwucHJvdG90eXBlLnNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUpe1xuXG4gIHRoaXMuX3RpdGxlID0gdGl0bGU7XG59O1xuXG5tb2RhbC5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG4gIFxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBkZWYgID0gUS5kZWZlcigpO1xuXG4gIEJhc2UucHJvdG90eXBlLm1ha2UuY2FsbCh0aGlzKS50aGVuKGZ1bmN0aW9uKCl7XG4gIFxuICAgIHZhciBoYXNIZWFkZXIgPSAhIXNlbGYuX3RpdGxlIHx8ICEhc2VsZi5fbGVmdF9idXR0b24gfHwgISFzZWxmLl9yaWdodF9idXR0b247XG4gICAgaWYoaGFzSGVhZGVyKXtcbiAgICAgIHZhciBoZWFkZXIgPSBDRSgnZGl2JywgJ2JhciBiYXItaGVhZGVyJyk7XG4gICAgICBzZWxmLm1vZGFsLmFwcGVuZChoZWFkZXIpO1xuXG4gICAgICBpZighIXNlbGYuX2xlZnRfYnV0dG9uKSBoZWFkZXIuYXBwZW5kKHNlbGYuX2xlZnRfYnV0dG9uKTtcbiAgICAgIGlmKCEhc2VsZi5fdGl0bGUpe1xuICAgICAgICB2YXIgdGl0bGUgPSBDRSgnaDEnLCAndGl0bGUgdGl0bGUtbGVmdCcpO1xuICAgICAgICBoZWFkZXIuYXBwZW5kKHRpdGxlKTtcbiAgICAgICAgdGl0bGUudGV4dChzZWxmLl90aXRsZSk7XG4gICAgICAgIGlmKCEhc2VsZi5fbGVmdF9idXR0b24pICB0aXRsZS5jc3MoJ2xlZnQnLCAnOTJweCcpO1xuICAgICAgICBpZighIXNlbGYuX3JpZ2h0X2J1dHRvbikgdGl0bGUuY3NzKCdyaWdodCcsICc5MnB4Jyk7XG4gICAgICB9XG4gICAgICBpZighIXNlbGYuX3JpZ2h0X2J1dHRvbikgaGVhZGVyLmFwcGVuZChzZWxmLl9yaWdodF9idXR0b24pO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gQ0UoJ2RpdicsICdzY3JvbGwtY29udGVudCBpb25pYy1zY3JvbGwgb3ZlcmZsb3ctc2Nyb2xsJyk7XG4gICAgaWYoaGFzSGVhZGVyKSBjb250ZW50LmFkZENsYXNzKCdoYXMtaGVhZGVyJyk7XG4gICAgc2VsZi5tb2RhbC5hcHBlbmQoY29udGVudCk7XG4gICAgY29udGVudC5hcHBlbmQoc2VsZi5fYm9keSk7XG5cbiAgICBkZWYucmVzb2x2ZSgpO1xuICB9KTtcblxuICByZXR1cm4gZGVmLnByb21pc2U7XG59O1xuXG4iLCJ2YXIgQmFzZSA9IHJlcXVpcmUoJy4uL2Jhc2UnKTtcbnZhciBiYWNrID0gcmVxdWlyZSgnLi4vLi4vYmFjaycpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBiYXNlID0gZnVuY3Rpb24oKXtcblxuICBCYXNlLmNhbGwodGhpcyk7XG5cbiAgdGhpcy5NT0RBTF9QUklPUklUWSA9IGJhY2suTU9EQUw7XG4gIHRoaXMuY29udGFpbmVyICAgICAgPSBDRSgnZGl2JywgJ21vZGFsLWJhY2tkcm9wIGFjdGl2ZScpO1xufTtcbmJhc2UucHJvdG90eXBlID0gbmV3IEJhc2U7XG5iYXNlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGJhc2U7XG5tb2R1bGUuZXhwb3J0cyA9IGJhc2U7XG5cbmJhc2UucHJvdG90eXBlLm1ha2UgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmICA9IHRoaXM7XG4gIHZhciBkZWZlciA9IFEuZGVmZXIoKTtcblxuICB2YXIgd3JhcHBlciA9IENFKCdkaXYnLCAnbW9kYWwtd3JhcHBlcicpO1xuICB0aGlzLmNvbnRhaW5lci5hcHBlbmQod3JhcHBlcik7XG5cbiAgdGhpcy5tb2RhbCA9IENFKCdkaXYnLCAnbW9kYWwgc2xpZGUtaW4tbGVmdCcpO1xuICB3cmFwcGVyLmFwcGVuZCh0aGlzLm1vZGFsKTtcblxuICBiYWNrLmFkZCh0aGlzLk1PREFMX1BSSU9SSVRZLCBmdW5jdGlvbigpeyBzZWxmLmJhY2suY2FsbChzZWxmKTsgfSk7XG5cbiAgZGVmZXIucmVzb2x2ZSgpO1xuICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbn07XG5cbmJhc2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGRlZiAgPSBRLmRlZmVyKCk7XG5cbiAgdGhpcy5yZW5kZXIoKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgJCgnYm9keScpLmFwcGVuZChzZWxmLmNvbnRhaW5lcik7XG4gICAgZGVmLnJlc29sdmUoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRlZi5wcm9taXNlO1xufTtcblxuYmFzZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKXtcblxuICBiYWNrLnJlbW92ZSh0aGlzLk1PREFMX1BSSU9SSVRZKTtcbiAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG59O1xuXG5iYXNlLnByb3RvdHlwZS5iYWNrID0gZnVuY3Rpb24oKXtcbiAgXG4gIHRoaXMucmVtb3ZlKCk7XG59O1xuIiwidmFyIFBvcHVwID0gcmVxdWlyZSgnLi9wb3B1cCcpO1xudmFyIGJhY2sgID0gcmVxdWlyZSgnLi4vLi4vYmFjaycpO1xudmFyIFEgICAgID0gcmVxdWlyZSgncScpO1xuXG52YXIgZGlhbG9nID0gZnVuY3Rpb24oKXtcblxuICBQb3B1cC5jYWxsKHRoaXMpO1xuXG4gIHRoaXMuTU9EQUxfUFJJT1JJVFkgPSBiYWNrLkRJQUxPRztcbiAgdGhpcy5jb250YWluZXIgPSBDRSgnZGl2JywgJ3BvcHVwLWNvbnRhaW5lciBwb3B1cC1zaG93aW5nIGFjdGl2ZScpO1xuICB0aGlzLmNvbnRhaW5lci5jc3MoeydiYWNrZ3JvdW5kLWNvbG9yJzogJ3JnYmEoMCwgMCwgMCwgMC40KSd9KTtcblxuICB0aGlzLl90aXRsZSAgPSAnJztcbiAgdGhpcy5fYm9keSAgID0gJyc7XG4gIHRoaXMuYnV0dG9ucyA9IFtdO1xufTtcbmRpYWxvZy5wcm90b3R5cGUgPSBuZXcgUG9wdXA7XG5kaWFsb2cucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gZGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBkaWFsb2c7XG5cbmRpYWxvZy5wcm90b3R5cGUubWFrZSA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgZGVmICA9IFEuZGVmZXIoKTtcblxuICBiYWNrLmFkZCh0aGlzLk1PREFMX1BSSU9SSVRZLCBmdW5jdGlvbigpeyBzZWxmLmJhY2suY2FsbChzZWxmKTsgfSk7XG5cbiAgdmFyIHBvcHVwID0gQ0UoJ2RpdicsICdwb3B1cCcpLmNzcyh7J2JhY2tncm91bmQtY29sb3InOiAnI2ZmZid9KTtcbiAgdGhpcy5jb250YWluZXIuYXBwZW5kKHBvcHVwKTtcblxuICBpZighIXRoaXMuX3RpdGxlKXtcbiAgICB2YXIgaGVhZCA9IENFKCdkaXYnLCAncG9wdXAtaGVhZCcpO1xuICAgIHBvcHVwLmFwcGVuZChoZWFkKTtcbiAgICBoZWFkLmFwcGVuZChDRSgnaDMnLCAncG9wdXAtdGl0bGUnKS50ZXh0KHRoaXMuX3RpdGxlKSk7XG4gIH1cblxuICB2YXIgYm9keSA9IENFKCdkaXYnLCAncG9wdXAtYm9keScpO1xuICBwb3B1cC5hcHBlbmQoYm9keSk7XG4gIGJvZHkuYXBwZW5kKENFKCdzcGFuJykudGV4dCh0aGlzLl9ib2R5KSk7XG5cbiAgaWYoISF0aGlzLmJ1dHRvbnMubGVuZ3RoKXtcbiAgXG4gICAgdmFyIGJ1dHRvbnMgPSBDRSgnZGl2JywgJ3BvcHVwLWJ1dHRvbnMnKTtcbiAgICBwb3B1cC5hcHBlbmQoYnV0dG9ucyk7XG4gICAgZm9yKHZhciBiIGluIHRoaXMuYnV0dG9ucykgYnV0dG9ucy5hcHBlbmQodGhpcy5idXR0b25zW2JdKTtcbiAgfVxuXG4gIGRlZi5yZXNvbHZlKCk7XG4gIHJldHVybiBkZWYucHJvbWlzZTtcbn07XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnQmFzZSc6ICAgcmVxdWlyZSgnLi9iYXNlJyksXG4gICdEaWFsb2cnOiByZXF1aXJlKCcuL2RpYWxvZycpLFxuICAnUG9wdXAnOiAgcmVxdWlyZSgnLi9wb3B1cCcpLFxufVxuIiwidmFyIEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcbnZhciBiYWNrID0gcmVxdWlyZSgnLi4vLi4vYmFjaycpO1xudmFyIFEgICAgPSByZXF1aXJlKCdxJyk7XG5cbnZhciBwb3B1cCA9IGZ1bmN0aW9uKCl7XG5cbiAgQmFzZS5jYWxsKHRoaXMpO1xuXG4gIHRoaXMuTU9EQUxfUFJJT1JJVFkgPSBiYWNrLkRJQUxPRztcbiAgdGhpcy5jb250YWluZXIgPSBDRSgnZGl2JywgJ3BvcHVwLWNvbnRhaW5lciBwb3B1cC1zaG93aW5nIGFjdGl2ZScpO1xuICB0aGlzLmNvbnRhaW5lci5jc3MoeydiYWNrZ3JvdW5kLWNvbG9yJzogJ3JnYmEoMCwgMCwgMCwgMC40KSd9KTtcblxuICB0aGlzLl90aXRsZSAgPSAnJztcbiAgdGhpcy5fYm9keSAgID0gJyc7XG4gIHRoaXMuYnV0dG9ucyA9IFtdO1xufTtcbnBvcHVwLnByb3RvdHlwZSA9IG5ldyBCYXNlO1xucG9wdXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gcG9wdXA7XG5tb2R1bGUuZXhwb3J0cyA9IHBvcHVwO1xuXG5wb3B1cC5wcm90b3R5cGUuc2V0VGl0bGUgPSBmdW5jdGlvbih0aXRsZSl7XG5cbiAgdGhpcy5fdGl0bGUgPSB0aXRsZTtcbn07XG5cbnBvcHVwLnByb3RvdHlwZS5zZXRCb2R5ID0gZnVuY3Rpb24oYm9keSl7XG5cbiAgdGhpcy5fYm9keSA9IGJvZHk7XG59O1xuXG5wb3B1cC5wcm90b3R5cGUuYWRkQnV0dG9uID0gZnVuY3Rpb24oYnV0dG9uKXtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGJ1dHRvbi5jbGljayhmdW5jdGlvbigpeyBzZWxmLnJlbW92ZS5jYWxsKHNlbGYpIH0pO1xuICB0aGlzLmJ1dHRvbnMucHVzaChidXR0b24pO1xufTtcblxucG9wdXAucHJvdG90eXBlLm1ha2UgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGRlZiAgPSBRLmRlZmVyKCk7XG5cbiAgYmFjay5hZGQodGhpcy5NT0RBTF9QUklPUklUWSwgZnVuY3Rpb24oKXsgc2VsZi5iYWNrLmNhbGwoc2VsZik7IH0pO1xuXG4gIHZhciBwb3B1cCA9IENFKCdkaXYnLCAncG9wdXAnKS5jc3MoeydiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZmYnfSk7XG4gIHRoaXMuY29udGFpbmVyLmFwcGVuZChwb3B1cCk7XG5cbiAgaWYoISF0aGlzLl90aXRsZSl7XG4gICAgdmFyIGhlYWQgPSBDRSgnZGl2JywgJ3BvcHVwLWhlYWQnKTtcbiAgICBwb3B1cC5hcHBlbmQoaGVhZCk7XG4gICAgaGVhZC5hcHBlbmQoQ0UoJ2gzJywgJ3BvcHVwLXRpdGxlJykudGV4dCh0aGlzLl90aXRsZSkpO1xuICB9XG5cbiAgdmFyIGJvZHkgPSBDRSgnZGl2JywgJ3BvcHVwLWJvZHknKTtcbiAgYm9keS5hcHBlbmQodGhpcy5fYm9keSk7XG4gIHBvcHVwLmFwcGVuZChib2R5KTtcblxuICBpZighIXRoaXMuYnV0dG9ucy5sZW5ndGgpe1xuICBcbiAgICB2YXIgYnV0dG9ucyA9IENFKCdkaXYnLCAncG9wdXAtYnV0dG9ucycpO1xuICAgIHBvcHVwLmFwcGVuZChidXR0b25zKTtcbiAgICBmb3IodmFyIGIgaW4gdGhpcy5idXR0b25zKSBidXR0b25zLmFwcGVuZCh0aGlzLmJ1dHRvbnNbYl0pO1xuICB9XG5cbiAgZGVmLnJlc29sdmUoKTtcbiAgcmV0dXJuIGRlZi5wcm9taXNlO1xufTtcblxuIl19
