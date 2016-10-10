'use strict';
let request = require('request');
let SuperPromise = require('lib/SuperPromise');

module.exports = {
    vkProfile: (id) => {
        return new SuperPromise((resolve, reject) => {
            request.get(`https://api.vk.com/method/users.get?user_ids=${id}&fields=bdate&v=5.53`, (err, response) => {
                if (err) {
                    return reject(err);
                }

                let body = JSON.parse(response.body);
                if (body.error) {
                    reject(body.error);
                } else {
                    resolve(body.response);
                }
            });
        });
    }
};
