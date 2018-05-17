import {DataModel} from '../storage/data-model';

export class CustomLink extends DataModel {
    template = false;
    authorNickname: string;
    uri: string;
    redirectTo: string;
    author: string;

    getType(): string {
        return this.redirectTo.split('/')[0];
    }

    getUrl(): string {
        // If we're inside Electron, create a direct Teamcraft link.
        if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
            return `https://ffxivteamcraft.com/link/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
        } else {
            return `${window.location.protocol}//${window.location.host}/link/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
        }
    }
}
