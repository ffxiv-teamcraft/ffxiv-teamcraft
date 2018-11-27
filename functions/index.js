require('firebase');
require('firebase/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();
firestore.settings({timestampsInSnapshots: true});

function getCompact(list) {
  const compact = list;
  delete compact.items;
  compact.finalItems = compact.finalItems.map(item => {
    const entry = {
      id: item.id,
      icon: item.icon,
      amount: item.amount,
      amount_needed: item.amount_needed
    };
    if (item.recipeId !== undefined) {
      entry.recipeId = item.recipeId;
    }
    return entry;
  });
  return compact;
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
  const compact = getCompact(snap.data.data());
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.updateListCompacts = functions.firestore.document('/lists/{uid}').onUpdate((snap) => {
  const compact = getCompact(snap.data.data());
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.deleteListCompacts = functions.firestore.document('/lists/{uid}').onDelete((snap) => {
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).delete();
});

