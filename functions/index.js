const functions = require('firebase-functions');
require('firebase/app');
require('firebase/firestore');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { Solver } = require('@ffxiv-teamcraft/crafting-solver');
const { CraftingActionsRegistry, CrafterStats } = require('@ffxiv-teamcraft/simulator');
admin.initializeApp();
const firestore = admin.firestore();
const messaging = admin.messaging();
firestore.settings({ timestampsInSnapshots: true });

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '256MB'
};

// Firestore counts
exports.firestoreCountlistsCreate = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/lists_created');
  // Increment the number of lists created using the tool.
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

exports.firestoreCountRotationsCreate = functions.runWith(runtimeOpts).firestore.document('/rotations/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/rotations_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

exports.firestoreCountGearsetsCreate = functions.runWith(runtimeOpts).firestore.document('/gearsets/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/gearsets_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

exports.firestoreCountReplaysCreate = functions.runWith(runtimeOpts).firestore.document('/crafting-replays/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/crafting_replays_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

exports.commissionNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onCreate((snapshot) => {
  admin.messaging().sendToTopic(`/topics/commissions.${snapshot.data().datacenter}`, {
    data: snapshot.data()
  });
});

exports.subscribeToCommissions = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  return admin.messaging().subscribeToTopic(data.token, `commissions.${data.datacenter}`).then(res => {
    return {
      ...res,
      data: data
    };
  });
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

const hashReplay = (replay) => {
  const hmac = crypto.createHmac('sha256', functions.config().replays.hmac.secret);
  hmac.update(JSON.stringify(Object.entries(replay).sort((a, b) => {
    return a[0] > b[0] ? 1 : -1;
  })));
  return hmac.digest('hex');
};

exports.hashReplay = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  if (context.auth.uid === undefined || context.auth.token === undefined) {
    return { hash: 'nope' };
  }
  return { hash: hashReplay(data.replay) };
});

exports.saveReplay = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  const { hash, ...dataToHash } = data.replay;
  const hashCheck = hashReplay(dataToHash);
  if (hash === hashCheck) {
    const { $key, ...dataToSave } = data.replay;
    firestore.collection('crafting-replays').doc($key).set({
      ...dataToSave,
      authorId: context.auth.uid,
      online: true
    });
  } else {
    throw new functions.https.HttpsError('failed-precondition', 'Refusing to save forged replay');
  }
});


exports.getUserByEmail = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  return admin.auth().getUserByEmail(data.email)
    .then(res => {
      return {
        record: res
      };
    })
    .catch(error => {
      console.log(error);
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

