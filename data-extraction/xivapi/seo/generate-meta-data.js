const { getAllPages } = require('../tools.js');
const fs = require('fs');
const path = require('path');
const { map } = require('rxjs/operators');
const { combineLatest } = require('rxjs');

const itemMeta$ = getAllPages('https://xivapi.com/Item?columns=ID,Name_*').pipe(
  map(page => {
    const itemsMeta = {
      en: {},
      ja: {},
      de: {},
      fr: {},
      icons: {}
    };
    page.Results.forEach(item => {
      itemsMeta.icons[item.ID] = `https://xivapi.com/i2/ls/${item.ID}.png`;
      for (let lang of Object.keys(itemsMeta).filter(k => k !== 'icons')) {
        itemsMeta[lang][item.ID] = {
          title: item[`Name_${lang}`],
          description: item[`Description_${lang}`]
        };
      }
    });
    return itemsMeta;
  })
);

const instanceMeta$ = getAllPages('https://xivapi.com/InstanceContent?columns=ID,Name_*,Banner').pipe(
  map(page => {
    const instancesMeta = {
      en: {},
      ja: {},
      de: {},
      fr: {},
      icons: {}
    };
    page.Results.forEach(instance => {
      instancesMeta.icons[instance.ID] = instance.Banner;
      for (let lang of Object.keys(instancesMeta).filter(k => k !== 'icons')) {
        instancesMeta[lang][instance.ID] = {
          title: instance[`Name_${lang}`],
          description: instance[`Description_${lang}`]
        };
      }
    });
    return instancesMeta;
  })
);

const questMeta$ = getAllPages('https://xivapi.com/Quest?columns=ID,Name_*,Banner').pipe(
  map(page => {
    const questsMeta = {
      en: {},
      ja: {},
      de: {},
      fr: {},
      icons: {}
    };
    page.Results.forEach(quest => {
      questsMeta.icons[quest.ID] = quest.Banner;
      for (let lang of Object.keys(questsMeta).filter(k => k !== 'icons')) {
        questsMeta[lang][quest.ID] = {
          title: quest[`Name_${lang}`],
          description : quest[`TextData_${lang}`].Journal[0].Text
        };
      }
    });
    return questsMeta;
  })
);

combineLatest([itemMeta$, instanceMeta$, questMeta$]).subscribe(null, null, ([item, instance, quest]) => {
  const meta = {
    item: item,
    instance: instance,
    quest: quest
  };
  fs.writeFileSync(path.join(__dirname, '../../../functions/meta/metadata.json'), JSON.stringify(meta));
});
