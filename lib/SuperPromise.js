'use strict';
// NO REQUIRE

let State = {
    PENDING: 0,
    RESOLVED: 1,
    REJECTED: 2
};

var count = 0;

class SuperPromise {

    constructor(executor) {

        count += 1;
        //console.log(count);

        this.executor = executor;
        this.result = undefined;
        this.error = undefined;
        this.state = State.PENDING;
        this.resolvers = [];
        this.rejecters = [];


        executor((data) => {
            this.resolveWithResult(data);
        }, (error) => {
            this.rejectWithReason(error);
        });
    }

    resolveWithResult(result) {
        if (this.state == State.PENDING) {
            this.result = result;
            this.state = State.RESOLVED;

            setTimeout(() => {
                for (var i = 0; i < this.resolvers.length; i++) {
                    this.resolvers[i](result);
                }
            }, 0);
        }
    }

    rejectWithReason(reason) {
        if (this.state == State.PENDING) {
            this.error = reason;
            this.state = State.REJECTED;

            setTimeout(() => {
                this.rejecters.forEach(rejecter => rejecter(reason));
            }, 0)
        }
    }

    then(onResolved, onRejected) {
        if (onResolved == false || onResolved == undefined) {
            onResolved = (arg) => {
            };
        }

        if (!onRejected) {
            onRejected = (arg) => {
            };
        }

        if (this.state == State.PENDING) {
            this.resolvers.push(onResolved);
            this.rejecters.push(onRejected);
        }
        else {
            if (this.state == State.REJECTED) {

                try {
                    setTimeout(() => {
                        onRejected(this.error);
                    }, 0);
                    return SuperPromise.reject(this.error);
                }
                catch (e) {
                    setTimeout(() => {
                        onRejected(e);
                    }, 0);
                    return SuperPromise.reject(e);
                }
            }
            else { // if state == RESOLVED
                try {
                    setTimeout(() => {
                        onResolved(this.result);
                    }, 0);
                    return SuperPromise.resolve(this.result);
                }
                catch (e) {
                    setTimeout(() => {
                        onRejected(e);
                    }, 0);
                    return SuperPromise.reject(e);
                }
            }
        }

        return new SuperPromise((arg1, arg2) => {
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    static resolve(result) {
        return new SuperPromise((resolve, _) => {
            try {
                resolve(result);
            }
            catch (e) {
                this.reject(e);
            }
        });

    }

    static reject(reason) {
        return new SuperPromise((_, reject) => {
            try {
                reject(reason);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    static all(promises) {
        return new SuperPromise((resolve, reject) => {
            var totalResult = [];

            for (let promise of promises) {
                promise.then(result => {
                    totalResult.push(result);
                    if (totalResult.length == promises.length) {
                        resolve(totalResult);
                    }
                }).catch(error => {
                    reject(error);
                })
            }
        })
    }

    static race(promises) {
        return new SuperPromise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(result => {
                    resolve(result);
                })
            }
        })
    }

    /* PART 3 */
    static queue(promises) {
        return new SuperPromise((resolve, reject) => {

            });
    }

    static stack() {

    }
}

module.exports = SuperPromise; // TODO: kek
