import { DataWithPermissions } from '../../core/database/permissions/data-with-permissions';
import { InventoryItem } from './inventory-item';
import { DeserializeAs } from '@kaiu/serializer';

export class UserInventory extends DataWithPermissions {

  @DeserializeAs([InventoryItem])
  items: InventoryItem[] = [];

  characterId: number;
}
