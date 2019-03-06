import { I18nName } from '../../../model/common/i18n-name';
import { CraftedBy } from './crafted-by';
import { GatheredBy } from './gathered-by';
import { TradeSource } from './trade-source';
import { Instance } from './instance';
import { Vendor } from './vendor';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { DataModel } from '../../../core/database/storage/data-model';
import { Drop } from './drop';
import { Alarm } from '../../../core/alarms/alarm';
import { CompactMasterbook } from '../../../model/common/compact-masterbook';
import { CustomIngredient } from '../../custom-items/model/custom-ingredient';

export class ListRow extends DataModel {
  icon?: number;
  id: number;
  // The amount of items needed for the craft.
  amount: number;
  // The amount of crafts needed to get the amount of items needed.
  amount_needed?: number;
  done: number;
  used: number;
  requires?: Ingredient[] = [];
  recipeId?: string;
  yield = 1;

  craftedBy?: CraftedBy[] = [];
  gatheredBy?: GatheredBy;
  gardening?: number;
  drops?: Drop[] = [];
  tradeSources?: TradeSource[] = [];
  instances?: Instance[];
  reducedFrom?: any[] = [];
  desynths?: number[] = [];
  vendors?: Vendor[] = [];
  voyages?: I18nName[] = [];
  ventures?: number[] = [];
  alarms?: Alarm[] = [];
  masterbooks?: CompactMasterbook[] = [];

  /**
   * Is someone working on it?
   */
  workingOnIt?: string;

  /**
   * Manual flag for an item required as HQ
   */
  requiredAsHQ?: boolean;

  hidden?: boolean;


  /**
   * Should we ignore the price of this item for pricing mode?
   * @type {boolean}
   */
  usePrice?: boolean;
}
