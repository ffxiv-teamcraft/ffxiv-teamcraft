import {DataModel} from '../../core/database/storage/data-model';
import {Craft} from '../garland-tools/craft';

export class CraftingRotation extends DataModel {

    name: string;

    public recipe: Partial<Craft>;

    public rotation: string[];

    public authorId: string;

    public description: string;

    public defaultItemId?: number;

    public getName(): string {
        return `rlvl${this.recipe.rlvl} - ${this.rotation.length} steps`;
    }
}
