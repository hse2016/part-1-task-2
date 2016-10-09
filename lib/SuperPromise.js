'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(executor) {
        this.fulfillReactions = [];
        this.rejectReactions = [];
        this.promiseResult = undefined;
        this.promiseState = 'pending';

        if (executor && executor instanceof Function) {
            executor(this.resolve.bind(this), this.reject.bind(this), this.reject.bind(this));
        }
    }

    then(onResolve, onRejected) {
        let newPromise = new SuperPromise();
        let self = this;

        // Задачи на resolve
        var fulfilledTask = this.getDelayFunction(self, newPromise, onResolve, 'onResolve');
        // Задачи на reject
        var rejectedTask = this.getDelayFunction(self, newPromise, onRejected, 'onReject');

        if (self.promiseState == 'pending') {
            this.fulfillReactions.push(fulfilledTask);
            this.rejectReactions.push(rejectedTask);
        }

        if (self.promiseState == 'fulfilled')
            asyncRun(fulfilledTask);

        if (self.promiseState == 'rejected')
            asyncRun(rejectedTask);


        return newPromise;
    }

    catch(onRejection) {
        return this.then(null, onRejection);
    }

    resolve(value) {
        if (this.promiseState != 'pending') return;
        this.setState('fulfilled', value);
        return this;
    }


    reject(error) {
        if (this.promiseState != 'pending') return;
        this.setState('rejected', error);
        return this;
    }

    complete() {
        this.fulfillReactions = []
        this.rejectReactions = []
        this.PromiseState = 'fulfilled'
    }

    //----------------------------------

    setState(type, value) {
        this.promiseState = type;
        this.promiseResult = value;
        this.clearReactions(type == 'fulfilled' ? this.fulfillReactions : this.rejectReactions);
    }

    clearReactions(reactions) {
        reactions.map(asyncRun);
        this.fulfillReactions = undefined;
        this.rejectReactions = undefined;
    }

    // Генератор отложенной функции, для очереди или мгновенного исполнения
    getDelayFunction(self, newPromise, func, type) {
        var res;
        if (func instanceof Function) {
            //Создаем функцию для добавления в очередь
            res = () => {
                try {
                    newPromise.resolve(func(self.promiseResult));
                } catch (e) {
                    newPromise.reject(e);
                }
            };
        } else {
            res = () => {
                if (type == 'onResolve') {
                    newPromise.resolve(self.promiseResult);
                } else if (type == 'onReject') {
                    newPromise.reject(self.promiseResult);
                }
            };
        }

        return res;
    }


    /* PART 2 */
    static resolve(x) {
        // Your code here...
        return new SuperPromise((resolve) => resolve(x));
    }

    static reject(x) {
        // Your code here...
        return new SuperPromise((resolve, reject) => reject(x));
    }

    static all(data) {
        // Your code here...
        var a = new SuperPromise((resolve, reject) => {
            if (data.length == 0) {
                return resolve([]);
            }

            var remaining_count = data.length;

            function delay_result(i, val) {
                if (val) {
                    val.then.call(val, val => promise_res(i, val));
                    val.catch.call(val, val => promise_res(i, {error: val}));
                    return;
                }
            }

            function promise_res(i, val) {
                data[i] = val;

                if (data[i].error) {
                    reject(data[i].error);
                }

                if (--remaining_count == 0) {
                    resolve(data);
                }
            }

            for (var i = 0; i < data.length; i++) {
                delay_result(i, data[i]);
            }

        });

        return a;
    }

    static race(data) {
        // Your code here...
        var a = new SuperPromise((resolve, reject) => {
            if (data.length == 0) {
                return resolve([]);
            }

            var remaining_count = data.length;

            function delay_result(i, val) {
                if (val) {
                    val.then.call(val, val => promise_res(i, val));
                    val.catch.call(val, val => promise_res(i, {error: val}));
                    return;
                }
            }

            function promise_res(i, val) {
                if (!val.error) {
                    resolve(val);
                    return;
                }

                if (--remaining_count == 0) {
                    reject('All promises are rejected');
                }
            }

            for (var i = 0; i < data.length; i++) {
                delay_result(i, data[i]);
            }

        });

        return a;
    }

    /* PART 3 */
    static queue(data) {
        q(0, data);

        function q(i, data) {
            if(data.length  == i)
                return;
            data[i]().then(() => q(i + 1, data)).catch(err => console.log(err));
        }
    }

    static stack(data) {
        q(data.length - 1, data);

        function q(i, data) {
            if(i + 1== 0)
                return;
            data[i]().then(() => q(i - 1, data)).catch(err => console.log(err));
        }
    }
}

function asyncRun(task) {
    setTimeout(task, 0);
}


module.exports = SuperPromise; // TODO: kek