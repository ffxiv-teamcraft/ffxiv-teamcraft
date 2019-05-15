const { getAllPages } = require('../tools.js');
const { switchMap } = require('rxjs/operators');
const { combineLatest, concat } = require('rxjs');
const request = require('request');
const { Subject } = require('rxjs');

const langs = ['en', 'de', 'ja', 'fr'];

function prepareCache(sheet, page){
  return getAllPages(`https://xivapi.com/${sheet}?columns=ID,Name_*`).pipe(
    switchMap(page => {
      return concat([].concat.apply([],
        page.Results.map(item => {
          return langs.map(lang => {
            const done$ = new Subject();
            const options = {
              url: `https://beta.ffxivteamcraft.com/db/${lang}/${page}/${item.ID}/${item[`Name_${lang}`].split(' ').join('-')}`,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
              }
            };
            request(
              options,
              () => {
                done$.next();
              }
            );
            return done$;
          });
        })
        )
      );
    })
  );
}

combineLatest([
  // prepareCache('Item', 'item'),
  // prepareCache('InstanceContent', 'instance'),
  prepareCache('Fate', 'fate'),
  // prepareCache('Leve', 'leve'),
  // prepareCache('ENpcResident', 'npc'),
  // prepareCache('BNpcName', 'mob'),
  // prepareCache('Quest', 'quest'),
]).subscribe();
