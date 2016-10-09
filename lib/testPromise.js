let PromiseClass = require('./SuperPromise');

function testPromise(PromiseClass) {
    // Создаем адаптер для запуска базовых тестов
    let adapter = {
        resolved: (value) => PromiseClass.resolve(value),
        rejected: (value) => PromiseClass.reject(value),
        complete: PromiseClass.complete,
        race: (values) => PromiseClass.race(values),
        all: (values) => PromiseClass.all(values),
        queue: (values) => PromiseClass.queue(values),
        stack: (values) => PromiseClass.stack(values),
        deferred: () => {
            let deferred = {};

            deferred.promise = new PromiseClass((resolve, reject, complete) => {
                deferred.resolve = resolve;
                deferred.reject = reject;
                deferred.complete = complete;
            });

            return deferred;
        }
    };

    return adapter;
}

module.exports = testPromise(PromiseClass);
