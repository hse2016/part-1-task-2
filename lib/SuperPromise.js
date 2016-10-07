'use strict';
// NO REQUIRE

class SuperPromise {

    // possible statuses: pending, resolved, rejected

    constructor(executor) {
        this.status = 'pending';
        this.value = '';
        this.responder = this.responder.bind(this);
        this.rejecter = this.rejecter.bind(this);
        console.log('constructor', executor);
        if (executor)
        {
            // console.log()
            setTimeout(()=> {
                console.log('constructor setTimeout');
                executor(this.responder, this.rejecter);
            }, 1);
        }
        return this;
    }

    responder(value) {
        // console.log('responder', value);
        this.status = 'resolved';
        this.value = value;
    }

    rejecter(value) {
        // console.log('refecter', value);
        this.status = 'rejected';
        this.value = value;
    }

    then(onResolve) {
        // console.log('then',  this.status, this.value, onResolve);
        if (this.status === 'resolved'){
            onResolve(this.value)
        }
        return this;
    }

    catch(onRejection) {
        if (this.status === 'rejected'){
            onRejection(this.value);
        }
        return this;
    }

    /* PART 2 */
    static resolve() {
        return new SuperPromise()
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

// new SuperPromise(()=>{for (var i=0; i< 1000000000000; i++);});

module.exports = SuperPromise; // TODO: kek
