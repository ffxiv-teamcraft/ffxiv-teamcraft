const request = require('request');
const { BehaviorSubject, Subject, interval } = require('rxjs');
const { mergeMap, switchMap, map, tap, takeUntil, skip, filter, debounceTime, distinctUntilChanged, of } = require('rxjs/operators');
const path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');

const outputFolder = path.join(__dirname, '../../apps/client/src/app/core/data/sources/');
const assetOutputFolder = path.join(__dirname, '../../apps/client/src/assets/data/');

const multibar = new cliProgress.MultiBar({
  format: ' {bar} | {label} | {eta}s | {value}/{total}',
  hideCursor: true,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  clearOnComplete: false,
  stopOnComplete: false
}, cliProgress.Presets.shades_grey);

const barsRegistry = {};

function updateProgress(name, max) {
  if (barsRegistry[name] === undefined) {
    barsRegistry[name] = multibar.create(max, 0, { label: name });
  }
  if (barsRegistry[name].getTotal() < max) {
    barsRegistry[name].setTotal(max + barsRegistry[name].getTotal());
  }
  barsRegistry[name].increment();
}

const queue = [];

const emptyQueue$ = new Subject();

const key = process.env.XIVAPI_KEY;

const stopInterval$ = emptyQueue$.pipe(
  distinctUntilChanged(),
  debounceTime(30000),
  filter(empty => empty),
  tap(() => {
    Object.values(barsRegistry).forEach(bar => bar.stop());
    console.log('All done !');
  })
);

interval(key ? 50 : 250).pipe(
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
    url: key ? addQueryParam(url, 'private_key', key) : url,
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
  const page$ = new BehaviorSubject(1);
  const complete$ = new Subject();
  return page$.pipe(
    mergeMap(page => {
      let url = endpoint;
      if (body) {
        body.page = page;
      } else {
        url = addQueryParam(endpoint, 'page', page);
      }
      return get(url, body).pipe(
        tap(result => {
          if (result === undefined || result.Pagination === undefined) {
            console.error('Payload error, retrying...');
            page$.next(page);
          }
          if (label === undefined) {
            label = `${endpoint.replace('https://xivapi.com/', '').substring(0, 120)}${endpoint.length > 120 ? '...' : ''}`;
          }
          updateProgress(label, result.Pagination.PageTotal);
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
  }, () => {
  }, () => {
    res$.next(data);
    res$.complete();
  });
  return res$;
};


module.exports.getAllEntries = (endpoint, startsAt0, label) => {
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
      return get(`${endpoint}/${allIds[index]}`).pipe(
        tap(result => {
          if (label === undefined) {
            label = `${endpoint.replace('https://xivapi.com/', '').substring(0, 120)}${endpoint.length > 120 ? '...' : ''}`;
          }
          updateProgress(label, allIds.length);
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

module.exports.gubalRequest = (gql) => {
  const res$ = new Subject();
  if (process.env.HASURA_SECRET === undefined) {
    console.error(`Missing hasura secret, skipping request`);
    return res$;
  }
  request.post({
    url: 'http://35.236.87.103/v1/graphql',
    json: true,
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': process.env.HASURA_SECRET
    },
    body: {
      query: gql
    }
  }, (err, _, res) => {
    if (err) {
      console.error(err);
    } else {
      res$.next(res);
    }
  });
  return res$;
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

