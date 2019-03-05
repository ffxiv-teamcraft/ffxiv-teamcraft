import { ListRow } from '../../list/model/list-row';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { CustomIngredient } from './custom-ingredient';

export class CustomItem extends ListRow {

  @ForeignKey(TeamcraftUser)
  authorId: string;

  name: string;

  customRequires: CustomIngredient[] = [];

  public get allRequirements():(CustomIngredient | Ingredient)[] {
    return [...this.requires, ...this.customRequires];
  }

  custom = true;

  index = -1;

  // Mainly used for display, in order to remove an item from its folder on drag out.
  folderId?: string;

  // Used for display too
  dirty?: boolean;
}
