'use strict';
var SuperPromise = require('lib/SuperPromise');

module.exports = {
    sendEmail: (recipient, text) => {
        return new SuperPromise((resolve, reject) => {
            setTimeout(() => {
                console.info(`Отправили письмо ${recipient}! (на самом деле нет)`);

                resolve();
            }, 10);
        });
    }
};
