'use strict';
// NO REQUIRE

class SuperPromise {

//god bless the http://exploringjs.com/
    constructor(executor) {
        this.fulfillReactions = [];
        this.rejectReactions = [];
        this.promiseResult = null;
        this.promiseState = 'pending';

		//zapusk execa
        if (executor && executor instanceof Function) {
            executor(this.resolve.bind(this), this.reject.bind(this));
        }
    }

   then(onResolve, onRejected) {
	    const newPromise = new SuperPromise();
	    const self = this;
	    const fulfilledTask = this.funcGen(self, newPromise, onResolve, 'onResolve');
	    const rejectedTask = this.funcGen(self, newPromise, onRejected, 'onReject');
		switch (this.promiseState) {
			case 'pending':
			    this.fulfillReactions.push(fulfilledTask);
			    this.rejectReactions.push(rejectedTask);
			    break;
			case 'fulfilled':
			    setTimeout(fulfilledTask);
			    break;
	    	case 'rejected':
			    setTimeout(rejectedTask);
			    break;
		}
	    return newPromise;
	}


	//100% sveril s Andreem
    catch(onRejection) {
        return this.then(null, onRejection);
    }

    resolve(value) {
        if (this.promiseState != 'pending') return;
		this.promiseResult = value;
		this.promiseState = 'fulfilled';
		this.clearReactions(this.fulfillReactions);
        return this;
    }


    reject(error) {
        if (this.promiseState != 'pending') return;
		this.promiseResult = error;
		this.promiseState = 'rejected';
		this.clearReactions(this.rejectReactions);
        return this;
    }

    clearReactions(reactions) {        
        this.fulfillReactions = undefined;
        this.rejectReactions = undefined;
		reactions.map(asyncRun);
    }

    funcGen(self, newPromise, func, type) {
        let res;
        if (func instanceof Function) {
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
        return new SuperPromise((resolve, reject) => resolve(x));
    }

    static reject(x) {
        return new SuperPromise((resolve, reject) => reject(x));
    }

    static all(data) {
        
    }

    static race() {
        
    }

    /* PART 3 */
    static queue(data) {
		
    }

    static stack(data) {

    }
}

function asyncRun(task) {
    setTimeout(task, 0);
}


module.exports = SuperPromise; 
