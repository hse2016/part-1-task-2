'use strict';
// NO REQUIRE

class SuperPromise {

    // possible statuses: pending, resolved, rejected

    constructor(executor) {
        this.status = 'pending';
        this.value = [];
        this.nextPromis = '';
        this.responder = this.responder.bind(this);
        this.rejecter = this.rejecter.bind(this);
        this.then = this.then.bind(this);
        this.catch = this.catch.bind(this);
        setTimeout(()=> {
                // console.log('constructor setTimeout');
                executor(this.responder, this.rejecter);
            }, 1);
        
        return this;
    }

    responder(value) {
        // console.log('responder', value);
        this.status = 'resolved';
        this.value.push(value);
    }

    rejecter(value) {
        // console.log('refecter', value);
        this.status = 'rejected';
        this.value.push(value);
    }

    then(onResolve) {
        setTimeout(
            () => {
                // console.log('then',  this.status, this.value, onResolve);
                if (this.status === 'pending'){
                    this.then(onResolve);
                    return;
                }
                else {
                    if (this.nextPromis){
                        this.nextPromis.then(onResolve);
                    }
                    if (this.status === 'resolved'){
                        // console.log('resolving!!!!');
                        onResolve(this.value)
                    }
                    return;
                }
            },
        10);
        return this;
    }

    catch(onRejection) {
        setTimeout(
            () => {
                // console.log('then',  this.status, this.value, onResolve);
                if (this.status === 'pending'){
                    this.then(onRejection);
                    return;
                }
                else {
                    if (this.nextPromis){
                        this.nextPromis.then(onRejection);
                    }
                    if (this.status === 'rejected'){
                        // console.log('resolving!!!!');
                        onRejection(this.value)
                    }
                    return;
                }
            },
            10);
        return this;
    }

    /* PART 2 */
    static resolve(value) {
        return new SuperPromise((resolve, reject) => {resolve(value);});
    }

    static reject() {
        return new SuperPromise((resolve, reject) => {reject(value);});
    }

    static all(promises) {
        for (let i = 0; i < promises.length-1; i++){
            promises[i].nextPromis = promises[i+1];
        }
        return promises[0];
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

// new SuperPromise(()=>{for (var i=0; i< 1000000000000; i++);});

module.exports = SuperPromise; // TODO: kek

// static resolve(value) {
//     return new SuperPromise((resolve, reject)=>{resolve(value)})
// }
//
// //get value return promise
// static reject(value) {
//     return new SuperPromise((resolve, reject)=>{reject(value)})
// }
