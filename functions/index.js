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

exports.updateUserListCount = functions.firestore.document('/lists/{uid}').onCreate((snap) => {
  return firestore.runTransaction(transaction => {
    const userRef = firestore.collection('users').doc(snap.data.data().authorId);
    return transaction.get(userRef).then(user => {
      user.stats = user.stats || {};
      user.stats.listsCreated = user.stats.listsCreated || 0;
      user.stats.listsCreated += 1;
      return transaction.update(userRef, { stats: user.stats });
    });
  });
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

function dectectIndexBot(userAgent) {
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
    'W3C_Validator'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found', agent);
  return false;

}

function dectectDeepLinkBot(userAgent) {
  const deepLinkBots = [
    'twitterbot',
    'slackbot',
    'Discordbot'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of deepLinkBots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found', agent);
  return false;

}

const indexAllowedPages = ['/search', '/community-rotations', '/levequests', '/about', '/support-us', '/desynth-guide', '/gc-supply', '/macro-translator'];

app.get('*', (req, res) => {
  const isIndexBot = dectectIndexBot(req.headers['user-agent']);
  const isDeepLinkBot = dectectDeepLinkBot(req.headers['user-agent']);

  if (isDeepLinkBot || (isIndexBot && indexAllowedPages.some(page => req.originalUrl.indexOf(page) > -1))) {
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
