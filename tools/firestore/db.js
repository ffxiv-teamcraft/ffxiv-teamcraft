const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const Multiprogress = require('multi-progress');
const multi = new Multiprogress(process.stdout);
// In your index.js

const firestoreService = require('firestore-export-import');
const serviceAccount = require('./service-account-beta.json');

// Initiate Firebase App
firestoreService.initializeApp(serviceAccount, 'https://ffxiv-teamcraft-beta.firebaseio.com');

// Start exporting your data

// Create a new client
const firestore = new Firestore();
const backupFile = './lists.json';

const allLists = Object.entries(JSON.parse(fs.readFileSync(backupFile, 'utf8').trim() || '[]')).map(([k, v]) => {
  return {
    ...v,
    $key: k
  };
});

console.log('Lists cache loaded', allLists.length);

async function fetchLists() {
  const data = await firestoreService
    .backup('lists');
  fs.writeFileSync(backupFile, JSON.stringify(data.lists));
}

async function migrateLists() {
  const batches = [];
  let operations = 0;

  function getCurrentBatch() {
    if (batches[operations % 500] === undefined) {
      batches[operations % 500] = firestore.batch();
    }
    return batches[operations % 500];
  }

  for (let list of allLists) {
    if (list.items === undefined && list.finalItems === undefined) {
      continue;
    }
    const items = list.items;
    const finalItems = list.finalItems;
    delete list.items;
    delete list.finalItems;
    items
      .filter(item => item !== null)
      .forEach(item => {
        getCurrentBatch().set(firestore.collection(`list/${list.$key}/items`).doc(), item);
        operations++;
      });
    finalItems
      .filter(item => item !== null)
      .forEach(item => {
        getCurrentBatch().set(firestore.collection(`list/${list.$key}/finalItems`).doc(), item);
        operations++;
      });
    getCurrentBatch().set(firestore.doc(`list/${list.$key}`), list);
    operations++;
  }

  console.log('Operations to do: ', operations);

  if (process.argv.indexOf('--write') > -1) {
    const progress = multi.newBar(`[:bar] :current/:total :etas`, {
      complete: '=',
      incomplete: ' ',
      width: 50,
      total: Math.ceil(operations / 500)
    });

    async function executeBatches(index = 0) {
      if (batches[index]) {
        await batches[index].commit();
        progress.tick();
        return executeBatches(index + 1);
      }
      return true;
    }

    await executeBatches();
  }
}

if (process.argv.indexOf('--fetch-lists') > -1) {
  fetchLists();
} else if (process.argv.indexOf('--migrate') > -1) {
  migrateLists();
}


