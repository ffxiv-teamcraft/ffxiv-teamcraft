import { Craft } from '../garland-tools/craft';
import { FreeCompanyAction } from '../../pages/simulator/model/free-company-action';
import { ConsumableRow } from '../user/consumable-row';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { GearSet } from '../../pages/simulator/model/gear-set';

export class CraftingRotation extends DataWithPermissions {

  public name: string;

  public recipe: Partial<Craft>;

  public rotation: string[] = [];

  public description: string;

  public defaultItemId?: number;

  public defaultRecipeId?: string;

  public folder?: string;

  public food: ConsumableRow;

  public medicine: ConsumableRow;

  public freeCompanyActions: FreeCompanyAction[] = [];

  public stats: GearSet;

  public custom = false;

  public getName(): string {
    return this.name || `rlvl${this.recipe.rlvl} - ${this.rotation.length} steps, ${this.recipe.durability} dur`;
  }
}
