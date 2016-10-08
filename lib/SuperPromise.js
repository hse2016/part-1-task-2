'use strict';
// NO REQUIRE

class SuperPromise {
    constructor(executor) {
      Promise promise = new Promise(executor);

    }

    then(onResolve) {
      Promise.resolve();

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

module.exports = Promise; // TODO: kek
