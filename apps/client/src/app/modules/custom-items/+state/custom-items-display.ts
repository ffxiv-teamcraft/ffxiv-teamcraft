import { CustomItemFolder } from '../model/custom-item-folder';
import { CustomItem } from '../model/custom-item';

export interface CustomItemsDisplay {
  otherItems: CustomItem[],
  folders: {
    folder: CustomItemFolder,
    items: CustomItem[]
  }[];
}
