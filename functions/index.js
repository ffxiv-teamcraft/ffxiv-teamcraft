const functions = require('firebase-functions');
require('firebase/app');
require('firebase/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
};

function getCompact(list) {
  const compact = list;
  delete compact.items;
  compact.finalItems = (compact.finalItems || []).map(item => {
    const entry = {
      amount: item.amount,
      amount_needed: item.amount_needed
    };
    if (item.craftedBy) {
      entry.craftedBy = item.craftedBy;
    }
    if (item.custom) {
      entry.$key = item.$key;
      entry.id = item.id;
      entry.custom = true;
      entry.name = item.name;
      entry.icon = item.icon || '';
    } else {
      entry.id = item.id;
      entry.icon = item.icon || '';
    }
    if (item.recipeId !== undefined) {
      entry.recipeId = item.recipeId;
    }
    return entry;
  });
  return compact;
}

// Firestore counts
exports.firestoreCountlistsCreate = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onCreate(() => {
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

exports.firestoreCountlistsDelete = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onDelete(() => {
  const ref = admin.database().ref('/list_count');
  return ref.transaction(current => {
    return current - 1;
  }).then(() => null);
});

exports.createListCompacts = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onCreate((snap) => {
  const compact = getCompact(snap.data());
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.updateListCompacts = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onUpdate((snap) => {
  const compact = getCompact(snap.after.data());
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.deleteListCompacts = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onDelete((snap) => {
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).delete();
});

exports.updateUserListCount = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onCreate((snap) => {
  return firestore.runTransaction(transaction => {
    const userRef = firestore.collection('users').doc(snap.data().authorId);
    return transaction.get(userRef).then(user => {
      user.stats = user.stats || {};
      user.stats.listsCreated = user.stats.listsCreated || 0;
      user.stats.listsCreated += 1;
      return transaction.update(userRef, { stats: user.stats });
    });
  });
});

exports.app = functions.https.onRequest((request, response) => {
  require(`${process.cwd()}/dist/client-webpack/server`).app(request, response);
});

