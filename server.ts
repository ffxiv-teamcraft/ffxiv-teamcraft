// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import * as path from 'path';
import { join } from 'path';
import { readFileSync } from 'fs';
import { REQUEST } from '@nguniversal/express-engine/tokens';

const DIST_FOLDER = path.join(process.cwd(), 'dist/apps');
const APP_NAME = 'client';


//Garland tools data skeleton
(global as any).gt = {
  patch: {},
  xp: [],
  jobs: [],
  node: {},
  fishing: {},
  mob: {},
  location: {},
  skywatcher: {},
  quest: {},
  venture: {},
  npc: {},
  action: {},
  leve: {},
  achievement: {},
  instance: {},
  fate: {},
  item: {
    index: []
  },
  bell: {
    nodes: [],
    fish: []
  }
};

require('./ssr/output/gt-fish');
require('./ssr/output/gt-nodes');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// index.html template
const template = readFileSync(path.join(DIST_FOLDER, APP_NAME, 'index.html')).toString();

const win = new JSDOM(template).window;

(global as any).XMLHttpRequest = win.XMLHttpRequest;
(global as any).WebSocket = win.WebSocket;
(global as any).window = win;
(global as any).DOMTokenList = win.DOMTokenList;
(global as any).Node = win.Node;
(global as any).Text = win.Text;
(global as any).HTMLElement = win.HTMLElement;
(global as any).HTMLAnchorElement = win.HTMLAnchorElement;
(global as any).URLSearchParams = win.URLSearchParams;
(global as any).navigator = win.navigator;
(global as any).Event = win.Event;
(global as any).gtag = () => null;
Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});
(global as any).document = win.document;

//Mock localStorage
const fakeStorage: Storage = {
  length: 0,
  clear: () => {
  },
  getItem: (_key: string) => null,
  key: (_index: number) => null,
  removeItem: (_key: string) => {
  },
  setItem: (_key: string, _data: string) => {
  }
};

(global as any)['localStorage'] = fakeStorage;

// Faster renders in prod mode
//enableProdMode();

if (global.v8debug) {
  global.v8debug.Debug.setBreakOnException(); // speaks for itself
}

// Export our express server
export const app = express();

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(`./dist/${APP_NAME}-server/main`);

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, APP_NAME));

// Serve static files
app.get('*.*', express.static(join(DIST_FOLDER, APP_NAME)));

const beforeRender = (req, res, next) => {
  //Get the client lang from the request
  req.lang = req.headers['accept-language'] || 'en';

  next();
};


// All regular routes use the Universal engine
app.get('*', beforeRender, (req, res) => {
  res.render(join(DIST_FOLDER, APP_NAME, 'index.html'), {
    req,
    providers: [
      { provide: REQUEST, useValue: req }
    ]
  });
});

// If we're not in the Cloud Functions environment, spin up a Node server
if (!process.env.FUNCTION_NAME) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
  });
}
