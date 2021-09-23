// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import { version } from './version';
import { gameEnv } from './game-env';
import { patchNotes } from './patch-notes';

export const environment = {
  production: false,
  version: version,
  patchNotes: patchNotes,
  ssrHost: 'https://beta.ffxivteamcraft.com',
  startTimestamp: Date.now(),
  noAnimations: false,
  ...gameEnv,
  firebase: {
    apiKey: 'AIzaSyDZPSJj-nXHLIATOz3IBESUTFk8zvFaUc0',
    authDomain: 'ffxivteamcraft.firebaseapp.com',
    databaseURL: 'https://ffxivteamcraft.firebaseio.com',
    projectId: 'ffxivteamcraft',
    storageBucket: 'ffxivteamcraft.appspot.com',
    messagingSenderId: '1082504004791',
    appId: '1:1082504004791:web:78e7872c937b2ce56df932'
  }
};

