import {DataModel} from '../../core/database/storage/data-model';

export class Team extends DataModel {

    name: string;

    leader: string;

    // This is a string <=> boolean map because we need it indexed on userId for easy requests inside firestore.
    members: { [index: string]: boolean } = {};

    public addMember(userId: string): void {
        this.members[userId] = true;
    }

    public removeMember(userId: string): void {
        delete this.members[userId];
    }
}
