'use strict';
let homeCollection = require('lib/homeCollection');
let SuperPromise = require('lib/SuperPromise');
let vkApi = require('lib/vkApi');

let me = {
    'id': 'eandreyf', 
    'first_name': 'Andrey',
    'last_name': 'Evstropov',
    'bdate': '7.6'
};

let friendIds = [26998925, 26998926, 26998927, 26998928];
let promises = friendIds.map((id) => vkApi.vkProfile(id));

// Свое ДР мы знаем, поэтому сразу пушим как резолвленый промис
promises.push(SuperPromise.resolve(me));

SuperPromise.all(promises)
    .then((users) => homeCollection.save(users))
    .then(() => console.log('saved'))
    .catch(err => console.error(err));
