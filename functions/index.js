const { applyPatch } = require('fast-json-patch');
const functions = require('firebase-functions');
require('firebase/app');
require('firebase/firestore');
const admin = require('firebase-admin');
const { Solver } = require('@ffxiv-teamcraft/crafting-solver');
const { CraftingActionsRegistry, CrafterStats } = require('@ffxiv-teamcraft/simulator');
admin.initializeApp();
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
};

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

validatedCache = {};

exports.userIdValidator = functions.runWith(runtimeOpts).https.onRequest((request, response) => {
  const userId = request.query.userId;
  if (validatedCache[userId] !== undefined) {
    return response.status(200).set('Content-Type', 'application/json').send(`{"valid": ${validatedCache[userId]}}`);
  }
  return firestore.collection('users').doc(userId).get().then(snap => {
    validatedCache[userId] = snap.exists;
    response.status(200).set('Content-Type', 'application/json').send(`{"valid": ${snap.exists}}`);
  });
});

exports.solver = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Max-Age', '3600');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.status(204).send('');
  } else {
    const stats = new CrafterStats(
      req.body.stats.jobId,
      req.body.stats.craftsmanship,
      req.body.stats.control,
      req.body.stats.cp,
      req.body.stats.specialist,
      req.body.stats.level,
      req.body.stats.levels
    );
    const solver = new Solver(req.body.recipe, stats, req.body.configuration);
    const seed = req.body.seed ? CraftingActionsRegistry.deserializeRotation(req.body.seed) : undefined;
    return res.json(CraftingActionsRegistry.serializeRotation(solver.run(seed)));
  }
});

function applyOffsets(data, entries) {
  entries.forEach(customEntry => {
    const explodedPath = customEntry.path.split('/');
    explodedPath.shift();
    let pointer = data;
    for (let fragment of explodedPath.slice(0, -1)) {
      pointer = pointer[fragment];
    }
    pointer[explodedPath[explodedPath.length - 1]] += customEntry.offset;
  });
  return data;
}

exports.updateList = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  const listRef = firestore.collection('lists').doc(data.uid);
  return firestore.runTransaction(transaction => {
    return transaction.get(listRef).then(listDoc => {
      const list = listDoc.data();
      try {
        const [standard, custom] = JSON.parse(data.diff).reduce((acc, entry) => {
          if (entry.custom) {
            acc[1].push(entry);
          } else {
            acc[0].push(entry);
          }
          return acc;
        }, [[], []]);
        applyPatch(list, standard);
        applyOffsets(list, custom);
        transaction.set(listRef, list);
      } catch (e) {
        console.log(data.diff);
      }
    });
  });
});

exports.updateInventory = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  const ref = firestore.collection('user-inventories').doc(data.uid);
  return firestore.runTransaction(transaction => {
    return transaction.get(ref).then(doc => {
      const docData = doc.data() || {};
      try {
        const [standard, custom] = JSON.parse(data.diff).reduce((acc, entry) => {
          if (entry.custom) {
            acc[1].push(entry);
          } else {
            acc[0].push(entry);
          }
          return acc;
        }, [[], []]);
        applyPatch(docData, standard);
        applyOffsets(docData, custom);
        transaction.set(ref, docData);
      } catch (e) {
        console.log(data.diff);
      }
    });
  });
});

exports.setCustomUserClaims = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  // Check if user meets role criteria:
  // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
  let customClaims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'reporter',
      'x-hasura-allowed-roles': ['reporter'],
      'x-hasura-user-id': data.uid
    }
  };
  // Set custom user claims on this newly created user.
  return admin.auth().setCustomUserClaims(data.uid, customClaims)
    .then(() => {
      return admin.auth().getUser(data.uid);
    })
    .then(() => {
      return { response: 'ok' };
    })
    .catch(error => {
      console.log(error);
    });
});

