'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.countlists = functions.database.ref('/users/{uuid}/lists').onWrite(event => {
    const ref = event.data.ref.parent.parent.parent.child('list_count');
    return ref.transaction(current => {
        console.log('previous value : ' + current);
        if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
        }
    }).then((value) => {
        console.log('list count updated with new value ' + value);
    });
});

exports.recountlists = functions.database.ref('/list_count').onWrite(event => {
    if (!event.data.exists()) {
        const ref = event.data.ref;
        const usersRef = event.data.ref.parent.child('users');

        return usersRef
            .once('value')
            .then(value => value.val())
            .then(users => {
                let count = 0;
                users
                    .filter(u => u.lists !== undefined & u.lists !== null)
                    .forEach(user => {
                    count += Object.keys(user.lists).length;
                });
                ref.set(count);
            });
    }
});
