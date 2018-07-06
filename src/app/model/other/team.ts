import {DataModel} from '../../core/database/storage/data-model';

export class Team extends DataModel {

    name: string;

    leader: string;

    members: { [index: string]: boolean } = {};
}
