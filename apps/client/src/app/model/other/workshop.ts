import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import firebase from 'firebase/compat/app';

export class Workshop extends DataWithPermissions {
  name: string;

  listIds: string[] = [];

  createdAt: firebase.firestore.Timestamp = firebase.firestore.Timestamp.now();

  index = -1;

  afterDeserialized(): void {
    if (typeof this.createdAt !== 'object') {
      this.createdAt = firebase.firestore.Timestamp.fromDate(new Date(this.createdAt));
    }
  }
}
