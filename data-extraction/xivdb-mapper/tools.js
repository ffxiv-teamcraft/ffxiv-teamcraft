const request = require('request');
const Rx = require('rxjs');
const { mergeMap, map, tap, takeUntil } = require('rxjs/operators');
const path = require('path');
const fs = require('fs');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');


const get = (url) =>  {
  const res$ = new Rx.Subject();
  request(url, (err, _, res) => res$.next(res));
  return res$.pipe(
    map(res => JSON.parse(res))
  );
};

function addQueryParam(url, paramName, paramValue) {
  if (url.indexOf('?') > -1) {
    return `${url}&${paramName}=${paramValue}`;
  } else {
    return `${url}?${paramName}=${paramValue}`;
  }
}

module.exports.getAllPages = (endpoint) => {
  const page$ = new Rx.BehaviorSubject(1);
  const complete$ = new Rx.Subject();
  return page$.pipe(
    mergeMap(page => {
      return get(addQueryParam(endpoint, 'page', page)).pipe(
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

module.exports.persistToJson = (fileName, content) => fs.writeFileSync(path.join(outputFolder, `${fileName}.json`), JSON.stringify(content, null, 2));
module.exports.persistToTypescript = (fileName, variableName, content) => {
  const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
  fs.writeFileSync(path.join(outputFolder, `${fileName}.ts`), ts);
};
