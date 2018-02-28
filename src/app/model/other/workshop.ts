import {DataModel} from '../../core/database/storage/data-model';

export class Workshop extends DataModel {
    name: string;
    authorId?: string;
    fcId?: string;
    listIds: string[] = [];
    createdAt = new Date().toISOString();
}
