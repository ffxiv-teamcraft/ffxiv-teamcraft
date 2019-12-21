// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import { version } from './version';

export const environment = {
  production: false,
  version: version,
  ssrHost: 'https://beta.ffxivteamcraft.com',
  startTimestamp: Date.now(),
  firebase: {
    apiKey: 'AIzaSyCkrNPf7XlyuxQeqNtynvDFDnQ-XigG3WA',
    authDomain: 'ffxiv-teamcraft-beta.firebaseapp.com',
    databaseURL: 'https://ffxiv-teamcraft-beta.firebaseio.com',
    projectId: 'ffxiv-teamcraft-beta',
    storageBucket: 'ffxiv-teamcraft-beta.appspot.com',
    messagingSenderId: '716469847404'
  }
};

