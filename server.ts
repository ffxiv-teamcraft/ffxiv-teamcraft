// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

// Polyfills required for Firebase
(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');
(global as any).Event = null;

const domino = require('domino');

const window = domino.createWindow('<h1>Hello world</h1>', 'http://example.com');
const document = window.document;
(global as any).window = window;
(global as any).document = document;
(global as any).DOMTokenList = window.DOMTokenList;
(global as any).Node = window.Node;
(global as any).Text = window.Text;
(global as any).HTMLElement = window.HTMLElement;
(global as any).HTMLAnchorElement = window.HTMLAnchorElement;
(global as any).navigator = window.navigator;

Object.defineProperty(window.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

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
enableProdMode();

// Export our express server
export const app = express();

const DIST_FOLDER = join(process.cwd(), 'dist/apps');
const APP_NAME = 'client';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require(`./dist/${APP_NAME}-server/main`);

// index.html template
const template = readFileSync(join(DIST_FOLDER, APP_NAME, 'index.html')).toString();

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

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render(join(DIST_FOLDER, APP_NAME, 'index.html'), { req });
});

// If we're not in the Cloud Functions environment, spin up a Node server
if (!process.env.FUNCTION_NAME) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
  });
}
