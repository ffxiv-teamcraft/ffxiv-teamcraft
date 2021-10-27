import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import firebase from 'firebase/compat/app';

export class CraftingRotationsFolder extends DataWithPermissions {
  name: string;
  originalAuthorId: string;
  rotationIds: string[] = [];
  createdAt = firebase.firestore.Timestamp.now();
  index = -1;

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = firebase.firestore.Timestamp.fromDate(new Date(this.createdAt));
    } else if (!(this.createdAt instanceof firebase.firestore.Timestamp)) {
      this.createdAt = new firebase.firestore.Timestamp((this.createdAt as any).seconds, (this.createdAt as any).nanoseconds);
    }
  }
}
