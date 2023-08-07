import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { monsterDrops } from '@ffxiv-teamcraft/data/handmade/monster-drops';

export class MobsDatabasePagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    const mobs = this.getExtendedNames('mobs');
    const monsters = this.requireLazyFileByKey('monsters');
    const reverseDropSources = Object.entries(this.requireLazyFileByKey('dropSources'))
      .reduce((acc, [key, value]) => {
        value.forEach(mobId => {
          acc[mobId] = [...(acc[mobId] || []), +key];
        });
        return acc;
      }, {});
    mobs.forEach(mob => {
      pages[mob.id] = {
        ...mob,
        patch: this.findPatch('bnpcname', mob.id),
        drops: [
          ...(reverseDropSources[mob.id] || []),
          ...(monsterDrops[mob.id] || [])
        ],
        monster: monsters[mob.id]
      };
    });
    this.persistToMinifiedJsonAsset('db/mobs-database-pages', pages);
    this.done();
  }

  getName(): string {
    return 'mobs-db-pages';
  }

}
