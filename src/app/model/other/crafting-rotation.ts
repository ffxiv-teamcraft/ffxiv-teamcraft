import {DataModel} from '../../core/database/storage/data-model';
import {Craft} from '../garland-tools/craft';
import {SavedConsumables} from './saved-consumables';
import {DeserializeAs} from '@kaiu/serializer';

export class CraftingRotation extends DataModel {

    public name: string;

    public recipe: Partial<Craft>;

    public rotation: string[] = [];

    public authorId: string;

    public description: string;

    public defaultItemId?: number;

    public defaultRecipeId?: number;

    public folder?: string;

    @DeserializeAs(SavedConsumables)
    public consumables: SavedConsumables = new SavedConsumables();

    public getName(): string {
        return this.name || `rlvl${this.recipe.rlvl} - ${this.rotation.length} steps, ${this.recipe.durability} dur`;
    }
}
