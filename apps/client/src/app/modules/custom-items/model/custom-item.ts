import { ListRow } from '../../list/model/list-row';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { Timestamp } from '@angular/fire/firestore';

export class CustomItem extends ListRow {

  /**
   * The id of the real item if it's known.
   */
  realItemId?: number;

  @ForeignKey(TeamcraftUser)
  authorId: string;

  name: string;

  custom = true;

  index = -1;

  // Mainly used for display, in order to remove an item from its folder on drag out.
  folderId?: string;

  // Used for display too
  dirty?: boolean;

  createdAt: Timestamp = Timestamp.now();

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = Timestamp.fromDate(new Date(this.createdAt));
    } else if (!(this.createdAt instanceof Timestamp)) {
      this.createdAt = new Timestamp((this.createdAt as any).seconds, (this.createdAt as any).nanoseconds);
    }
  }
}
