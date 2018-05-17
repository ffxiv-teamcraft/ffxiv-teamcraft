import {CustomLink} from '../custom-links/custom-link';

export class ListTemplate extends CustomLink {
    public readonly template = true;

    public originalListId: string;

    getType(): string {
        return 'template';
    }

    getUrl(): string {
        return `${window.location.protocol}//${window.location.host}/template/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    }
}
