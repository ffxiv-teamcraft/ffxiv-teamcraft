import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { I18nName } from '@ffxiv-teamcraft/types';
import { combineLatest } from 'rxjs';

export class TraitsDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    const actions = this.requireLazyFileByKey('actions');
    const craftActions = this.requireLazyFileByKey('craftActions');
    const actionIcons = this.requireLazyFileByKey('actionIcons');
    const everyActions = { ...actions, ...craftActions };
    const actionKeys = Object.keys(everyActions).filter((key) => everyActions[key].en?.length > 0 && actionIcons[+key] !== undefined);
    combineLatest([
      this.getSheet<any>(xiv, 'Trait',
        ['Name', 'Icon', 'ClassJob#', 'ClassJobCategory#', 'Quest.JournalGenre.Icon#', 'Quest.Icon#', 'Level#'], false, 3),
      xiv.getFromSaintCSV<{ '#': string, Description: I18nName }>('TraitTransient')
    ]).subscribe(([traits, transient]) => {
      this.extendNames(traits.map(trait => {
        return {
          ...(transient.find(t => +t['#'] === trait.index) || {}),
          ...trait
        };
      }), [
        {
          field: 'Name',
          koSource: 'koTraits',
          zhSource: 'zhTraits'
        },
        {
          field: 'Description',
          koSource: 'koTraitDescriptions',
          zhSource: 'zhTraitDescriptions',
          targetField: 'description'
        }
      ]).forEach(({ row, extended }) => {
        pages[row.index] = {
          id: row.index,
          icon: row.Icon,
          patch: this.findPatch('trait', row.index),
          ...extended,
          level: row.Level,
          classJob: row.ClassJob,
          actions: actionKeys
            .filter(key => {
              return extended.description?.en?.includes(`>${everyActions[key]?.en}<`);
            })
            .map(key => +key)
        };
        if (row.Quest?.index > 0) {
          pages[row.index].quest = {
            id: row.Quest.index,
            icon: row.Quest.JournalGenre.Icon
          };
        }
      });
      this.persistToMinifiedJsonAsset('db/traits-database-pages', pages);
      this.done();
    });
  }

  getName(): string {
    return 'traits-db-pages';
  }

}
