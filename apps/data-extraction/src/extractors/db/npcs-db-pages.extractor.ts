import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { LazyNpc } from '@ffxiv-teamcraft/data/model/lazy-npc';
import { levemetes } from '@ffxiv-teamcraft/data/handmade/levemetes';
import { combineLatest } from 'rxjs';

export class NpcsDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    const koTitles = this.requireLazyFileByKey('koNpcTitles');
    const zhTitles = this.requireLazyFileByKey('zhNpcTitles');
    const quests = this.requireLazyFileByKey('quests');
    combineLatest([
      this.getSheet<any>(xiv, 'ENpcBase', ['EnpcData']),
      this.getSheet<any>(xiv, 'DefaultTalk', ['Text'])
    ]).subscribe(([bases, defaultTalks]) => {
      this.getExtendedNames<LazyNpc>('npcs').forEach(npc => {
        const base = bases.find(b => b.index === +npc.id);
        pages[npc.id] = {
          patch: this.findPatch('enpcresident', npc.id),
          ...npc,
          levemetes: levemetes[+npc.id],
          title: {
            ...npc.title,
            ...(koTitles[npc.id] || {}),
            ...(zhTitles[npc.id] || {})
          },
          quests: base.ENpcData
            .filter(id => id >= 65530 && id <= 70000)
            .map(id => {
              return {
                id,
                ...(quests[id] || {})
              };
            }),
          defaultTalks: npc.defaultTalks.map(talk => {
            return defaultTalks.find(d => d.index === talk)?.Text?.filter(text => text.length > 1);
          }).filter(Boolean)
        };
      });
      this.persistToMinifiedJsonAsset('db/npcs-database-pages', pages);
      this.done();
    });

  }

  getName(): string {
    return 'npcs-db-pages';
  }

}
