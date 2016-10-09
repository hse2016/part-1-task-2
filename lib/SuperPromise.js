'use strict';
// NO REQUIRE

// States
var STATE_PENDING = 0;
var STATE_REJECTED = -1;
var STATE_RESOLVED = 1;

// Returns true if function
var isFunction = function(arg) {
  return typeof arg == 'function';
};

var isPending = function(promise) {
  return promise._state == STATE_PENDING;
};

var isRejected = function(promise) {
  return promise._state == STATE_REJECTED;
};

var isResolved = function(promise) {
  return promise._state == STATE_RESOLVED;
};

var isThenable = function(obj) {
  return (obj !== null) && (typeof obj === 'object' || typeof obj === 'function') && ('then' in obj);
};

var resolveMaker = function(promise) {
  return function(value) {
    if (! isPending(promise)) {
      return;
    }

    promise._state = STATE_RESOLVED;
    promise._value = value;
    deliverResolve(promise);
  };
};

var rejectMaker = function(promise) {
  return function(reason) {
    if (! isPending(promise)) {
      return;
    }

    promise._state = STATE_REJECTED;
    promise._value = reason;
    deliverReject(promise);
  };
};

var prp = function(promise, x) {
  // console.log('prp');
  if (promise === x) {
    promise._reject(new TypeError('Mooduck prp'));
  }

  if (isThenable(x)) {
    try {
      var then = x.then;
      var flag = false;
      try {
        if (isFunction(then)) {
          then.apply(x, [
            function(y) {
              if (!flag) {
                flag = true;
                prp(promise, y);
              }
            },
            function(r) {
              if (!flag) {
                flag = true;
                promise._reject(r);
              }
            }
          ]);
        } else {
          promise._resolve(x);
        }
      } catch (e) {
        if (! flag) {
          flag = true;
          promise._reject(e);
        }
      }
    }
    catch(e) {
      promise._reject(e);
    }
  } else {
    promise._resolve(x);
  }
};

var deliverReject = function(promise) {
  // console.log('deliver reject');
  if (isRejected(promise)) {
    setTimeout(function(){
      while (promise._ind < promise._onRejectionArray.length) {
        var onRejection = promise._onRejectionArray[promise._ind];
        var nextPromise = promise._nextPromiseArray[promise._ind];
        try {
          if (isFunction(onRejection)) {
            var x = onRejection(promise._value);
            prp(nextPromise, x);
          } else {
            nextPromise._reject(promise._value);
          }
        } catch (e) {
          nextPromise._reject(e);
        }
        promise._ind += 1;

      }
    });
  }
};

var deliverResolve = function(promise) {
  // console.log('deliver resolve');
  if (isResolved(promise)) {
    setTimeout(function() {
      while (promise._ind < promise._onResolveArray.length) {
        var onResolve = promise._onResolveArray[promise._ind];
        var nextPromise = promise._nextPromiseArray[promise._ind];

        try {
          if (isFunction(onResolve)) {
            var x = onResolve(promise._value);
            prp(nextPromise, x);
          } else {
            nextPromise._resolve(promise._value);
          }
        } catch (e) {
          nextPromise._reject(e);
        }
        promise._ind += 1;
      }
    });
  }
};

var bindPromises = function(promise, newPromise) {
  promise._nextPromiseArray.push(newPromise);

  if (isResolved(promise)) {
    deliverResolve(promise);
  } else if (isRejected(promise)) {
    deliverReject(promise);
  }
};

class SuperPromise {
  constructor(executor) {
    if (! isFunction(executor)) {
      throw TypeError('Mooduck constructor');
    }

    this._reject = rejectMaker(this);
    this._resolve = resolveMaker(this);
    this._state = STATE_PENDING;
    this._onResolveArray = [];
    this._onRejectionArray = [];
    this._nextPromiseArray = [];
    this._ind = 0;
    var that = this;

    // setTimeout(function(){
    //   executor(that._resolve, that._reject);
    // });
    executor(this._resolve, this._reject);
  }

  then(onResolve, onRejection) {
    if (isFunction(onResolve)) {
      this._onResolveArray.push(onResolve);
    } else {
      this._onResolveArray.push(null);
    }

    if (isFunction(onRejection)) {
      this._onRejectionArray.push(onRejection);
    } else {
      this._onRejectionArray.push(null);
    }

    var newPromise = new SuperPromise(function(){});
    this._nextPromiseArray.push(newPromise);

    if (isResolved(this)) {
      deliverResolve(this);
    } else if (isRejected(this)) {
      deliverReject(this);
    }
    return newPromise;
  }

  catch(onRejection) {
    return this.then(null, onRejection);
  }

  /* PART 2 */
  static resolve(value) {
    var promise = new SuperPromise(function(){});
    promise._state = STATE_RESOLVED;
    promise._value = value;
    return promise;
  }

  static reject(reason) {
    var promise = new SuperPromise(function(){});
    promise._state = STATE_REJECTED;
    promise._value = reason;
    return promise;
  }

  // doesn't work properly
  static all(iterable) {
    if (iterable.length === 0) {
      return SuperPromise.resolve();
    }

    var count = 0;
    var length = iterable.length;
    var values = {};
    var promise = new SuperPromise(
      function() {
        for (var i = 0; i < iterable.length; ++i) {
          iterable[i].then(
            function(v) {
              values[i] = v;

              if (count === length - 1) {
                console.log(values);
                promise._resolve(values);
              } else {
                count += 1;
              }
            },
            function(e) {
              promise._reject(e);
            }
          );
        }
      }
    );

    return promise;
  }

  static race(iterable) {
    // var promise = new SuperPromise(
    //   function(resolve, reject){
    //     var length = iterable.length;
    //     for (var i = 0; i < iterable.length; ++i) {
    //       iterable.then(
    //         function(value) {
    //           resolve(value);
    //         },
    //         function(reason) {
    //           reject(reason);
    //         }
    //       );
    //     }
    //   }
    // );
    // return promise;
  }

  /* PART 3 */
  static queue(iterable) {
    // var promise = new SuperPromise(function(){});
    // for (var i = 0; i < iterable.length; ++i) {
    //   promise.then(
    //     function(value) {
    //       return iterable[i];
    //     },
    //     function(reason) {
    //       throw reason;
    //     }
    //   );
    // }
    // return promise;
  }

  static stack(iterable) {
    // return SuperPromise(iterable.reverse());
  }
}

module.exports = SuperPromise; // TODO: kek
