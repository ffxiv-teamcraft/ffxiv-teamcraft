// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import { version } from './version';
import { gameEnv } from './game-env';
import { patchNotes } from './patch-notes';

export const environment = {
  production: false,
  beta: false,
  useLocalAPI: false, // Should we use localhost:333 as API for search?
  version: version,
  patchNotes: patchNotes,
  ssrHost: 'https://beta.ffxivteamcraft.com',
  startTimestamp: Date.now(),
  noAnimations: false,
  verboseOperations: false,
  breakpointDebug: false,
  ...gameEnv,
  firebase: {
    apiKey: 'AIzaSyCkrNPf7XlyuxQeqNtynvDFDnQ-XigG3WA',
    authDomain: 'ffxiv-teamcraft-beta.firebaseapp.com',
    databaseURL: 'https://ffxiv-teamcraft-beta.firebaseio.com',
    projectId: 'ffxiv-teamcraft-beta',
    storageBucket: 'ffxiv-teamcraft-beta.appspot.com',
    messagingSenderId: '716469847404',
    appId: '1:716469847404:web:d1716789557f9cca5e1f49'
  }
};

