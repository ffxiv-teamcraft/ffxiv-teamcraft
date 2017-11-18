import {DataModel} from './data-model';

export class AppUser extends DataModel {
    name?: string;
    email: string;
    masterbooks?: number[];
    lodestoneId?: number;
    avatar?: string;
    favorites?: string[];
    patron?: boolean;
    anonymous?: boolean;
}
