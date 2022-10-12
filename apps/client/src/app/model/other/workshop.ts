import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { Timestamp } from '@angular/fire/firestore';

export class Workshop extends DataWithPermissions {
  name: string;

  listIds: string[] = [];

  createdAt: Timestamp = Timestamp.now();

  index = -1;

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = Timestamp.fromDate(new Date(this.createdAt));
    }
  }
}
