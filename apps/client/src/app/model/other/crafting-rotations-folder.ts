import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';

import { Timestamp } from '@angular/fire/firestore';

export class CraftingRotationsFolder extends DataWithPermissions {
  name: string;

  originalAuthorId: string;

  rotationIds: string[] = [];

  createdAt = Timestamp.now();

  index = -1;

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = Timestamp.fromDate(new Date(this.createdAt));
    } else if (!(this.createdAt instanceof Timestamp)) {
      this.createdAt = new Timestamp((this.createdAt as any).seconds, Math.min(Math.max((this.createdAt as any).nanoseconds, 0), 1792000000));
    }
  }
}
