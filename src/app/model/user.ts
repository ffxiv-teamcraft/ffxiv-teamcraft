import {List} from './list';
export interface User {
    name: string;
    lists: { [key: string]: List };
    email: string;
}
