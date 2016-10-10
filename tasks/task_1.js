'use strict';
let emailer = require('lib/emailer');
let SuperPromise = require('lib/SuperPromise');
let vkApi = require('lib/vkApi');

vkApi.vkProfile('eandreyf')
    .then(vk => emailer.sendEmail('granny666@gmail.com', vk.bdate))
    .catch(err => { console.error(err); });
