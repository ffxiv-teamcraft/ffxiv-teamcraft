import {List} from '../list/list';
import {CommissionMessage} from './commission-message';
import {CommissionStatus} from './commission-status';

export class CommissionRequest {
    /**
     * The list requested.
     */
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
     * The discussion of the request.
     */
    discussion: CommissionMessage[] = [];


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
