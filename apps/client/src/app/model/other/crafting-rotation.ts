import { Craft } from '../garland-tools/craft';
import { ConsumableRow } from '../user/consumable-row';
import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { CommunityRotationData } from './community-rotation-data';

export class CraftingRotation extends DataWithPermissions {

  public name: string;

  // Used as reference to current folder inside rotations page.
  public folderId?: string;

  public index = -1;

  public recipe: Partial<Craft>;

  public rotation: string[] = [];

  public description: string;

  public defaultItemId?: number;

  public defaultRecipeId?: string;

  public folder?: string;

  public food: ConsumableRow;

  public medicine: ConsumableRow;

  public freeCompanyActions: [number, number] = [0, 0];

  public stats: GearSet;

  public custom = false;

  public public = false;

  public tags: string[] = [];

  public community: CommunityRotationData;

  public xivVersion = '6.0';

  public getName(): string {
    if (this.recipe) {
      return this.name || `rlvl${this.recipe.rlvl} - ${this.rotation.length} steps, ${this.recipe.durability} dur`;
    } else {
      return 'New rotation';
    }
  }
}
