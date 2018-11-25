import { DataModel } from '../../core/database/storage/data-model';
import { Craft } from '../garland-tools/craft';
import { FreeCompanyAction } from '../../pages/simulator/model/free-company-action';
import { ConsumableRow } from '../user/consumable-row';

export class CraftingRotation extends DataModel {

  public name: string;

  public recipe: Partial<Craft>;

  public rotation: string[] = [];

  public authorId: string;

  public description: string;

  public defaultItemId?: number;

  public defaultRecipeId?: number;

  public folder?: string;

  public food: ConsumableRow;

  public medicine: ConsumableRow;

  public freeCompanyActions: FreeCompanyAction[];

  public getName(): string {
    return this.name || `rlvl${this.recipe.rlvl} - ${this.rotation.length} steps, ${this.recipe.durability} dur`;
  }
}
