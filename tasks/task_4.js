let homeCollection = require('lib/homeCollection');
let SuperPromise = require('lib/SuperPromise');
let vkApi = require('lib/vkApi');

// vkApi.vkProfile('eandreyf')
//     .then((user) => {
//         user = user[0];
//
//         if (user.bdate) {
//             return SuperPromise.complete;
//         }
//
//         return user;
//     })
//     .then((user) => homeCollection.save(user))
//     .then(() => console.log('bbb'))
//     .catch(err => console.error(err));

// Или

new SuperPromise((resolve, reject, complete) => {
    vkApi.vkProfile('123123129')
        .then((user) => {
            user = user[0];

            if (!user.bdate) {
                complete(); // у пользователя нет ДР, поэтому не сохранит
            }

            resolve(user);
        })
        .catch((err) => reject(err));
})
    .then((user) => homeCollection.save(user))
    .then(() => console.log('aaaa'))
    .catch(err => console.error(err));
