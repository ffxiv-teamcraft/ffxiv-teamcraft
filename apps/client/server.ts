import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { enableProdMode } from '@angular/core';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync, readFileSync } from 'fs';

export const DIST_FOLDER = join(process.cwd(), 'dist/apps');
export const APP_NAME = 'client';

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


require('../../ssr/output/gt-fish');
require('../../ssr/output/gt-nodes');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Polyfills required for Firebase
(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');

// Faster renders in prod mode
enableProdMode();

// index.html template
const template = readFileSync(join(DIST_FOLDER, APP_NAME, 'index.html')).toString();

const win = new JSDOM(template).window;

(global as any).XMLHttpRequest = win.XMLHttpRequest;
(global as any).WebSocket = win.WebSocket;
(global as any).window = win;
(global as any).window.gt = (global as any).gt;
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

function detectIndexBot(userAgent) {

  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'googlebot',
    'slurp',

    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of bots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      console.log('index bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found', agent);
  return false;

}

function detectDeepLinkBot(userAgent) {
  const deepLinkBots = [
    'twitterbot',
    'slackbot',
    'Discordbot'
  ];

  const agent = userAgent.toLowerCase();

  for (const bot of deepLinkBots) {
    if (agent.indexOf(bot.toLowerCase()) > -1) {
      console.log('deep link bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found', agent);
  return false;

}

const indexAllowedPages = ['/search', '/community-rotations', '/levequests', '/about', '/support-us', '/desynth-guide', '/gc-supply', '/macro-translator', '/db/'];

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/apps/client');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  server.get('*', (req, res) => {
    try {
      const noSEO = req.headers.host.indexOf('beta.') > -1 || req.headers.host.indexOf('preview.') > -1;
      const isIndexBot = detectIndexBot(req.headers['user-agent']);
      const isDeepLinkBot = detectDeepLinkBot(req.headers['user-agent']);
      const langFromUrl = /\/db\/(\w{2})\//.exec(req.url);
      (req as any).lang = (langFromUrl && langFromUrl[1]) || req.headers['accept-language'] || 'en';

      if (isDeepLinkBot || (!noSEO && isIndexBot && indexAllowedPages.some(page => req.originalUrl.indexOf(page) > -1))) {
        res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
      } else {
        res.sendFile(join(DIST_FOLDER, APP_NAME, 'index.html'));
      }
    } catch (err) {
      // Ignored, as it's inside SSR
    }
  });

// If we're not in the Cloud Functions environment, spin up a Node server
  if (!process.env.FUNCTION_NAME) {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Node server listening on http://localhost:${PORT}`);
    });
  }

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
