import { RuntimeOptions } from 'firebase-functions';
import { Item } from './marketboard/item';
import { combineLatest, from } from 'rxjs';
import axios from 'axios';
import { createRedisClient, updateCache, updateServerData } from './marketboard/common';
import { switchMap } from 'rxjs/operators';
import { uniq } from 'lodash';
import { closeUniversalisQueue } from './marketboard/universalis';

const functions = require('firebase-functions');
require('firebase/app');
require('firebase/firestore');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');
admin.initializeApp();
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });
const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT });
const commissionsCreatedTopic = pubsub.topic('commissions-created');
const algoliasearch = require('algoliasearch');
const client = algoliasearch('7E5QY6H5LR', functions.config().algolia.key);
const searchIndex = client.initIndex('community_lists');

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 120,
  memory: '256MB'
};

function getAlgoliaEntry(snapshot) {
  const doc = snapshot.data();
  return {
    objectID: snapshot.id,
    name: doc.name,
    description: doc.note,
    _tags: doc.tags
  };
}

/**
 * SEARCH STUFF
 */
export const updateSearchOnEdit = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onUpdate((change) => {
  if (change.after.data().public !== change.before.data().public) {
    // If is has been added as community list
    if (change.after.data().public) {
      return searchIndex.saveObject(getAlgoliaEntry(change.after));
    } else {
      return searchIndex.deleteObject(change.before.id);
    }
  } else if (change.before.data().public) {
    return searchIndex.saveObject(getAlgoliaEntry(change.after));
  }
});

export const updateSearchOnDelete = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onDelete((snap) => {
  if (snap.data().public) {
    return searchIndex.deleteObject(snap.id);
  }
});

export const searchCommunityLists = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Max-Age', '3600');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    return res.status(204).send('');
  }
  const options: any = {};
  if (req.query.tags) {
    options.tagFilters = req.query.tags;
  }
  if (!req.query.tags && !req.query.name) {
    res.status(400).send();
    return;
  }
  searchIndex.search(decodeURIComponent(req.query.name || '').toString(), options).then(results => {
    if (results.nbHits === 0) {
      return res.send(results);
    }
    firestore.getAll(...results.hits.map(result => firestore.collection('lists').doc(result.objectID))).then(lists => {
      res.send({
        lists: lists.map(snap => {
          return {
            $key: snap.id,
            ...snap.data()
          };
        })
      });
    });
  });
});
/**
 * END OF SEARCH STUFF
 */


// Firestore counts
export const firestoreCountlistsCreate = functions.runWith(runtimeOpts).firestore.document('/lists/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/lists_created');
  // Increment the number of lists created using the tool.
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

export const firestoreCountRotationsCreate = functions.runWith(runtimeOpts).firestore.document('/rotations/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/rotations_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

export const firestoreCountGearsetsCreate = functions.runWith(runtimeOpts).firestore.document('/gearsets/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/gearsets_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

export const firestoreCountReplaysCreate = functions.runWith(runtimeOpts).firestore.document('/crafting-replays/{uid}').onCreate(() => {
  const creationsRef = admin.database().ref('/crafting_replays_created');
  return creationsRef.transaction(current => {
    return current + 1;
  }).then(() => null);
});

export const desktopUpdater = functions.runWith(runtimeOpts).https.onRequest((req, res) => {
  if (req.path === '/RELEASES') {
    res.redirect(301, `https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases/latest/download/RELEASES`);
    return;
  } else if (req.path.endsWith('.nupkg')) {
    const version = req.path.split('-')[2];
    res.redirect(301, `https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/releases/download/v${version}${req.path}`);
    return;
  }
  return res.status(400).end();
});


function notifyBot(event, commission) {
  commissionsCreatedTopic.publish(Buffer.from(JSON.stringify({ event, commission })));
}

export const commissionCreationNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onCreate((snapshot) => {
  return notifyBot('created', { $key: snapshot.$key, ...snapshot.data() });
});

export const commissionDeletionNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onDelete((snapshot) => {
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

export const commissionEditionNotifications = functions.runWith(runtimeOpts).firestore.document('/commissions/{uid}').onUpdate((change) => {
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

export const subscribeToUserTopic = functions.runWith(runtimeOpts).https.onCall((data, context) => {
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

export const unsubscribeFromUserTopic = functions.runWith(runtimeOpts).https.onCall((data, context) => {
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

const validatedCache = {};

export const userIdValidator = functions.runWith(runtimeOpts).https.onRequest((request, response) => {
  const userId = request.query.userId;
  if (validatedCache[userId] !== undefined) {
    response.status(200).set('Content-Type', 'application/json').send(`{"valid": ${validatedCache[userId]}}`);
    return;
  }
  return firestore.collection('users').doc(userId).get().then(snap => {
    validatedCache[userId] = snap.exists;
    response.status(200).set('Content-Type', 'application/json').send(`{"valid": ${snap.exists}}`);
  });
});

const computeReplayHash = (replay) => {
  const hmac = crypto.createHmac('sha256', functions.config().replays.hmac.secret);
  hmac.update(JSON.stringify(Object.entries(replay).sort((a, b) => {
    return a[0] > b[0] ? 1 : -1;
  })));
  return hmac.digest('hex');
};

export const hashReplay = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  if (context.auth.uid === undefined || context.auth.token === undefined) {
    return { hash: 'nope' };
  }
  return { hash: computeReplayHash(data.replay) };
});

export const saveReplay = functions.runWith(runtimeOpts).https.onCall((data, context) => {
  const { hash, ...dataToHash } = data.replay;
  const hashCheck = computeReplayHash(dataToHash);
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


export const getUserByEmail = functions.runWith(runtimeOpts).https.onCall((data, context) => {
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
  if (!user) {
    return {};
  }
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

export const setCustomUserClaims = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  const user = await firestore.collection('users').doc(data.uid).get().then(doc => doc.data());
  // Check if user meets role criteria:
  // Your custom logic here: to decide what roles and other `x-hasura-*` should the user get
  const customClaims = {
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

let items: Record<number, Item>;


export const updateCacheForAllServers = functions
  .runWith({
    vpcConnector: `projects/ffxivteamcraft/locations/us-central1/connectors/functions-connector`,
    timeoutSeconds: 270,
    memory: '512MB'
  })
  .pubsub
  .schedule('every 2 minutes').onRun(async () => {
    if (!items) {
      items = {};
      const extractsReq = await axios.get('https://github.com/ffxiv-teamcraft/ffxiv-teamcraft/raw/staging/apps/client/src/assets/extracts/extracts.json');
      const recipesReq = await axios.get('https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/apps/client/src/assets/data/recipes.json');
      const extracts = extractsReq.data;
      const recipes = recipesReq.data;
      Object.values<any>(extracts)
        .filter(e => !e.sources.some((s: any) => s.type === -1))
        .forEach(extract => {
          const crafting = extract.sources.find((source: any) => source.type === 1)?.data || null;
          const gathering = extract.sources.find((source: any) => source.type === 7)?.data || null;
          const vendors = extract.sources.find((source: any) => source.type === 3)?.data || null;
          const trades = extract.sources.find((source: any) => source.type === 2)?.data || null;
          const reduction = extract.sources.find((source: any) => source.type === 4)?.data || null;
          const requirements = crafting ? recipes.find((r: any) => r.id.toString() === crafting[0].id.toString())?.ingredients : null;
          items[extract.id] = {
            id: extract.id,
            crafting,
            gathering,
            vendors,
            trades,
            reduction,
            requirements
          };
        });
    }

    return new Promise<void>(resolve => {
      createRedisClient().then(redis => {
        from(axios.get('https://xivapi.com/servers')).pipe(
          switchMap(res => {
            const servers: string[] = res.data;
            return combineLatest(servers.map(server => {
              return updateServerData(server);
            }));
          })
        ).subscribe(async res => {
          for (const row of res) {
            const itemIds = Object.keys(row.data);
            for (const id of itemIds) {
              await redis.set(`mb:${row.server}:${id}`, JSON.stringify(row.data[+id]));
            }
          }
          updateCache(uniq(res.map(row => row.server)), items, redis);
          closeUniversalisQueue();
          resolve();
        });
      });
    });
  });

