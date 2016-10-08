'use strict';
// NO REQUIRE

class SuperPromise {
    constructor(executor) {
        //console.log('constructor');
        this.fulfilled = false;
        this.rejected = false;
        this.callbacks = []
        this.lastPromise = this;
        this.parentPromise = this;
        this.hasRemainingCallbacks = false;
        this.value = null;
        this.state = null;
        var exceptionalFunction = function(resolveCallback, rejectCallback) {
            var result;
            try {
                result = executor(resolveCallback, rejectCallback);
                this.parentPromise.value = result;
            } catch (e) {
                this.parentPromise.value = e;
                rejector(e);
            }
            return result;
        }
        this.execFunc = exceptionalFunction.bind(this, this.manageCallbacks.bind(this, true), this.manageCallbacks.bind(this, false));
        setTimeout(this.execFunc, 0);
    }

    then(onResolve, onRejection) {
        // console.log('then');
        if (onResolve) {
            this.callbacks.push({result: true, callback: onResolve});
        }
        if (onRejection) {
            this.callbacks.push({result: false, callback: onRejection});
        }
        if (!this.fulfilled && !this.rejected) {
            this.hasRemainingCallbacks = true;
        }
        if (!this.hasRemainingCallbacks) {
            manageCallbacks(this.state);
        }
        return this;
    }

    catch(onRejection) {
        return this.then(null, onRejection);
    }

    manageCallbacks(state) {
        //console.log('manageCallbacks');
        this.state = state;
        if (this.state) {
            this.fulfilled = true;
        } else {
            this.rejected = false;
        }
        var callback = this.callbacks.shift();
        var hasPromises = false;
        while (callback) {
            if (callback.result == this.state) {
                try {
                    this.parentPromise.value = callback.callback(this.parentPromise.value);
                    this.state = true;
                } catch(e) {
                    this.parentPromise.value = e;
                    this.state = false;
                }
                if (this.parentPromise.value instanceof SuperPromise) {
                    hasPromises = true;
                    result.parentPromise = this.parentPromise;
                    this.parentPromise.lastPromise = this.parentPromise.value;
                    callback = this.callbacks.shift();
                    while (callback) {
                        if (callback.result) {
                            result.then(callback.callback);
                        } else {
                            result.catch(callback.callback);
                        }
                    }
                }
            }
            callback = this.callbacks.shift();
        }
        if (!hasPromises) {
            this.hasRemainingCallbacks = this.parentPromise.hasRemainingCallbacks = false;
        }
    }

    /* PART 2 */
    static resolve() {
        // Your code here...
    }

    static reject() {
        // Your code here...
    }

    static all() {
        // Your code here...
    }

    static race() {
        // Your code here...
    }

    /* PART 3 */
    static queue() {

    }

    static stack() {

    }
}

module.exports = SuperPromise; // TODO: kek
