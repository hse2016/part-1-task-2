'use strict';
// NO REQUIRE

class SuperPromise {
  constructor(executor) {
    this.state = 0;
    this.work = 0; // pending
    this.chain = [];
    try {
      let result = executor(this.resolve.bind(this), this.reject.bind(this));
      this.state = 1;
    } catch(e) {
      this.state = 2;
    }
    this._check_chain();
  }

  dummy() {}

  _check_chain() {
    if (this.work === 0 && this.chain.length !== 0) {
      this.work = 1;
      let promise = this.chain.pop(0);
      setTimeout(() => {
        if (this.state === 1) {
          try {
            promise.def();
          } catch(e) {
            this.state = 2;
          }
        }
        if (this.state === 2) {
          promise.err();
        }
        this.work = 0;
        this._check_chain();
      }, 0);
    }
  }

  then(onResolve, onRejection) {
    this.chain.push({
      def: onResolve,
      err: onRejection ? onRejection : this.dummy,
    });
    this._check_chain();
    return this;
  }

  catch(onRejection) {
    return this.then(undefined, onRejection);
  }

  /* PART 2 */
  static resolve(val) {
    return new Promise(function (resolve) {
      resolve(val);
    });
  }

  static reject(val) {
    return new Promise(function (resolve) {
      resolve(val);
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
