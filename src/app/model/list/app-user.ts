import {List} from './list';

export interface AppUser {
    name: string;
    lists: { [key: string]: List };
    email: string;
    lodestoneId: number;
    avatar?: string;
    favorites: string[];
    patron?: boolean;
}
