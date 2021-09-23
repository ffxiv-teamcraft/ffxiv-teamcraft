const functions = require('firebase-functions');
require('firebase/app');
require('firebase/firestore');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { Solver } = require('@ffxiv-teamcraft/crafting-solver');
const { CraftingActionsRegistry, CrafterStats } = require('@ffxiv-teamcraft/simulator');
const { PubSub } = require('@google-cloud/pubsub');
admin.initializeApp();
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });
const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT });
const commissionsCreatedTopic = pubsub.topic('commissions-created');

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

exports.desktopUpdater = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
  if (req.path === '/RELEASES') {
    return res.redirect(301, `https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases/latest/download/RELEASES`);
  } else if (req.path.endsWith('.nupkg')) {
    const version = req.path.split('-')[2];
    return res.redirect(301, `https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases/download/v${version}${req.path}`);
  }
  return res.status(400).end();
});


function notifyBot(event, commission) {
  commissionsCreatedTopic.publish(Buffer.from(JSON.stringify({ event, commission })));
}

exports.commissionCreationNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onCreate((snapshot) => {
  return notifyBot('created', { $key: snapshot.$key, ...snapshot.data() });
});

exports.commissionDeletionNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onDelete((snapshot) => {
  return notifyBot('deleted', { $key: snapshot.$key, ...snapshot.data() });
});

function addUserCommissionNotification(targetId, type, payload) {
  return firestore.collection('notifications').add({
    ...payload,
    targetId,
    type: 'COMMISSION',
    subType: type
  });
}

exports.commissionEditionNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onUpdate((change) => {
  const before = { $key: change.before.id, ...change.before.data() };
  const after = { $key: change.after.id, ...change.after.data() };
  notifyBot('updated', after);
  // 2 is archived
  if (after.status === before.status && before.status === 2) {
    // If crafter posted their rating
    if (!before.ratings[before.crafterId] && !!after.ratings[before.crafterId]) {
      const rating = after.ratings[before.crafterId];
      firestore
        .collection('commission-profile')
        .doc(before.authorId)
        .update({
          ratings: admin.firestore.FieldValue.arrayUnion({
            ...rating,
            commissionId: before.$key
          })
        });
    }
    // If client posted their rating
    if (!before.ratings[before.authorId] && !!after.ratings[before.authorId]) {
      const rating = after.ratings[before.authorId];
      firestore
        .collection('commission-profile')
        .doc(before.crafterId)
        .update({
          ratings: admin.firestore.FieldValue.arrayUnion({
            ...rating,
            commissionId: before.$key
          })
        });
    }
  }
  if (before.crafterId !== after.crafterId) {
    if (after.crafterId !== null) {
      return addUserCommissionNotification(
        after.crafterId,
        'HIRED',
        { commissionName: after.name, commissionId: after.$key }
      ).then(() => admin.messaging().sendToTopic(`/topics/users.${after.crafterId}`, {
        data: {
          type: 'hired',
          commission: JSON.stringify(after)
        },
        notification: {
          title: `Commission contract started`,
          body: `You have been hired on commission ${after.name}`
        }
      }));
    } else {
      return Promise.all([
        addUserCommissionNotification(
          before.crafterId,
          'CONTRACT_ENDED_CONTRACTOR',
          { commissionName: before.name, commissionId: before.$key }
        ),
        addUserCommissionNotification(
          after.authorId,
          'CONTRACT_ENDED_CLIENT',
          { commissionName: after.name, commissionId: after.$key }
        ),
        admin.messaging().sendToTopic(`/topics/users.${before.crafterId}`, {
          data: {
            type: 'contract_ended_contractor',
            commission: JSON.stringify(after)
          },
          notification: {
            title: `Commission contract ended`,
            body: `You are no longer the contractor for commission ${before.name}`
          }
        }),
        admin.messaging().sendToTopic(`/topics/users.${before.authorId}`, {
          data: {
            type: 'contract_ended_client',
            commission: JSON.stringify(after)
          },
          notification: {
            title: `Commission contract ended`,
            body: `Contractor resigned from commission ${before.name}`
          }
        })
      ]);
    }
  }
  if (before.candidates.length < after.candidates.length) {
    return addUserCommissionNotification(
      after.authorId,
      'CANDIDATE',
      { commissionName: after.name, commissionId: after.$key }
    ).then(() => admin.messaging().sendToTopic(`/topics/users.${before.authorId}`, {
      data: {
        type: 'candidate',
        commission: JSON.stringify(after)
      },
      notification: {
        title: `New candidate`,
        body: `New candidate for commission ${before.name}`
      }
    }));
  }
  if (before.itemsProgression < after.itemsProgression && after.itemsProgression >= 100) {
    return addUserCommissionNotification(
      after.authorId,
      'DONE',
      { commissionName: after.name, commissionId: after.$key }
    ).then(() => admin.messaging().sendToTopic(`/topics/users.${before.authorId}`, {
      data: {
        type: 'done',
        commission: JSON.stringify(after)
      },
      notification: {
        title: `Commission list completed`,
        body: `List associated with commission ${before.name} has been completed`
      }
    }));
  }
});

exports.subscribeToUserTopic = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  if (!data.token || data.token.length === 0) {
    return Promise.resolve();
  }
  return admin.messaging().subscribeToTopic(data.token, `users.${context.auth.uid}`).then(res => {
    return {
      ...res,
      data: data
    };
  });
});

exports.unsubscribeFromUserTopic = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  return admin.messaging().unsubscribeFromTopic(data.token, `users.${context.auth.uid}`).then(res => {
    return {
      ...res,
      data: data
    };
  });
});

// Run everyday at 00:00
functions.runWith(runtimeOpts).pubsub.schedule('0 0 * * *').onRun(() => {
  const aMonthOldSeconds = Date.now() / 1000 - 30 * 86400;
  return firestore
    .collection('commissions')
    .where('createdAt.seconds', '>=', aMonthOldSeconds)
    .where('status', '==', 0)
    .get()
    .then(commissions => {
      commissions.forEach(c => c.ref.delete());
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

function getTokenClaims(user) {
  if (user.admin) {
    return {
      'x-hasura-default-role': 'checker',
      'x-hasura-role': 'checker',
      'x-hasura-allowed-roles': ['reporter', 'checker', 'admin']
    };
  }
  if (user.moderator || user.allaganChecker) {
    return {
      'x-hasura-default-role': 'checker',
      'x-hasura-role': 'checker',
      'x-hasura-allowed-roles': ['reporter', 'checker']
    };
  }
  return {
    'x-hasura-default-role': 'reporter',
    'x-hasura-role': 'reporter',
    'x-hasura-allowed-roles': ['reporter']
  };
}

exports.setCustomUserClaims = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  const user = await firestore.collection('users').doc(data.uid).get().then(doc => doc.data());
  // Check if user meets role criteria:
  // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
  let customClaims = {
    'https://hasura.io/jwt/claims': {
      ...getTokenClaims(user),
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

