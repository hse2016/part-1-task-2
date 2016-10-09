'use strict';
// NO REQUIRE

class SuperPromise {
    constructor(executor) {
      var p;

    if (this._isdone) {
        p = executor.apply(context, this.result);
    } else {

        p = new Promise();

        this._callbacks.push(function () {
            var res = executor.apply(context, arguments);

            if (res && typeof res.then === 'function')
                res.then(p.done, p);
        });
    }

    return p;

    }

    then(onResolve) {
    this.result = arguments;

    this._isdone = true;

    for (var i = 0; i < this._callbacks.length; i++) {
        this._callbacks[i].apply(null, arguments);
    }
    this._callbacks = [];

    }

    catch(onRejection) {
        return this.then(null, onRejection);
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

module.exports = Promise; // TODO: kek
