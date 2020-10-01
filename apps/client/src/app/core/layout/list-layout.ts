import { LayoutRow } from './layout-row';
import { DeserializeAs } from '@kaiu/serializer';
import { LayoutRowOrder } from './layout-row-order.enum';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { DataModel } from '../database/storage/data-model';
import { ItemRowMenuElement } from '../../model/display/item-row-menu-element';

export class ListLayout extends DataModel {

  @ForeignKey(TeamcraftUser)
  public userId: string;

  @DeserializeAs([LayoutRow])
  public rows: LayoutRow[];

  public recipeOrderBy = 'NONE';

  public considerCrystalsAsItems = false;

  public showCraftableAmount = false;

  public showVendors = false;

  public showInventory = false;

  public recipeOrder: LayoutRowOrder = LayoutRowOrder.ASC;

  public recipeZoneBreakdown = false;

  public recipeHideCompleted = false;

  public recipeHideZoneDuplicates = false;

  public includeRecipesInItems = false;

  public name: string;

  public default = false;

  public rowsDisplay: {
    buttons: ItemRowMenuElement[];
    menu: ItemRowMenuElement[];
  } = {
    buttons: [
      ItemRowMenuElement.ATTACH_ROTATION
    ],
    menu: [
      ItemRowMenuElement.ADD_TAG,
      ItemRowMenuElement.COMMENTS,
      ItemRowMenuElement.COPY_NAME_NOT_FAVORITE,
      ItemRowMenuElement.ADD_ALL_ALARMS,
      ItemRowMenuElement.WORK_ON_IT,
      ItemRowMenuElement.ASSIGN_TEAM_MEMBER,
      ItemRowMenuElement.EDIT_AMOUNT,
      ItemRowMenuElement.MARK_HQ,
      ItemRowMenuElement.ADD_TO_ANOTHER_LIST,
      ItemRowMenuElement.REQUIREMENTS,
      ItemRowMenuElement.REMOVE_ITEM,
      ItemRowMenuElement.MARK_AS_DONE_IN_LOG
    ]
  };

  base64 = () => {
    const exportLayout = { ...this as any };
    delete exportLayout.userId;
    return btoa(escape(JSON.stringify(exportLayout)));
  }

  public clone():ListLayout {
    const clone = new ListLayout();
    Object.assign(clone, JSON.parse(JSON.stringify(this)));
    clone.rows = this.rows.map(row => {
      return row.clone();
    });
    return clone;
  }
}
