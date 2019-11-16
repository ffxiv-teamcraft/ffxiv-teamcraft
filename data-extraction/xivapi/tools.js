const request = require('request');
const { BehaviorSubject, Subject, interval } = require('rxjs');
const { shareReplay, mergeMap, switchMap, map, tap, takeUntil, skip, filter, debounceTime, distinctUntilChanged } = require('rxjs/operators');
const path = require('path');
const fs = require('fs');
const Multiprogress = require('multi-progress');
const multi = new Multiprogress(process.stdout);

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');
const assetOutputFolder = path.join(__dirname, '../../apps/client/src/assets/data/');

const queue = [];

const emptyQueue$ = new Subject();

const stopInterval$ = emptyQueue$.pipe(
  distinctUntilChanged(),
  debounceTime(30000),
  filter(empty => empty)
);

interval(250).pipe(
  tap(() => {
    emptyQueue$.next(queue.length === 0);
  }),
  filter(() => {
    return queue.length > 0;
  }),
  takeUntil(stopInterval$)
).subscribe(() => {
  const operation = queue.pop();
  if (operation.body !== undefined) {
    request(operation.url, {
      body: operation.body,
      json: true
    }, (err, _, res) => {
      if (err || res === '404 not found.') {
        if (err) {
          console.error(err);
        }
        operation.res$.next(null);
        operation.res$.complete();
      } else {
        operation.res$.next(res);
        operation.res$.complete();
      }
    });
  } else {
    request(operation.url, { json: true }, (err, _, res) => {
      if (err || res === '404 not found.') {
        if (err) {
          console.error(err);
        }
        operation.res$.next(null);
        operation.res$.complete();
      } else {
        operation.res$.next(res);
        operation.res$.complete();
      }
    });
  }
});

const get = (url, body) => {
  const res$ = new Subject();
  queue.push({
    url: url,
    body: body,
    res$: res$
  });
  return res$;
};

function addQueryParam(url, paramName, paramValue) {
  if (url.indexOf('?') > -1) {
    return `${url}&${paramName}=${paramValue}`;
  } else {
    return `${url}?${paramName}=${paramValue}`;
  }
}

const getAllPages = (endpoint, body, label) => {
  let progress;
  const page$ = new BehaviorSubject(1);
  const complete$ = new Subject();
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
          if (result === undefined || result.Pagination === undefined) {
            console.error('Error', url);
            console.error(result);
          }
          if (progress === undefined) {
            if (label === undefined) {
              label = `${endpoint.substring(0, 120)}${endpoint.length > 120 ? '...' : ''}`;
            }
            progress = multi.newBar(`[:bar] :current/:total :etas - ${label}`, {
              complete: '=',
              incomplete: ' ',
              width: 50,
              total: result.Pagination.PageTotal
            });
          }
          progress.tick();
          if (result.Pagination.PageNext > page) {
            page$.next(result.Pagination.PageNext);
          } else {
            setTimeout(() => {
              complete$.next(null);
              page$.complete();
            }, 250);
          }
        })
      );
    }),
    takeUntil(complete$)
  );
};

const aggregateAllPages = (endpoint, body, label) => {
  const data = [];
  const res$ = new Subject();
  getAllPages(endpoint, body, label).subscribe(page => {
    data.push(...page.Results);
  },() => {},() => {
    res$.next(data);
    res$.complete();
  });
  return res$;
};


module.exports.getAllEntries = (endpoint, key, startsAt0) => {
  let progress;
  const allIds = startsAt0 ? ['0'] : [];
  const index$ = new Subject();
  getAllPages(addQueryParam(endpoint, 'columns', 'ID')).subscribe(page => {
    allIds.push(...page.Results.map(res => res.ID));
  }, null, () => {
    index$.next(0);
  });
  const completeFetch = [];
  return index$.pipe(
    switchMap(index => {
      return get(addQueryParam(`${endpoint}/${allIds[index]}`, 'key', key)).pipe(
        tap(result => {
          if (progress === undefined) {
            progress = multi.newBar(`[:bar] :current/:total :etas - ${endpoint.substring(0, 120)}${endpoint.length > 120 ? '...' : ''}`, {
              complete: '=',
              incomplete: ' ',
              width: 50,
              total: allIds.length
            });
          }
          progress.tick();
          completeFetch.push(result);
          if (allIds[index + 1] !== undefined) {
            index$.next(index + 1);
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
module.exports.persistToJsonAsset = (fileName, content) => fs.writeFileSync(path.join(assetOutputFolder, `${fileName}.json`), JSON.stringify(content, null, 2));
module.exports.persistToTypescript = (fileName, variableName, content) => {
  const ts = `export const ${variableName} = ${JSON.stringify(content, null, 2)};`;
  fs.writeFileSync(path.join(outputFolder, `${fileName}.ts`), ts);
};

module.exports.getAllPages = getAllPages;
module.exports.aggregateAllPages = aggregateAllPages;

