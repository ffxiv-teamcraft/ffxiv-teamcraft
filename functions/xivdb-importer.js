const admin = require('firebase-admin');
const { Subject } = require('rxjs');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

contentIds = {
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

const comments = [];

fs.createReadStream(path.join(__dirname, 'input/content_comments.csv'), 'utf-8').pipe(csv())
  .on('data', function(row) {
    comments.push(row);
  })
  .on('end', () => {
    console.log('Comments loaded, size:', comments.length);
    importComments();
  });

function importComments() {
  //TODO
}
