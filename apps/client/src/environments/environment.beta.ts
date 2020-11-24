import { version } from './version';
import { gameEnv } from './game-env';
import { patchNotes } from './patch-notes';

export const environment = {
  production: false,
  version: version,
  patchNotes: patchNotes,
  ssrHost: 'https://beta.ffxivteamcraft.com',
  startTimestamp: Date.now(),
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
