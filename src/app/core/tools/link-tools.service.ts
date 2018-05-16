import {Injectable} from '@angular/core';

@Injectable()
export class LinkToolsService {

    public getLink(target: string): string {
        // If we're inside Electron, create a direct Teamcraft link.
        if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
            return `https://ffxivteamcraft.com/${target}`;
        } else {
            return `${window.location.protocol}//${window.location.host}/${target}`;
        }
    }

}
