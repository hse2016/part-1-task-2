'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(executor) {
        this.state = 'PENDING';
        this.handlers = [];
        this.value = null;

        executor(this.resolve.bind(this), this.reject.bind(this));

    }

    handle (handler) {
        if (this.state === 'PENDING') {
            this.handlers.push(handler);
        } else {
            if (this.state === 'FULFILLED' &&
                typeof handler.onFulfilled === 'function') {
                handler.onFulfilled(this.value);
            }
            if (this.state === 'REJECTED' &&
                typeof handler.onRejected === 'function') {
                handler.onRejected(this.value);
            }
        }
    }


    done (onFulfilled, onRejected) {
        var self = this;
        setTimeout(function () {
            self.handle({
                onFulfilled: onFulfilled,
                onRejected: onRejected
            });
        }, 0);
    }

    then (onFulfilled, onRejected) {
        var self = this;
        return new SuperPromise(function (resolve, reject) {
            return self.done(function (result) {
                if (typeof onFulfilled === 'function') {
                    try {
                        return resolve(onFulfilled(result));
                    } catch (ex) {
                        return reject(ex);
                    }
                } else {
                    return resolve(result);
                }
            }, function (error) {
                if (typeof onRejected === 'function') {
                    try {
                        return resolve(onRejected(error));
                    } catch (ex) {
                        return reject(ex);
                    }
                } else {
                    return reject(error);
                }
            });
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    /* PART 2 */

    fulfill(result) {
        this.handlers.forEach(handle);
        this.handlers = null;
        this.state = 'FULFILLED';
        this.value = result;
    }

    getThen(value) {
        var t = typeof value;
        if (value && (t === 'object' || t === 'function')) {
            var then = value.then;
            if (typeof then === 'function') {
                return then;
            }
        }
        return null;
    }

    static resolve(result) {
        return new SuperPromise((resolve) => resolve(result));
    }

    resolve(result) {
        var self = this;
        try {
            var then = self.getThen(result);
            if (then) {
                doResolve(then.bind(result), resolve, reject);
                return;
            }
            this.fulfill(result);
        } catch (e) {
            this.reject(e);
        }
        return this;
    }

    // нужно создавать static отдельно, иначе tasks не видит их как функцию
    static reject(error) {
        return new SuperPromise((reject) => reject(error));
    }

    reject(error) {
        this.state = 'REJECTED';
        this.value = error;
    }

    static doResolve(fn, onFulfilled, onRejected) {
        var done = false;
        try {
            fn(function (value) {
                if (done) return;
                done = true;
                onFulfilled(value);
            }, function (reason) {
                if (done) return;
                done = true;
                onRejected(reason);
            })
        } catch (ex) {
            if (done) return;
            done = true;
            onRejected(ex);
        }
    }

    static all (promises) {
        var accumulator = [];
        var ready = SuperPromise.resolve(null);

        promises.forEach(function (promise, ndx) {
            ready = ready.then(function () {
                return promise;
            }).then(function (value) {
                accumulator[ndx] = value;
            });
        });

        return ready.then(function () { return accumulator; });
    }

    static race() {}

    /* PART 3 */
    static queue() {

    }

    static stack() {

    }
}

module.exports = SuperPromise; // TODO: kek



