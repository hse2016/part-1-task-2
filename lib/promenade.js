'use strict';
let SuperPromise = require('lib/SuperPromise');

const ANIMALS = {
    BEARS: 'Ехали медведи\nНа велосипеде.',
    CAT: 'А за ними кот\nЗадом наперед.',
    MOSQUITOS: 'А за ним комарики\nНа воздушном шарике.',
    DOTA_2_PLAYERS: 'А за ними раки\nНа хромой собаке.',
    WOLVES: 'Волки на кобыле,',
    LIONS: 'Львы в автомобиле.',
    HARES: 'Зайчики в трамвайчике,',
    TOAD: 'Жаба на метле.'
};

function release(breed) {
    let poemLine = ANIMALS[breed];

    if (!poemLine) {
        return SuperPromise.reject('Cant release animal of the specified breed!');
    }

    return new SuperPromise((resolve, reject) => {
        setTimeout(() => {
            console.info(poemLine);

            resolve();
        }, rndInt());
    });
}

function finalize() {
    return new SuperPromise((resolve, reject) => {
        setTimeout(() => {
            console.info('Едут и смеются\nПряники жуют.');

            resolve();
        }, rndInt());
    });
}

function rndInt() {
    return Math.floor(Math.random() * 100);
}

module.exports = {
    release: release,
    finalize: finalize
};
