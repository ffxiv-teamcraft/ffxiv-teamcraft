import { Injectable } from '@angular/core';

export const IS_ELECTRON = navigator && navigator.userAgent.toLowerCase().indexOf('electron/') > -1;
export const IS_PRERENDER = new URLSearchParams(window.location.search).has('prerender');

@Injectable()
export class PlatformService {

  public isDesktop(): boolean {
    return IS_ELECTRON;
  }
}
