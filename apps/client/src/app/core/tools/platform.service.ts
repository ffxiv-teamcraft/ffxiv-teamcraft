import { Injectable } from '@angular/core';

function isConstructor(f: any) {
  try {
    const a = new f();
  } catch (err) {
    // verify err is the expected error and then
    return false;
  }
  return true;
}

export const IS_ELECTRON = navigator && navigator.userAgent.toLowerCase().indexOf('electron/') > -1;

@Injectable()
export class PlatformService {

  public isDesktop(): boolean {
    return IS_ELECTRON;
  }
}
