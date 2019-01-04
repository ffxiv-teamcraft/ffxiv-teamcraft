import { LayoutRow } from './layout-row';
import { DeserializeAs } from '@kaiu/serializer';
import { LayoutRowOrder } from './layout-row-order.enum';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { DataModel } from '../database/storage/data-model';

export class ListLayout extends DataModel {

  @ForeignKey(TeamcraftUser)
  public userId: string;

  @DeserializeAs([LayoutRow])
  public rows: LayoutRow[];

  public recipeOrderBy = 'NONE';

  public considerCrystalsAsItems = false;

  public showInventory = false;

  public recipeOrder: LayoutRowOrder = LayoutRowOrder.ASC;

  public recipeZoneBreakdown = false;

  public recipeHideCompleted =false;

  public name: string;

  get base64(): string {
    return btoa(JSON.stringify(this.rows));
  }
}
