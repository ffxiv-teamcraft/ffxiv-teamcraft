import {DataModel} from './data-model';

export class AppUser extends DataModel {
    name?: string;
    email: string;
    lodestoneId?: number;
    avatar?: string;
    favorites?: string[];
    patron?: boolean;
    anonymous?: boolean;
}
