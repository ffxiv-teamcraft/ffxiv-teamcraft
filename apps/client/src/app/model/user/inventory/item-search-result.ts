import { InventoryItem } from './inventory-item';

export interface ItemSearchResult extends InventoryItem {
  contentId: string;
  isCurrentCharacter: boolean;
}
