import { AbstractExtractor } from '../abstract-extractor';

export class TribesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const tribes = {};
    this.getAllEntries<any>(`https://xivapi.com/Tribe`).subscribe(completeFetch => {
      completeFetch.forEach(entry => {
        delete entry.GameContentLinks;
        delete entry.GamePatch;
        delete entry.NameFemale;
        delete entry.NameFemale_de;
        delete entry.NameFemale_en;
        delete entry.NameFemale_fr;
        delete entry.NameFemale_ja;
        delete entry.Patch;
        delete entry['Url'];
        tribes[entry.ID] = entry;
      });
      this.persistToJsonAsset('tribes', tribes);
      this.done();
    });
  }

  getName(): string {
    return 'tribes';
  }

}
