import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { LazyPlace } from '@ffxiv-teamcraft/data/model/lazy-place';
import { AlarmsExtractor } from '../extracts/alarms.extractor';

export class NodesDatabasePagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    const alarmsExtractor = new AlarmsExtractor([]);
    const nodes = this.requireLazyFileByKey('nodes');
    const koBonuses = this.requireLazyFileByKey('koGatheringBonuses');
    const zhBonuses = this.requireLazyFileByKey('zhGatheringBonuses');
    const gatheringItemsByItemId = Object.entries(this.requireLazyFileByKey('gatheringItems'))
      .reduce((acc, [key, value]) => {
        return {
          ...acc,
          [value.itemId]: value
        };
      }, {});
    const names = this.getExtendedNames<LazyPlace>('places');
    this.getSheet<any>(xiv, 'GatheringPoint', ['GatheringPointBase#', 'GatheringPointBonus'], false, 2).subscribe(gatheringPoints => {
      Object.entries(nodes).forEach(([id, node]) => {
        const name = this.findZoneName(names, node.zoneid, node.map);
        if (name === undefined) {
          return;
        }
        pages[id] = {
          id: +id,
          ...node,
          ...name,
          patch: this.findPatch('placename', node.zoneid),
          items: [
            ...node.items.map(itemId => {
              return {
                itemId,
                gatheringItem: gatheringItemsByItemId[itemId],
                alarms: node.limited ? alarmsExtractor.generateAlarms({
                  ...node,
                  id: +id,
                  zoneId: node.zoneid,
                  matchingItemId: itemId,
                  matchingItemIsHidden: false
                }) : []
              };
            }),
            ...(node.hiddenItems || []).map(itemId => {
              return {
                itemId,
                gatheringItem: gatheringItemsByItemId[itemId],
                alarms: node.limited ? alarmsExtractor.generateAlarms({
                  ...node,
                  id: +id,
                  zoneId: node.zoneid,
                  matchingItemId: itemId,
                  matchingItemIsHidden: true
                }) : []
              };
            })
          ]
        };
        if (node.limited) {
          pages[id].alarms = alarmsExtractor.generateAlarms({
            ...node,
            id: +id,
            zoneId: node.zoneid
          });
        }
        const base = gatheringPoints.find(point => point.GatheringPointBase === +id);
        pages[id].bonuses = base.GatheringPointBonus
          .filter(bonus => bonus.index > 0)
          .map(bonus => {
            const koBonus = koBonuses[bonus.index];
            const zhBonus = zhBonuses[bonus.index];
            return {
              condition: ['en', 'de', 'ja', 'fr'].reduce((acc, lang) => {
                return {
                  ...acc,
                  [lang]: bonus.Condition[`Text_${lang}`].replace('{{value}}', bonus.ConditionValue)
                };
              }, {
                ko: koBonus?.condition?.ko?.replace('<Value>IntegerParameter(1)</Value>', koBonus.conditionValue.toString()) || '',
                zh: zhBonus?.condition?.zh?.replace('<Value>IntegerParameter(1)</Value>', zhBonus.conditionValue.toString()) || ''
              }),
              bonus: ['en', 'de', 'ja', 'fr'].reduce((acc, lang) => {
                return {
                  ...acc,
                  [lang]: bonus.BonusType[`Text_${lang}`].replace('{{value}}', bonus.BonusValue)
                };
              }, {
                ko: koBonus?.bonus?.ko?.replace('<Value>IntegerParameter(1)</Value>', koBonus.value.toString()) || '',
                zh: zhBonus?.bonus?.zh?.replace('<Value>IntegerParameter(1)</Value>', zhBonus.value.toString()) || ''
              })
            };
          });
      });
      this.persistToMinifiedJsonAsset('db/nodes-database-pages', pages);
      this.done();
    });
  }

  getName(): string {
    return 'nodes-db-pages';
  }

}
