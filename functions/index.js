require('firebase');
require('firebase/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();


function objectWithoutProperties(obj, keys) {
  let target = {};
  for (let i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}


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

exports.createListCompacts = functions.firestore.document('/lists/{uid}').onCreate((snap) => {
  const compact = snap.data.data();
  delete compact.items;
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.updateListCompacts = functions.firestore.document('/lists/{uid}').onUpdate((snap) => {
  const compact = snap.data.data();
  delete compact.items;
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.deleteListCompacts = functions.firestore.document('/lists/{uid}').onDelete((snap) => {
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).remove();
});

