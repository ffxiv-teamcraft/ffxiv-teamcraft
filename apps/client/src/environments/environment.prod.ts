import { version } from './version';
import { gameEnv } from './game-env';

export const environment = {
  production: true,
  version: version,
  ssrHost: 'https://ffxivteamcraft.com',
  startTimestamp: Date.now(),
  ...gameEnv,
  firebase: {
    apiKey: 'AIzaSyDZPSJj-nXHLIATOz3IBESUTFk8zvFaUc0',
    authDomain: 'ffxivteamcraft.firebaseapp.com',
    databaseURL: 'https://ffxivteamcraft.firebaseio.com',
    projectId: 'ffxivteamcraft',
    storageBucket: 'ffxivteamcraft.appspot.com',
    messagingSenderId: '1082504004791'
  }
};
