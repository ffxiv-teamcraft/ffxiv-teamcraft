import {DataModel} from '../../core/database/storage/data-model';

export class ResourceComment extends DataModel {
    authorId = -1;
    content: string;
    date: string;
}
