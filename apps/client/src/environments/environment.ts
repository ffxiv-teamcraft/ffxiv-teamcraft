// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import { version } from './version';

export const environment = {
  production: false,
  version: version,
  ssrHost: 'https://ffxivteamcraft.com',
  startTimestamp: Date.now(),
  firebase: {
    apiKey: 'AIzaSyDZPSJj-nXHLIATOz3IBESUTFk8zvFaUc0',
    authDomain: 'ffxivteamcraft.firebaseapp.com',
    databaseURL: 'https://ffxivteamcraft.firebaseio.com',
    projectId: 'ffxivteamcraft',
    storageBucket: 'ffxivteamcraft.appspot.com',
    messagingSenderId: '1082504004791'
  }
};

