const { getAllPages, get } = require('../tools.js');
const { switchMap, bufferCount, map, tap, mergeMap, takeUntil, first } = require('rxjs/operators');
const { combineLatest, concat, BehaviorSubject, Subject } = require('rxjs');
const request = require('request');
const _cliProgress = require('cli-progress');

const langs = ['en', 'de', 'ja', 'fr'];

function prepareCache(sheet, pageName) {
  return get(`https://xivapi.com/${sheet}`).pipe(
    switchMap(firstPage => {
      return getAllPages(`https://xivapi.com/${sheet}?columns=ID,Name_*`).pipe(
        map(page => {
          return [].concat.apply([],
            page.Results.map(item => {
              return langs.map(lang => {
                return `https://beta.ffxivteamcraft.com/db/${lang}/${pageName}/${item.ID}/${item[`Name_${lang}`].split(' ').join('-')}`;
              });
            })
          );
        }),
        bufferCount(firstPage.Pagination.PageTotal),
        first(),
        map(buffered => [].concat.apply([], buffered)),
        switchMap(urls => {
          console.log(urls.length);
          // create a new progress bar instance and use shades_classic theme
          const progress = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
          progress.start(urls.length, 0);
          const index$ = new BehaviorSubject(0);
          const complete$ = new Subject();
          return index$.pipe(
            mergeMap(index => {
              const done$ = new Subject();
              const options = {
                url: urls[index],
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
                }
              };
              request(options, (err) => {
                if (err) {
                  console.error(err);
                }
                done$.next();
              });
              return done$;
            }),
            tap(() => {
              progress.update(index$.value);
              if (urls[index$.value + 1]) {
                index$.next(index$.value + 1);
              } else {
                complete$.next();
                progress.stop();
              }
            }),
            takeUntil(complete$)
          );
        })
      );
    })
  );
}

combineLatest([
  // prepareCache('Item', 'item'),
  // prepareCache('InstanceContent', 'instance'),
  prepareCache('Fate', 'fate')
  // prepareCache('Leve', 'leve'),
  // prepareCache('ENpcResident', 'npc'),
  // prepareCache('BNpcName', 'mob'),
  // prepareCache('Quest', 'quest'),
]).subscribe();
