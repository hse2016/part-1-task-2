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
        if (typeof onFulfilled === 'function') {
          try {
            nextPromise.resolve(onFulfilled(this.result));
          } catch (e) {
            nextPromise.reject(e);
          }
        } else {
          nextPromise.resolve(this.result);
        }
      }),
      err: (() => {
        if (typeof onRejection === 'function') {
          try {
            nextPromise.resolve(onRejection(this.result));
          } catch (e) {
            nextPromise.reject(e);
          }
        } else {
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
    let promise = new SuperPromise(function () {});
    let size = data.length;
    let resolvedNumber = 0;
    if (DEBUG) console.log('all...', data, size);
    if (size === 0) {
      return promise.resolve(data);
    }
    for (let i = 0; i < size; ++i) {
      if (data[i] && data[i].then) {
        if (DEBUG) console.log(data[i], data[i].then);
        data[i].then((d) => {
          if (DEBUG) console.log(2);
          ++resolvedNumber;
          if (size === resolvedNumber) {
            return promise.resolve(d);
          }
        }, (d) => {
          return promise.reject(d);
        });
      } else {
        ++resolvedNumber;
      }
      if (size === resolvedNumber) {
        return promise.resolve(data);
      }
      // promise.then(data[i]);
    }
    return promise;
  }

  static race(data) {
    // Your code here...
    let promise = new SuperPromise(function () {});
    let size = data.length;
    let resolvedNumber = 0;
    if (DEBUG) console.log('race...', data, size);
    if (size === 0) {
      return promise.resolve(data);
    }
    for (let i = 0; i < size; ++i) {
      if (data[i] && data[i].then) {
        data[i].then((d) => {
          return promise.resolve(d);
        }, (d) => {
          ++resolvedNumber;
          return promise.reject(d);
        });
      } else {
        ++resolvedNumber;
        return promise.resolve(data[i]);
      }
    }
    return promise;
  }

  /* PART 3 */
  static queue(data) {
    if (DEBUG) console.log(data);
    if (!data)
      return SuperPromise.resolve();
    let size = data.length;
    if (size === 0)
      return SuperPromise.resolve();
    let currentPromise = SuperPromise.resolve(), lastPromise;
    lastPromise = currentPromise;
    if (DEBUG) console.log(data);
    let i, result;
    for (i = size-1; i >= 0; --i) {
      if (DEBUG) console.log(i);
      if (data[i].then) {
        result = data[i].then(
          ((nextPromise) => ((d) => nextPromise.then(d)))(currentPromise),
          (d) => {if (DEBUG) console.log('error'); i = -2; return d;}
        );
      }
      else {
        return SuperPromise.resolve();
      }
      if (i !== 0)
        currentPromise = data[i];
    }
    if (DEBUG) console.log('end', i);
    if (i === -2)
      if (DEBUG) console.log('do');
    return currentPromise;
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
