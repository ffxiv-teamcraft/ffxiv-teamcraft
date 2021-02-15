import { Injectable } from '@angular/core';

export const IS_ELECTRON = navigator && navigator.userAgent.toLowerCase().indexOf('electron/') > -1;

@Injectable()
export class PlatformService {

  public isDesktop(): boolean {
    return IS_ELECTRON;
  }
}
