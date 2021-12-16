import { DataModel } from '../storage/data-model';
import { ForeignKey } from '../relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { Parent } from '@kaiu/serializer';

@Parent({
  discriminatorField: 'type',
  allowSelf: true
})
export class CustomLink extends DataModel {
  type = 'link';

  authorNickname: string;

  uri: string;

  redirectTo: string;

  @ForeignKey(TeamcraftUser)
  authorId: string;

  getType(): string {
    const type = this.redirectTo.split('/')[0];
    if (type === 'simulator') {
      return 'rotation';
    }
    return type;
  }

  getUrl = () => {
    // If we're inside Electron, create a direct Teamcraft link.
    if (navigator.userAgent.toLowerCase().indexOf('electron/') > -1) {
      return `https://ffxivteamcraft.com/link/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    } else {
      return `${window.location.protocol}//${window.location.host}/link/${encodeURI(this.authorNickname)}/${encodeURI(this.uri)}`;
    }
  };

  getEntityId(): string {
    const exploded = this.redirectTo.split('/');
    return exploded[exploded.length - 1];
  }
}
