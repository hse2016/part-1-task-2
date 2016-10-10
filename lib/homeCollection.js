'use strict';
let fs = require('fs');
let path = require('path');
let SuperPromise = require('lib/SuperPromise');

const TWI_COLLECTION_FILE_PATH = path.join(__dirname, '..', 'home-collection.log');

module.exports = {
    save: function (data) {
        return new SuperPromise((resolve, reject) => {
            fs.appendFile(TWI_COLLECTION_FILE_PATH, JSON.stringify(data, null, 4) + `\n`, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
};
