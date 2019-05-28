import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/messaging';
import 'firebase/functions';

if (environment.production) {
  enableProdMode();
}

export { AppServerModule } from './app/app.server.module';
