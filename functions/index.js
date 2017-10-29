'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.countlistsCreate = functions.database.ref('/users/{uuid}/lists/{uid}').onCreate(() => {
    const ref = admin.database().ref('/list_count');
    const creationsRef = admin.database().ref('/lists_created');
    // Increment the number of lists created using the tool.
    creationsRef.transaction(current => {
        return current + 1;
    }).then(() => null);
    return ref.transaction(current => {
        return current + 1;
    }).then(() => null);
});

exports.countlistsDelete = functions.database.ref('/users/{uuid}/lists/{uid}').onDelete(() => {
    const ref = admin.database().ref('/list_count');
    return ref.transaction(current => {
        return current - 1;
    }).then(() => null);
});
