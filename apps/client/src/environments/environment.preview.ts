// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import { version } from './version';

export const environment = {
  production: false,
  version: version,
  startTimestamp: Date.now(),
  maxLevel: 80,
  firebase: {
    apiKey: 'AIzaSyAfpbw5Di3dJ3DHnkFpEh3Xea2JXfx5BTs',
    authDomain: 'ffxiv-teamcraft-canary.firebaseapp.com',
    databaseURL: 'https://ffxiv-teamcraft-canary.firebaseio.com',
    projectId: 'ffxiv-teamcraft-canary',
    storageBucket: 'ffxiv-teamcraft-canary.appspot.com',
    messagingSenderId: '30451608272'
  }
};
