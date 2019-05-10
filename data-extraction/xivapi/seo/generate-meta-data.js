const { getAllPages } = require('../tools.js');
const fs = require('fs');
const path = require('path');

const metadata = {
  db: {
    item: {
      en: {},
      ja: {},
      de: {},
      fr: {},
      icons: {}
    }
  }
};

getAllPages('https://xivapi.com/Item?columns=ID,Name_*').subscribe(page => {
  page.Results.forEach(item => {
    metadata.db.item.icons[item.ID] = `https://xivapi.com/i2/ls/${item.ID}.png`;
    for (let lang of Object.keys(metadata.db.item).filter(k => k !== 'icons')) {
      metadata.db.item[lang][item.ID] = {
        title: item[`Name_${lang}`],
        description: item[`Description_${lang}`]
      };
    }
  });
}, null, () => {
});
