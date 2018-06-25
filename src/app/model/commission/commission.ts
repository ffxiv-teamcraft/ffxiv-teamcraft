import {List} from '../list/list';
import {CommissionStatus} from './commission-status';
import {CommissionDiscussion} from './commission-discussion';
import {DataModel} from '../../core/database/storage/data-model';
import {DeserializeAs} from '@kaiu/serializer';

export class Commission extends DataModel {
    /**
     * The list requested.
     */
    @DeserializeAs(List)
    list: List;

    /**
     * The id of the request's author.
     */
    authorId: string;

    /**
     * The name of the server for the request.
     */
    server: string;

    /**
     * The discussions of the request, one per crafter.
     */
    @DeserializeAs([CommissionDiscussion])
    discussions: CommissionDiscussion[] = [];

    /**
     * The date of the commissio creation.
     * @type {string}
     */
    createdAt: string = new Date().toISOString();

    /**
     * The status of the request.
     */
    status: CommissionStatus = CommissionStatus.CREATED;

    /**
     * The id of the crafter who's crafting the request, can be undefined if status is CREATED.
     */
    crafterId?: string;

    public isGathering(): boolean {
        return this.list.recipes.find(item => item.gatheredBy !== undefined) !== undefined;
    }

    public isCrafting(): boolean {
        return this.list.recipes.find(item => item.craftedBy !== undefined) !== undefined;
    }

    public isHunting(): boolean {
        return this.list.recipes.find(item => item.drops !== undefined) !== undefined;
    }
}
