import {DataModel} from '../../core/database/storage/data-model';

export class CraftingRotation extends DataModel {

    public rotation: string[];

    public authorId: string;

    // TODO Food

    public description: string;
}
