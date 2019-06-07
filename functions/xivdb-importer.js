const admin = require('firebase-admin');
const { combineLatest, from, Subject, BehaviorSubject } = require('rxjs');
const { map, switchMap, tap, takeUntil } = require('rxjs/operators');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Translate } = require('@google-cloud/translate');

const translate = new Translate({ projectId: 'ffxivteamcraft' });

const contentIds = {
  1: 'item',
  3: 'action',
  4: 'quest',
  5: 'item',
  7: 'fate',
  8: 'achievement',
  9: 'huntinglog',
  11: 'npc',
  12: 'mob',
  // 13, 14
  15: 'mount',
  16: 'instance',
  // 17
  18: 'minion',
  19: 'fcstatus',
  20: 'leve',
  // starting high as xivdb v1 had some around 100.
  200: 'map',
  201: 'shop',
  202: 'node',
  203: 'emote',
  204: 'status',
  205: 'title',
  206: 'weather',
  207: 'special-shop',
  300: 'character'
};

function chunkArray(list, howMany) {
  const result = [];
  const input = list.slice(0);
  while (input[0]) {
    result.push(input.splice(0, howMany));
  }
  return result;
}

const comments = [];

admin.initializeApp({
  credential: admin.credential.cert('C:\\Users\\Flavien Normand\\Documents\\service-account-beta-db.json')
});
const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });

fs.createReadStream(path.join(__dirname, 'input/content_comments.csv'), 'utf-8').pipe(csv())
  .on('data', function(row) {
    comments.push(row);
  })
  .on('end', () => {
    console.log('Comments loaded, size:', comments.length);
    importComments();
  });

function importComments() {
  const index$ = new BehaviorSubject(0);
  const done$ = new Subject();
  const data = chunkArray(comments, 500);
  index$.pipe(
    map(index => {
      return data[index];
    }),
    switchMap(rows => {
      return combineLatest(rows.map(comment => {
          const message = comment.text;
          const timestamp = new Date(comment.time).getTime();
          const deleted = comment.deleted === 1;
          // Seems like sometimes the parser adds a space before the id key, idk why
          const id = comment.id || comment['﻿id'];
          const contentId = comment.uniq;
          return from(translate.detect(message)).pipe(
            switchMap(detections => {
              const language = Array.isArray(detections) ? detections[0].language : detections.language;
              const tcComment = {
                resourceId: `${contentIds[comment.content]}/${contentId}`,
                date: timestamp,
                deleted: deleted,
                language: language,
                message: message,
                parent: comment.reply_to
              };
              return firestore.collection('db-comments').doc(id.toString()).set(tcComment);
            })
          );
        })
      );
    }),
    tap(() => {
      if (data[index$.value + 1]) {
        index$.next(index$.value + 1);
      } else {
        done$.next();
      }
    }),
    takeUntil(done$)
  ).subscribe();
}
