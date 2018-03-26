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
        return `${window.location.protocol}//${window.location.host}/link/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    }
}
