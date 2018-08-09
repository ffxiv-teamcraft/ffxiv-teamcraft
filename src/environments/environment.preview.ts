// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list-details of which env maps to which file can be found in `.angular-cli.json`.

import {version} from './version';

export const environment = {
    production: false,
    version: version,
    firebase: {
        apiKey: 'AIzaSyCN_bCiwZ6cd619dqJUGkQnEFbhQJdJynY',
        authDomain: 'ffxiv-teamcraft-5-0-preview.firebaseapp.com',
        databaseURL: 'https://ffxiv-teamcraft-5-0-preview.firebaseio.com',
        projectId: 'ffxiv-teamcraft-5-0-preview',
        storageBucket: 'ffxiv-teamcraft-5-0-preview.appspot.com',
        messagingSenderId: '884443665612'
    }
};
