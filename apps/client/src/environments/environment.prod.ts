import { version } from './version';
import { gameEnv } from './game-env';
import { patchNotes } from './patch-notes';

export const environment = {
  production: true,
  beta: false,
  useLocalAPI: false, // Should we use localhost:333 as API for search?
  version: version,
  patchNotes: patchNotes,
  ssrHost: 'https://ffxivteamcraft.com',
  startTimestamp: Date.now(),
  noAnimations: false,
  verboseOperations: false,
  breakpointDebug: false,
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
