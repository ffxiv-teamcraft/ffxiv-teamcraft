const request = require('request');
const Rx = require('rxjs');
const { mergeMap, map, tap, takeUntil } = require('rxjs/operators');
const path = require('path');
const fs = require('fs');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');


const get = (url, body) => {
  console.log('--------------------');
  console.log('GET', url);
  console.log('--------------------');
  const res$ = new Rx.Subject();
  if (body !== undefined) {
    request(url, {
      body: body,
      json: true
    }, (err, _, res) => res$.next(res));
  } else {
    request(url, { json: true }, (err, _, res) => res$.next(res));
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

module.exports.getAllPages = (endpoint, body) => {
  const page$ = new Rx.BehaviorSubject(1);
  const complete$ = new Rx.Subject();
  return page$.pipe(
    mergeMap(page => {
      let url = endpoint;
      if (body !== undefined) {
        body.page = page;
      } else {
        url = addQueryParam(endpoint, 'page', page);
      }
      return get(url, body).pipe(
        tap(result => {
          if (result.Pagination.PageNext > page) {
            page$.next(result.Pagination.PageNext);
          } else {
            complete$.next(null);
          }
        })
      );
    }),
    takeUntil(complete$)
  );
};

module.exports.getOnePage = (endpoint) => {
  return get(endpoint);
};

module.exports.persistToJson = (fileName, content) => fs.writeFileSync(path.join(outputFolder, `${fileName}.json`), JSON.stringify(content, null, 2));
module.exports.persistToTypescript = (fileName, variableName, content) => {
  const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
  fs.writeFileSync(path.join(outputFolder, `${fileName}.ts`), ts);
};
