'use strict';
// NO REQUIRE

class SuperPromise {

    constructor(functor) {
        this.state = 0;
        this.result = undefined;
        this.fulfillmentCallbacks = [];
        this.rejectionCallbacks = [];

        if (functor instanceof Function) {
            functor(this.resolve.bind(this), this.reject.bind(this));
        }
    }

    resolve(value) {
        if (this.state === 0) {
            this.result = value;
    		this.state = 1;
    		this.handleCallbacks();
            return this;
        }
    }


    reject(error) {
        if (this.state === 0) {
            this.result = error;
    		this.state = 2;
    		this.handleCallbacks();
            return this;
        }
    }

   then(onResolve, onRejected) {
	    var promise = new SuperPromise();
	    var fulfillmentCallback = this.wrapCallback(promise, onResolve, 'onResolve');
	    var rejectionCallback = this.wrapCallback(promise, onRejected, 'onReject');
        if (this.state == 0) {
            this.fulfillmentCallbacks.push(fulfillmentCallback);
            this.rejectionCallbacks.push(rejectionCallback);
        } else if (this.state == 1) {
            setTimeout(fulfillmentCallback);
        } else if (this.state == 2) {
            setTimeout(rejectionCallback);
        }
	    return promise;
	}


    catch(onRejection) {
        return this.then(null, onRejection);
    }

    wrapCallback(promise, func, type) {
        if (func instanceof Function) {
            var callback = () => {
                try {
                    promise.resolve(func(this.result));
                } catch (e) {
                    promise.reject(e);
                }
            };
        } else {
            var callback = () => {
                if (type == 'onResolve') {
                    promise.resolve(this.result);
                } else if (type == 'onReject') {
                    promise.reject(this.result);
                }
            };
        }

        return callback;
    }

    handleCallbacks() {
		if (this.state == 1) {
            for (var i = 0; i < this.fulfillmentCallbacks.length; i++) {
                setTimeout(this.fulfillmentCallbacks[i], 0);
            }
        } else if (this.state == 2) {
            for (var i = 0; i < this.rejectionCallbacks.length; i++) {
                setTimeout(this.rejectionCallbacks[i], 0);
            }
        }
    }

    /* PART 2 */
    static resolve(result) {
        return new SuperPromise((resolve) => resolve(result));
    }

    static reject(reason) {
        return new SuperPromise((resolve, reject) => reject(reason));
    }

    static all() {
    }

    static race() {
    }

    /* PART 3 */
    static queue() {
    }

    static stack() {
    }
}


module.exports = SuperPromise;
