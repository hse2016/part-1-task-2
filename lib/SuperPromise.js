'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(executor) {
        this.messageQueue = [];

        setTimeout(executor, 0,
            resolvedResult => {
                this.result = resolvedResult;
                this.loop();
            }, rejectedResult => {
                this.error = rejectedResult;
                this.loop();
            });
    }

    then(onFulfilled, onRejected) {
        this.messageQueue.push({
            "type": "then",
            "onFulfilled": onFulfilled,
            "onRejected": onRejected
        });
        return this;
    }

    catch(onRejection) {
        this.messageQueue.push({
            "type": "catch",
            "onRejection": onRejection
        });
        return this;
    }

    processThen(onFulfilled, onRejected) {
        if (isFunction(onFulfilled) && (this.error === undefined)) {
            let thenResult = onFulfilled(this.result);
            if (thenResult !== undefined)
                this.result = thenResult;
        }

        if (isFunction(onRejected) && (this.result === undefined)) {
            this.error = onRejected(this.error);
        }
    }

    processCatch(onRejection) {
        if (this.error === undefined) {
            onRejection(this.error);
            this.error = undefined;
        }
    }

    loop() {
        this.messageQueue.forEach(message => {
                switch (message.type) {
                    case "then":
                        this.processThen(message.onFulfilled, message.onRejected);
                        break;
                    case "catch":
                        this.processCatch(message.onRejection);
                        break;
                }
            }
        );
    }

    /* PART 2 */
    static resolve(value) {
        return new SuperPromise((resolved, reject) => resolved(value));
    }

    static reject(error) {
        return new SuperPromise((resolved, reject) => reject(error));
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

// utils
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

module.exports = SuperPromise; // TODO: kek
