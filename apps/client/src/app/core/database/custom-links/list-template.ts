import { CustomLink } from './custom-link';

export class ListTemplate extends CustomLink {
  public readonly type = 'template';

  public originalListId: string;

  getType(): string {
    return 'template';
  }

  getUrl = () => {
    // If we're inside Electron, create a direct Teamcraft link.
    if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
      return `https://ffxivteamcraft.com/template/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    } else {
      return `${window.location.protocol}//${window.location.host}/template/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    }
  };

  getEntityId(): string {
    return this.originalListId;
  }
}
