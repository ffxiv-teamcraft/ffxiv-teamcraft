import { AbstractExtractor } from '../abstract-extractor';
import { join } from 'path';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { uniq } from 'lodash';

export class PatchContentExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const patchContent = require(join(__dirname, '../../../../client/src/assets/data/patch-content.json'));
    combineLatest([
      this.getPatchContent('Achievement'),
      this.getPatchContent('Action'),
      this.getPatchContent('CraftAction'),
      this.getPatchContent('Fate'),
      this.getPatchContent('InstanceContent'),
      this.getPatchContent('Item'),
      this.getPatchContent('Leve'),
      this.getPatchContent('PlaceName'),
      this.getPatchContent('BNpcName'),
      this.getPatchContent('ENpcResident'),
      this.getPatchContent('Quest'),
      this.getPatchContent('Status'),
      this.getPatchContent('Trait')
    ]).subscribe(
      (contents: Array<{ content: string, record: Record<number, number> }>) => {
        contents.forEach(content => {
          Object.entries(content.record).forEach(([elementId, patch]) => {
            if (+elementId === 0) {
              return;
            }
            patchContent[patch] = patchContent[patch] || {};
            patchContent[patch][content.content] = patchContent[patch][content.content] || [];
            patchContent[patch][content.content] = uniq([...patchContent[patch][content.content], +elementId]);
          });
        });
        this.persistToJsonAsset('patch-content', patchContent);
        this.done();
      });
  }

  getPatchContent(content: string): Observable<{ content: string, record: Record<number, number> }> {
    return this.getNonXivapiUrl(`https://raw.githubusercontent.com/xivapi/ffxiv-datamining-patches/master/patchdata/${content}.json`).pipe(
      map(record => {
        return {
          content: content.toLowerCase(),
          record
        };
      })
    );
  }

  getName(): string {
    return 'patch-content';
  }

}
