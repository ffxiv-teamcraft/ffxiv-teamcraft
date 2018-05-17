import {Injectable} from '@angular/core';

@Injectable()
export class PlatformService {

    public isDesktop(): boolean {
        return navigator.userAgent.toLowerCase().indexOf('electron/') > -1;
    }
}
