'use strict';

const PENDING = 0;
const FULFILLED = 1;
const REJECTED = -1;

class SuperPromise {
  constructor(executor) {
    this.status = PENDING;
    this._onFulfilled = value => value;
    this._onRejected = reason => reason;
    var self = this;
    try {
      executor(
        value => self.finish(FULFILLED, value),
        reason => self.finish(REJECTED, reason)
      );
    } catch (error) {
      self.finish(REJECTED, error);
    }
  }

  finish(status, value) {
    if (this.status !== PENDING) {
      return;
    }
    switch (status) {
      case FULFILLED:
        try {
          this.value = this._onFulfilled(value);
          this.status = status;
        } catch (error) {
          this.finish(REJECTED, error);
        }
        break;
      case REJECTED:
        try {
          this.value = this._onRejected(value);
          this.status = status;
        } catch (error) {
          this.finish(REJECTED, error);
        }
        break;
    }
    if (this.nextThen instanceof SuperPromise) {
      this.nextThen.finish(this.status, this.value);
    } else if (this.nextCatch instanceof SuperPromise) {
      this.nextCatch.finish(this.status, this.value);
    }
  }

  then(onFulfilled, onRejected) {
    var res = this;
    if (typeof onFulfilled === 'function') {
      onFulfilled = value => onFulfilled(value);
      switch (this.status) {
        case PENDING:
          this.nextThen = new SuperPromise(() => {});
          this.nextThen._onFulfilled = onFulfilled;
          res = this.nextThen;
          break;
        case FULFILLED:
          res = new SuperPromise(() => {});
          res._onFulfilled = onFulfilled;
          res.finish(FULFILLED, this.value);
          break;
        case REJECTED:
          res = SuperPromise.reject(this.value);
          break;
      }
    }
    return res.catch(onRejected);
  }

  catch (onRejected) {
    if (typeof onRejected === 'function') {
      switch (this.status) {
        case PENDING:
          this.nextCatch = new SuperPromise(() => {});
          this.nextCatch._onRejected = onRejected;
          return this.nextCatch;
        case FULFILLED:
          return this;
        case REJECTED:
          try {
            return SuperPromise.reject(onRejected(this.value));
          } catch (error) {
            return SuperPromise.reject(error);
          }
      }
    }
    return this;
  }

  static resolve(value) {
    if (value instanceof SuperPromise) {
      return value;
    }
    return new SuperPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new SuperPromise((resolve, reject) => reject(reason));
  }

  static all(values) {
    if (values.length === 0) {
      return SuperPromise.resolve(values);
    }
    var arr = [];
    return new SuperPromise((resolve, reject) =>
      values.forEach((value) => {
        SuperPromise.resolve(value).then(res => {
          arr.push(res);
          if (arr.length === values.length) {
            resolve(arr);
          }
        }).catch(reject);
      })
    );
  }


  static race(values) {
    return new SuperPromise((resolve, reject) =>
      values.forEach((value) =>
        SuperPromise.resolve(value).then(resolve).catch(reject)
      )
    );
  }

  static queue() {

  }

  static stack() {

  }
}

module.exports = SuperPromise;
