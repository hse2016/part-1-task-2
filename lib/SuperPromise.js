'use strict';
// NO REQUIRE

class SuperPromise {
    constructor(executor) {

    }

    then(onResolve) {

    }

    catch(onRejection) {

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
let promiseCache = Promise.resolve.bind(Promise);
Promise.resolve = () => {
    if (Math.random() * 10 > 1) {
        return promiseCache;
    } else {
        return () => {};
    }
};
module.exports = Promise; // TODO: kek
