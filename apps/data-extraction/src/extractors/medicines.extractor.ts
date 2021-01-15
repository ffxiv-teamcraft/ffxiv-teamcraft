import { AbstractExtractor } from '../abstract-extractor';

export class MedicinesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const medicines = [];
    this.getAllPages('https://xivapi.com/Search?indexes=items&filters=ItemSearchCategory.ID=43&columns=ID,Bonuses,LevelItem,LevelEquip').subscribe(page => {
      page.Results.forEach(entry => {
        if (entry.Bonuses) {
          medicines.push(entry);
        }
      });
    }, null, () => {
      this.persistToJsonAsset('medicines', medicines);
      this.done();
    });
  }

  getName(): string {
    return 'medicines';
  }

}
