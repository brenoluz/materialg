(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.materialg = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
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
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
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
    } else {
        Q = definition();
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

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

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
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
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

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
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
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
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
    if (isPromise(value)) {
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
            nextTick(function () {
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
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
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
            nextTick(function () {
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
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
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

    nextTick(function () {
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
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
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
    nextTick(function () {
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
                    return result.value;
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
                        return exception.value;
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
    nextTick(function () {
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
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
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
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
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
        nextTick(function () {
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
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
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
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require('_process'))
},{"_process":26}],2:[function(require,module,exports){
var Q = require('q');

var base = function(){};
module.exports = base;

base.prototype.make = function(){
  
  var def = Q.defer();
  def.resolve();
  return def.promise;
};

},{"q":1}],3:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');
var View = require('./view/base');

var controller = function(params){
  this.params = params;
  this.view   = new View;
};
controller.prototype = new Base;
controller.prototype.constructor = controller;

controller.prototype.make = function(){
  return this.view.render();
};

module.exports = controller;

},{"./base":2,"./view/base":17,"q":1}],4:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var form = function(){};
form.prototype = new Base;
form.prototype.constructor = form;
module.exports = form;

form.prototype.elements = [];

form.prototype.append = function(element){

    this.elements.push(element);
};

form.prototype.isValid = function(cb, obj){

  var promises = [];
  for(var e in this.elements){
    var element = this.elements[e];
    var def = Q.defer();
    element.isValid(def.resolve, obj);
    promises.push(def.promise);
  }

  Q.all(promises).then(function(data){

    var args = Array.prototype.slice.call(data);
    cb(args.indexOf(false) < 0);
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
    var name    = !!element.name ? element.name : element.attr('name');
    if(!!name)  values[name] = element.getValue();
  }

  return values;
};

},{"./base":2,"q":1}],5:[function(require,module,exports){
module.exports = {
  'Base':       require('./base'),
  'Form':       require('./form'),
  'Controller': require('./controller'),
  'view':       require('./view/index'),
  'validate':   require('./validate/index'),
  'plugins':    require('./plugins/index'),
};

},{"./base":2,"./controller":3,"./form":4,"./plugins/index":7,"./validate/index":14,"./view/index":25}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
module.exports = {
  'Date':   require('./date'),
};

},{"./date":6}],8:[function(require,module,exports){
var Base = require('../base');

var base = function(){};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;


},{"../base":2}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
var Base = require('./base');

var dateAtOrBelow = function(date){

  this.date = date;
  this.msg  = 'Data futura inválida';
};
dateAtOrBelow.prototype = new Base;
dateAtOrBelow.prototype.constructor = dateAtOrBelow;
module.exports = dateAtOrBelow;

dateAtOrBelow.prototype.isValid = function(value, cb){

  var value = new Date(value.split('-'));
  if(value.getTime() > this.date.getTime()) return cb(false);
  cb(true);
};

},{"./base":8}],12:[function(require,module,exports){
var Base = require('./base');

var dateAtOrOver = function(date){

  this.date = date;
  this.msg  = 'A data deve ser igual ou superior a {0}'.format(date.toLocaleDateString());
};
dateAtOrOver.prototype = new Base;
dateAtOrOver.prototype.constructor = dateAtOrOver;
module.exports = dateAtOrOver;

dateAtOrOver.prototype.isValid = function(value, cb){

  var value = new Date(value.split('-'));
  if(value.getTime() < this.date.getTime()) return cb(false);
  cb(true);
};

},{"./base":8}],13:[function(require,module,exports){
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
        console.log(value, element.name);
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

},{}],14:[function(require,module,exports){
module.exports = {
  'Container':         require('./container'),
  'Decorator':         require('./decorator'),
  'Checked':           require('./checked'),
  'NotEmpty':          require('./notEmpty'),
  'NotEmptyDependent': require('./notEmptyDependent'),
  'DateAtOrBelow':     require('./dateAtOrBelow'),
  'DateAtOrOver':      require('./dateAtOrOver'),
};

},{"./checked":9,"./container":10,"./dateAtOrBelow":11,"./dateAtOrOver":12,"./decorator":13,"./notEmpty":15,"./notEmptyDependent":16}],15:[function(require,module,exports){
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

},{"./base":8}],16:[function(require,module,exports){
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

},{"./base":8}],17:[function(require,module,exports){
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
    });
  }

  var onpre = function(){ self.make().then(onmake); };

  for(var k in this.pre_make){
    var pre_function = this.pre_make[k];
    var resp = pre_function.call(self);
    if(typeof(resp) == 'object') pre_promises.push(resp);
  }
  Q.all(pre_promises).then(onpre);

  return defer.promise;
};

module.exports = base;

},{"../base":2,"q":1}],18:[function(require,module,exports){
var Base = require('../base');
var Q    = require('q');

var base = function(name){
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');

	this.name      = null;
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
};
base.prototype = new Base;
base.prototype.constructor = base;
module.exports = base;

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

base.prototype.isValid = function(cb, obj) {

  var self = this;
  var res = true;
  var promises = [];
  var value = this.getValue();

  self.message.text('');
  this.container.removeClass('invalid');

  for(var v in this.validators){
    var validator = this.validators[v];
    var def = Q.defer();
    validator.isValid(value, function(res) {
      if(!res){
        self.message.text(validator.msg);
        self.container.addClass('invalid');
      }
      def.resolve(res);
    }, obj);
    promises.push(def.promise);
  }

  Q.all(promises).then(function(data){
   
    var args = Array.prototype.slice.call(data);
    if (args.indexOf(false) >= 0) {
      cb(false);
    }else{
      cb(true);
    }
  });
};

base.prototype.make = function(){

  this.container.html('');
  var defer = Q.defer();

  this.title = CE('span', 'wdl');
  this.title.text(this._title);
  this.container.append(this.title);

  this.message = CE('span', 'wdl', 'error');
  this.container.append(this.message);

  this.inputs = CE('div', 'box');
  this.makeInputs();
  this.container.append(this.inputs);

  defer.resolve();
  return defer.promise;
};

base.prototype.val = function(value){

  if(value === undefined){
    return this.value;
  }else{
    this.value = value;
    this.makeInputs();
  }
};

base.prototype.attr        = function(){ /*for overwrite*/ };
base.prototype.removeClass = function(){ /*for overwrite*/ };
base.prototype.makeInputs  = function(){ /*for overwrite*/ };
base.prototype.onchange    = function(){ /*for overwrite*/ };

},{"../base":17,"q":1}],19:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');
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

  defer.resolve();
  return defer.promise;
};

view.prototype.makeInputs = function(){

  var self  = this;
  
  this.inputs.off('focusout');
  this.inputs.html('');
 
  var day   = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "31", min: "1",});
  var month = CE('input', 'wdl').attr({'type': 'number', maxlength: "2", max: "12", min: "1",});
  var year  = CE('input', 'wdl').attr({'type': 'number', maxlength: "4", max: "9999", min: "1",});

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

  this.inputs.on('focusout', function(e){

    var $this   = $(this);
    var v_day   = day.val();
    var v_month = month.val();
    var v_year  = year.val();

    if(v_day !== '' && v_month !== '' && year !== ''){
    
      var date = new Date(v_year, v_month - 1, v_day);
      var check = date.getFullYear() == v_year && date.getMonth() + 1 == v_month && date.getDate() == v_day;
      if(check){
        self.value = date;
        self.inputs.removeClass('wrong');
      }else{
        self.value = '';
        self.inputs.addClass('wrong');
      }
    }
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

},{"./base":18,"q":1}],20:[function(require,module,exports){
module.exports = {
  'Base':          require('./base'),
  'Radio':         require('./radio'),
  'Text':          require('./text'),
  'Date':          require('./date'),
  'Select':        require('./select'),
  'TextMultiRow':  require('./textMultiRow'),
};

},{"./base":18,"./date":19,"./radio":21,"./select":22,"./text":23,"./textMultiRow":24}],21:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
  this.title_cont  = CE('span', 'wdl');
  this.title_label = CE('label', 'item', 'item-input', 'item-stacked-label');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.setTitle = function(title){
  this.title = title;
};

view.prototype.make = function(){

  var div = CE('div', 'box');

  div.append(this.title_label);

  this.title_cont.text(this.title);
  this.title_label.append(this.title_cont);

  this.message = CE('span', 'wdl', 'error');
  this.title_label.append(this.message);

  this.container = CE('div', 'box');
  this.makeInputs();
  div.append(this.container);

  return div;
};

view.prototype.makeInputs = function(){

  var self = this;
  this.container.html('');

  for(var x in this.list){

    var key   = this.list[x][0];
    var label = this.list[x][1];

    var input = CE('input').attr({type: 'radio', name: this.name, value: key});
    input.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.container.append(CE('label', 'item').text(label).append(input));

    if(this.value == key) input.attr('checked', 'checked');
  }

  this.container.change(function(){ self.value = self.container.find(':checked').val(); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":18}],22:[function(require,module,exports){
var Base = require('./base');
var Q    = require('q');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
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
  this.makeInputs();
  this.container.append(this.inputs);

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
    option.css({float: 'right', width: '30px', height: '2em', border: '0px'});
    this.inputs.append(option);

    if(this.value == key) option.attr('selected', 'selected');
  }

  this.inputs.on('change', function(){ self.value = self.container.find(':selected').val(); self.onchange.call(self, self.value); });
};

view.prototype.add = function(key, label){
  this.list.push([key, label]);
};

},{"./base":18,"q":1}],23:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.container = CE('label', 'item', 'item-input', 'item-stacked-label');
};
view.prototype = new Base;
view.prototype.constructor = view;
module.exports = view;

view.prototype.makeInputs = function(){

  var self = this;
  this.inputs.html('');
  var input = CE('input').attr({'type': 'text', name: this.name});
  if(!!this.value) input.val(this.value);
  input.keyup(function(e){ self.value = input.val(); });
  this.inputs.append(input);
}

},{"./base":18}],24:[function(require,module,exports){
var Base = require('./base');

var view = function(name){

  this.list      = [];
  this.name      = !!name ? name : '';
  this.title     = '';
  this.value     = '';
  this.container = null;
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

},{"./base":18}],25:[function(require,module,exports){
module.exports = {
  'Base':   require('./base'),
  'field':  require('./field/index'),
};

},{"./base":17,"./field/index":20}],26:[function(require,module,exports){
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

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[5])(5)
});