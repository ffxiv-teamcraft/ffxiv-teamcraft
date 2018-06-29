require('firebase');
require('firebase/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//Firebase counts
// exports.countlistsCreate = functions.database.ref('/lists/{uid}').onCreate(() => {
//     const ref = admin.database().ref('/list_count');
//     const creationsRef = admin.database().ref('/lists_created');
//     // Increment the number of lists created using the tool.
//     creationsRef.transaction(current => {
//         return current + 1;
//     }).then(() => null);
//     return ref.transaction(current => {
//         return current + 1;
//     }).then(() => null);
// });
//
// exports.countlistsDelete = functions.database.ref('/lists/{uid}').onDelete(() => {
//     const ref = admin.database().ref('/list_count');
//     return ref.transaction(current => {
//         return current - 1;
//     }).then(() => null);
// });

// Firestore counts
exports.firestoreCountlistsCreate = functions.firestore.document('/lists/{uid}').onCreate(() => {
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

exports.firestoreCountlistsDelete = functions.firestore.document('/lists/{uid}').onDelete(() => {
    const ref = admin.database().ref('/list_count');
    return ref.transaction(current => {
        return current - 1;
    }).then(() => null);
});

exports.firestoreCountCommissions = functions.firestore.document('/commissions/{server}/registry/{uid}').onCreate(() => {
    const creationsRef = admin.database().ref('/commissions_created');
    // Increment the number of lists created using the tool.
    return creationsRef.transaction(current => {
        return current + 1;
    }).then(() => null);
});

