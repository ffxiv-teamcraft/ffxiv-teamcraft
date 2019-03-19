require('firebase');
require('firebase/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

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

function registerItemsCreation(items) {
  return Promise.all(items.filter(i => !i.custom).map(item => {
    return admin.database().ref('/stats').transaction(current => {
      current = current || {};
      const entry = current[`${item.id}:${item.recipeId}`];
      if (entry === undefined) {
        current[`${item.id}:${item.recipeId}`] = [Date.now()];
      } else {
        entry.push(Date.now());
        current[`${item.id}:${item.recipeId}`] = entry;
      }
      return current;
    });
  }));
}

// Firestore counts
exports.firestoreCountlistsCreate = functions.firestore.document('/lists/{uid}').onCreate((snap) => {
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

exports.createListCompacts = functions.firestore.document('/lists/{uid}').onCreate((snap) => {
  const compact = getCompact(snap.data.data());
  // registerItemsCreation(snap.data.data().finalItems);
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).set(compact);
});

exports.updateListCompacts = functions.firestore.document('/lists/{uid}').onUpdate((snap) => {
  const compact = getCompact(snap.data.data());
  const diff = snap.data.data().finalItems.filter(item => !snap.data.previous.data().finalItems.some(i => i.id === item.id));
  // if (diff.length > 0) {
  //   registerItemsCreation(diff);
  // }
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).update(compact);
});

exports.deleteListCompacts = functions.firestore.document('/lists/{uid}').onDelete((snap) => {
  return firestore.collection('compacts').doc('collections').collection('lists').doc(snap.params.uid).delete();
});


// SSR Stuff
const express = require('express');
const fetch = require('node-fetch');
const url = require('url');
const app = express();

const appUrl = 'ffxivteamcraft.com';
const renderUrl = 'https://render-tron.appspot.com/render';

function generateUrl(request) {
  return url.format({
    protocol: request.protocol,
    host: appUrl,
    pathname: request.originalUrl
  });
}

function dectectBot(userAgent) {
  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',

    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator',
    'Discordbot'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found');
  return false;

}

app.get('*', (req, res) => {
  const isBot = dectectBot(req.headers['user-agent']);

  if (isBot) {
    const botUrl = generateUrl(req);

    fetch(`${renderUrl}/${botUrl}`)
      .then(res => res.text())
      .then(body => {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.set('Vary', 'User-Agent');
        res.send(body.toString());
      });
  } else {
    fetch(`https://${appUrl}`)
      .then(res => res.text())
      .then(body => {
        res.send(body.toString());
      });
  }
});

exports.app = functions.https.onRequest(app);
