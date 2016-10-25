'use strict';
// NO REQUIRE

var DEBUG = false;

function callAsync(func, context, ...args) {
  setTimeout(() => func.call(context, ...args), 1);
}

var idCounter = 0;
class SuperPromise {
  constructor(executor) {
    this.promiseId = idCounter++;
    if (DEBUG) console.log('promise', this.promiseId);
    this.state = 0; // 0 - wait, 1 - finished, 2 - rejected
    this.promises = [];
    this.result = undefined;
    if (executor) {
      executor(this.resolve.bind(this), this.reject.bind(this));
    }
  }

  dummy() {}

  solve() {
    if (DEBUG) console.log('solve', this.state);
    if (this.state !== 0) {
      this.promises = this.promises.reverse();
      while (this.promises[0]) {
        // if (DEBUG) console.log(this.promises[0], this.promises.pop(0));
        if (DEBUG) console.log('st', this.state, this.promises.length);
        if (this.state === 1) {
          callAsync(this.promises.pop().def);
        } else if (this.state === 2) {
          callAsync(this.promises.pop().err);
        }
      }
    }
    this.promises = undefined;
  }

  then(onFulfilled, onRejection) {
    if (DEBUG) console.log('then', this.state);
    let nextPromise = new this.constructor();
    let promise = {
      def: (() => {
        if (DEBUG) console.log('on solve');
        try {
          if (typeof onFulfilled === 'function')
            nextPromise.resolve(onFulfilled(this.result));
          else {
            nextPromise.resolve(this.result);
          }
        } catch (e) {
          if (typeof onRejection === 'function')
            nextPromise.reject(onRejection(e));
          else {
            nextPromise.reject(e);
            if (DEBUG) console.log('err', nextPromise.promiseId);
          }
        }
      }),
      err: (() => {
        if (typeof onRejection === 'function')
          nextPromise.reject(onRejection(this.result));
        else {
          nextPromise.reject(this.result);
        }
      })
    };
    if (this.state === 0) {
      this.promises.push(promise);
    } else if (this.state === 1) {
      callAsync(promise.def);
    } else if (this.state === 2) {
      callAsync(promise.err);
    }
    return nextPromise;
  }

  catch(onRejection) {
    return this.then(undefined, onRejection);
  }

  /* PART 2 */
  resolve(val) {
    if (this.state !== 0)
      return;
    this.state = 1;
    this.result = val;
    this.solve();
    return this;
  }

  static resolve(val) {
    return new Promise(function (resolve) {
      resolve(val);
    });
  }

  reject(val) {
    if (DEBUG) console.log('on reject', this.state);
    if (this.state !== 0)
      return;
    this.state = 2;
    this.result = val;
    this.solve();
    return this;
  }

  static reject(val) {
    return new Promise(function (resolve, reject) {
      reject(val);
    });
  }

  static all(data) {
    let promise = new Promise(function () {});
    let size = data.length;
    if (size === 0) {
      return promise.resolve(); // NEED?
    }
    for (let i = 0; i < size; ++i) {
      promise.then(data[i]);
    }
    return promise;
  }

  static race() {
    // Your code here...
    if (DEBUG) console.log('!!!!!!!!!!!!!!');
  }

  /* PART 3 */
  static queue() {

  }

  static stack() {

  }
}

// var x = new SuperPromise(), a, b, c;
// a = x.then(undefined, () => if (DEBUG) console.log(1));
// b = x.then(undefined, () => if (DEBUG) console.log(2));
// c = x.then(undefined, () => if (DEBUG) console.log(3));
// module.exports = Promise; // TODO: kek
module.exports = SuperPromise; // TODO: kek
