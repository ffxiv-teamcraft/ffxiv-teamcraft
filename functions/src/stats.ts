// Firestore counts
import * as functions from 'firebase-functions';
require('firebase/app');
require('firebase/firestore');
import * as admin from 'firebase-admin';

export const firestoreCountListsUpdate = functions.firestore.document('/lists/{uid}').onUpdate(() => {
  const creationsRef = admin.database().ref('/usage/list_updates');
  // Increment the number of lists created using the tool.
  return creationsRef.transaction(current => {
    return (current || 0) + 1;
  }).then(() => null);
});


// Firestore counts
export const firestoreCountListsHistoryCreate = functions.firestore.document('/lists/{uid}/history/{huid}').onCreate(() => {
  const creationsRef = admin.database().ref('/usage/list_history_creates');
  // Increment the number of lists created using the tool.
  return creationsRef.transaction(current => {
    return (current || 0) + 1;
  }).then(() => null);
});


// Firestore counts
export const firestoreCountListsHistoryDelete = functions.firestore.document('/lists/{uid}/history/{huid}').onDelete(() => {
  const creationsRef = admin.database().ref('/usage/list_history_deletes');
  // Increment the number of lists created using the tool.
  return creationsRef.transaction(current => {
    return (current || 0) + 1;
  }).then(() => null);
});
