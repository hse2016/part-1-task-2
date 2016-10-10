'use strict';
// NO REQUIRE

let isThenable = function (obj) {
    return obj !== null && (typeof obj === 'object' || typeof obj === 'function') && ('then' in obj);
};

let resolve = function (promise) {
    return function(value) {
        if (!(promise._state === SuperPromise.PENDING)) {
            return;
        }

        promise._state = SuperPromise.RESOLVED;
        promise._data = value;
        callbackResolve(promise);
    };
};

let reject = function (promise) {
    return function(reason) {
        if (!(promise._state === SuperPromise.PENDING)) {
            return;
        }
        promise._state = SuperPromise.REJECTED;
        promise._data = reason;
        callbackReject(promise);
    };
};

let callbackReject = function(promise) {
    if (promise._state === SuperPromise.REJECTED) {
        setTimeout(function(){
            while (promise._iter < promise._onRejectedStack.length) {
                let onRejection = promise._onRejectedStack[promise._iter];
                let nextPromise = promise._promiseStack[promise._iter];
                try {
                    if (typeof onRejection === 'function') {
                        let callback = onRejection(promise._data);
                        invokeNextPromise(nextPromise, callback);
                    } else {
                        nextPromise._rejected(promise._data);
                    }
                } catch (e) {
                    nextPromise._rejected(e);
                }
                promise._iter += 1;

            }
        });
    }
};

let callbackResolve = function(promise) {
    if (promise._state === SuperPromise.RESOLVED) {
        setTimeout(function() {
            while (promise._iter < promise._onResolveStack.length) {
                let onResolved = promise._onResolveStack[promise._iter];
                let nextPromise = promise._promiseStack[promise._iter];
                try {
                    if (typeof onResolved === 'function') {
                        let callback = onResolved(promise._data);
                        invokeNextPromise(nextPromise, callback);
                    } else {
                        nextPromise._resolve(promise._data);
                    }
                } catch (e) {
                    nextPromise._rejected(e);
                }
                promise._iter += 1;

            }
        });
    }
};

let invokeNextPromise = function(promise, data) {
    if (promise === data) {
        promise._rejected(new TypeError());
    }

    if (isThenable(data)) {
        try {
            let then = data.then;
            let temp = false;
            try {
                if (typeof then === 'function') {
                    then.apply(data, [
                        function(nextData) {
                            if (!temp) {
                                temp = true;
                                invokeNextPromise(promise, nextData);
                            }
                        },
                        function(reason) {
                            if (!temp) {
                                temp = true;
                                promise._rejected(reason);
                            }
                        }
                    ]);
                } else {
                    promise._resolve(data);
                }
            } catch (e) {
                if (! temp) {
                    temp = true;
                    promise._rejected(e);
                }
            }
        }
        catch(e) {
            promise._rejected(e);
        }
    } else {
        promise._resolve(data);
    }
};



class SuperPromise {

    constructor(executor) {

        if (typeof executor != 'function') {
            throw new TypeError();
        }
        this._state = SuperPromise.PENDING; //0 - pending, 1 - resolved, 2 - rejected
        this._onResolveStack = [];
        this._onRejectedStack = [];
        this._promiseStack = [];
        this._iter = 0;


        this._resolve = resolve(this);
        this._rejected = reject(this);

        executor(this._resolve, this._rejected);
    }

    then(onResolve, onRejection) {
        if (typeof onResolve === 'function') {
            this._onResolveStack.push(onResolve);
        } else {
            this._onResolveStack.push(null);
        }

        if (typeof onRejection === 'function') {
            this._onRejectedStack.push(onRejection);
        } else {
            this._onRejectedStack.push(null);
        }

        let p = new SuperPromise(function(){});
        this._promiseStack.push(p);

        if (this._state === SuperPromise.RESOLVED) {
            callbackResolve(this);
        } else if (this._state === SuperPromise.REJECTED) {
            callbackReject(this);
        }
        return p;
    }

    catch(onRejection) {
        return this.then(null, onRejection);
    }

    /* PART 2 */
    static resolve(value) {

        let promise = new SuperPromise(function () {});
        promise._state = SuperPromise.RESOLVED;
        promise._data = value;

        return promise;
    }

    static reject(reason) {

        let promise = new SuperPromise(function () {});
        promise._state = SuperPromise.REJECTED;
        promise._data = reason;

        return promise;
    }

    static all(iterable) {

        if(!(Array.isArray(iterable))) {
            throw new TypeError('You should pass array');
        }

        return new SuperPromise(function(resolve, reject){
            let results = [];
            let count = 0;

            function resolver(index){
                count++;
                return function(value){
                    results[index] = value;
                    if (!--count)
                        resolve(results);
                };
            }

            for (let index in iterable)
            {
                let promise = iterable[index];
                if (promise && typeof promise.then === 'function')
                    promise.then(resolver(index), reject);
                else
                    results[index] = promise;
            }

            if (!count)
                resolve(results);
        });

    }

    static race(iterable) {
        if(!(Array.isArray(iterable))) {
            throw new TypeError('You should pass array');
        }

        return new SuperPromise(function(resolve, reject){

            for (let index in iterable)
            {
                let promise = iterable[index];
                if (promise && typeof promise.then === 'function')
                    promise.then(resolve, reject);
                else
                    resolve(promise);
            }
        });
    }

    /* PART 3 */
    static queue(iterable) {
        if(!(Array.isArray(iterable))) {
            throw new TypeError('You should pass array');
        }

        return new SuperPromise(function(resolve, reject) {
            let currentPromise = SuperPromise.resolve();

            for (let index in iterable) {
                let promise = iterable[index];
                currentPromise = currentPromise.then(promise);
            }
            currentPromise = currentPromise.then(resolve, reject);
        });
    }

    static stack(iterable) {
        return SuperPromise.queue(iterable.reverse());
    }

    /**
     * @return {number}
     */
    static get RESOLVED() {
        return 1;
    }

    /**
     * @return {number}
     */
    static get REJECTED() {
        return 2;
    }

    /**
     * @return {number}
     */
    static get PENDING() {
        return 0;
    }
}

module.exports = SuperPromise; // TODO: kek
