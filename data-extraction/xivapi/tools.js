const request = require('request');
const Rx = require('rxjs');
const { mergeMap, switchMap, delay, map, tap, takeUntil, skip } = require('rxjs/operators');
const path = require('path');
const fs = require('fs');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');
const assetOutputFolder = path.join(__dirname, '../../apps/client/src/assets/data/');


const get = (url, body) => {
  console.log('GET', url);
  const res$ = new Rx.Subject();
  if (body !== undefined) {
    request(url, {
      body: body,
      json: true
    }, (err, _, res) => res$.next(res));
  } else {
    request(url, { json: true }, (err, _, res) => {
      if (err) {
        console.error(err);
      }
      res$.next(res);
    });
  }
  return res$;
};

function addQueryParam(url, paramName, paramValue) {
  if (url.indexOf('?') > -1) {
    return `${url}&${paramName}=${paramValue}`;
  } else {
    return `${url}?${paramName}=${paramValue}`;
  }
}

const getAllPages = (endpoint, body) => {
  console.log(`FETCHING ${endpoint}`);
  const page$ = new Rx.BehaviorSubject(1);
  const complete$ = new Rx.Subject();
  return page$.pipe(
    delay(100),
    mergeMap(page => {
      let url = endpoint;
      if (body !== undefined) {
        body.page = page;
      } else {
        url = addQueryParam(endpoint, 'page', page);
      }
      return get(url, body).pipe(
        tap(result => {
          if (result === undefined) {
            console.log('undefined result', url);
          }
          console.log(`${url} : ${result.Pagination.Page}/${result.Pagination.PageTotal}`);
          if (result.Pagination.PageNext > page) {
            page$.next(result.Pagination.PageNext);
          } else {
            setTimeout(() => {
              complete$.next(null);
            }, 250);
          }
        })
      );
    }),
    takeUntil(complete$)
  );
};

module.exports.getAllEntries = (endpoint, key, startsAt0) => {
  console.log(`CRAWLING ${endpoint}`);
  const allIds = startsAt0 ? ['0'] : [];
  const index$ = new Rx.Subject();
  getAllPages(addQueryParam(addQueryParam(endpoint, 'key', key), 'columns', 'ID')).subscribe(page => {
    allIds.push(...page.Results.map(res => res.ID));
  }, null, () => {
    index$.next(0);
  });
  const completeFetch = [];
  return index$.pipe(
    switchMap(index => {
      return get(addQueryParam(`${endpoint}/${allIds[index]}`, 'key', key)).pipe(
        tap(result => {
          completeFetch.push(result);
          if (allIds[index + 1] !== undefined) {
            index$.next(index + 1);
            console.log(`${endpoint} : ${index}/${allIds.length}`);
          }
        })
      );
    }),
    skip(allIds.length - 1),
    map(() => completeFetch)
  );
};

module.exports.getOnePage = (endpoint) => {
  return get(endpoint);
};

module.exports.addQueryParam = (url, paramName, paramValue) => addQueryParam(url, paramName, paramValue);
module.exports.get = (endpoint) => get(endpoint);

module.exports.persistToJson = (fileName, content) => fs.writeFileSync(path.join(outputFolder, `${fileName}.json`), JSON.stringify(content, null, 2));
module.exports.persistToJsonAsset = (fileName, content) => fs.writeFileSync(path.join(assetOutputFolder, `${fileName}.json`), JSON.stringify(content));
module.exports.persistToTypescript = (fileName, variableName, content) => {
  const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
  fs.writeFileSync(path.join(outputFolder, `${fileName}.ts`), ts);
};

module.exports.getAllPages = getAllPages;

