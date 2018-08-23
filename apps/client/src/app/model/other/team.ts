import { DataModel } from '../../core/database/storage/data-model';

export class Team extends DataModel {

  name: string;

  leader: string;

  // This is a string <=> number map because we need it indexed on userId for easy requests inside firestore.
  // If number is 0, then it's added but not confirmed, 1 is added and confirmed
  members: { [index: string]: number } = {};

  public addMember(userId: string): void {
    this.members[userId] = 0;
  }

  public confirmMember(userId: string): void {
    if (this.members[userId] === 0) {
      this.members[userId] = 1;
    }
  }

  public isConfirmed(userId: string): boolean {
    return this.members[userId] === 1;
  }

  public removeMember(userId: string): void {
    delete this.members[userId];
  }
}
