'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(executor) {
        executor(resolvedResult => {
            this.result = resolvedResult;
        }, rejectedResult => {
            this.error = rejectedResult;
        });
    }

    then(onResolve) {
        if (this.error === undefined) {
            this.result = onResolve(this.result);
            return this;
        }
    }

    catch(onRejection) {
        if (this.error !== undefined) {
            onRejection(this.error);
            this.error = undefined;
            return this;
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
