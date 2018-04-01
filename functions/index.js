require('firebase');
require('firebase/firestore');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const express = require('express');
const fetch = require('node-fetch');
const url = require('url');
const app = express();

const appUrl = 'beta.ffxivteamcraft.com';
const renderUrl = 'https://render-tron.appspot.com/render';

function generateUrl(request) {
    return url.format({
        protocol: request.protocol,
        host: appUrl,
        pathname: request.originalUrl
    });
}


function isBot(bots, userAgent) {
    const agent = userAgent.toLowerCase();
    for (const bot of bots) {
        if (agent.indexOf(bot) > -1) {
            return true;
        }
    }
    return false;
}


function detectLinkBot(userAgent) {
    const bots = [
        'twitterbot',
        'facebookexternalhit',
        'linkedinbot',
        'embedly',
        'baiduspider',
        'pinterest',
        'slackbot',
        'discord',
        'vkShare',
        'facebot',
        'outbrain',
        'W3C_Validator'
    ];
    return isBot(bots, userAgent);
}

function detectSEBot(userAgent) {
    const bots = [
        'googlebot',
        'bingbot',
        'yandexbot',
        'duckduckbot',
        'slurp'
    ];
    return isBot(bots, userAgent);
}

app.get('*', (req, res) => {

    const isLinkBot = detectLinkBot(req.headers['user-agent']);
    const isSEBot = detectSEBot(req.headers['user-agent']);
    // If it's a bot, use rendertron
    if (isLinkBot) {
        const botUrl = generateUrl(req);
        fetch(`${renderUrl}/${botUrl}`)
            .then(res => res.text())
            .then(body => {
                res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
                res.set('Vary', 'User-Agent');

                res.send(body.toString());
            });
    } else if (isSEBot && req.originalUrl.indexOf('/list/') === -1) {
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
                res.send(body);
            });
    }

});

//Rendertron SSR for bots
exports.app = functions.https.onRequest(app);

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

