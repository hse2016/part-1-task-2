'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(executor) {


        this.resolveCallbacks = [];
        this.rejectCallbacks = [];

        executor(()=>this.resolvefunc.apply(this, arguments), () => this.rejectfunc.apply(this, arguments));

    }

    resolvefunc() {
        this.resolveCallbacks.forEach(function (callback) {
            callback.apply(this, arguments);
        });
    }

    rejectfunc() {
        this.rejectCallbacks.forEach(function (callback) {
            callback.apply(this, arguments);
        });
    }

    then(onResolve) {
        this.resolveCallbacks.push(onResolve);
        return this;

    }

    catch(onRejection) {
        this.rejectCallbacks.push(onRejection);
        return this;
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
