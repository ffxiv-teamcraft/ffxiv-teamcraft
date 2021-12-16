import { Injectable } from '@angular/core';

let electron = false;
// In a try catch because navigator doesn't exist in server platform.
try {
  electron = navigator && navigator.userAgent.toLowerCase().indexOf('electron/') > -1;
} catch (ignored) {
}
export const IS_ELECTRON = electron;


@Injectable()
export class PlatformService {

  public isDesktop(): boolean {
    return IS_ELECTRON;
  }
}
