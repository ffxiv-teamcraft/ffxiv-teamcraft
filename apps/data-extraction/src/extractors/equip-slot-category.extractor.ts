import { AbstractExtractor } from '../abstract-extractor';

export class EquipSlotCategoryExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const equipSlotCategories = {};
    this.getAllEntries(`https://xivapi.com/EquipSlotCategory`).subscribe(completeFetch => {
      completeFetch.forEach(entry => {
        delete entry.GameContentLinks;
        equipSlotCategories[entry.ID] = entry;
      });
      this.persistToJsonAsset('equip-slot-categories', equipSlotCategories);
      this.done();
    });
  }

  getName(): string {
    return 'equip-slot-categories';
  }

}
