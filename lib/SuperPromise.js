'use strict';
// NO REQUIRE

function callAsync(func, context, ...args) {
  setTimeout(() => func.call(context, ...args), 0);
}

class SuperPromise {
  constructor(executor) {
    this.state = 0; // 0 - wait, 1 - finished, 2 - rejected
    this.promises = [];
    this.result = undefined;
    if (executor) {
      executor(this.resolve.bind(this), this.reject.bind(this));
    }
  }

  dummy() {}

  solve() {
    // if (this.state === 1) {
    //   for (let i = 0; i < this.promises.length; ++i)
    //     callAsync(this.promises[i].def);
    // } else if (this.state === 2) {
    //   for (let i = 0; i < this.promises.length; ++i)
    //     callAsync(this.promises[i].err);
    // }
    if (this.state !== 0) {
      while(this.promises[0]) {
        if (this.state === 1) {
          callAsync(this.promises.pop(0).def);
        } else if (this.state === 2) {
          callAsync(this.promises.pop(0).err);
        }
      }
    }
  }

  then(onFulfilled, onRejection) {
    let nextPromise = new this.constructor();
    let promise = {
      def: (() => {
        try {
          if (typeof onFulfilled === 'function')
            nextPromise.resolve(onFulfilled(this.result));
        } catch (e) {
          if (typeof onRejection === 'function')
            nextPromise.reject(onRejection(e));
        }
      }),
      err: (() => {
        if (typeof onRejection === 'function')
          nextPromise.reject(onRejection(this.result));
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
    let p =  new Promise(function (resolve) {
      resolve(val);
    });
    return p;
  }

  reject(val) {
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
    for (let i = 0, size = data.length; i < size; ++i) {
      promise.then(data[i]);
    }
    return promise;
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

// module.exports = Promise; // TODO: kek
module.exports = SuperPromise; // TODO: kek
