import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { GatheredByExtractor } from './gathered-by.extractor';
import { AbstractItemDetailsExtractor } from './abstract-item-details-extractor';
import { map } from 'rxjs/operators';
import { AlarmsExtractor } from './alarms.extractor';
import { CraftedByExtractor } from './crafted-by.extractor';
import { DeprecatedExtractor } from './deprecated.extractor';
import { AlarmDetails, DataType, Extracts, GatheringNode, getExtract, getItemSource, LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { SimpleDetailsExtractor } from './simple-details-extractor.extractor';
import { IslandPastureExtractor } from './island-pasture.extractor';
import { QuestsExtractor } from './quests.extractor';
import { VendorsExtractor } from './vendors.extractor';
import { TradeSourcesExtractor } from './trade-sources.extractor';
import { VenturesExtractor } from './ventures.extractor';
import { DropsExtractor } from './drops.extractor';
import { FatesExtractor } from './fates.extractor';
import { GardeningExtractor } from './gardening.extractor';
import { ReducedFromExtractor } from './reduced-from.extractor';
import { VoyagesExtractor } from './voyages.extractor';
import { RequirementsExtractor } from './requirements.extractor';
import { MasterbooksExtractor } from './masterbooks.extractor';
import { uniqBy } from 'lodash';
import { createSpinner } from 'nanospinner';

export class ItemDetailsExtractExtractor extends AbstractExtractor {

  collectables = this.requireLazyFileByKey('collectables');

  collectablesShops = this.requireLazyFileByKey('collectablesShops');

  paramGrow = this.requireLazyFileByKey('paramGrow');

  items = this.requireLazyFileByKey('items');

  islandBuildings = this.requireLazyFileByKey('islandBuildings');

  islandLandmarks = this.requireLazyFileByKey('islandLandmarks');

  alarmsExtractor: AlarmsExtractor;

  protected doExtract(xiv: XivDataService): void {
    this.progress.stop();
    const spinner = createSpinner('Item details', {
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    }).start();
    this.get('https://xivapi.com/patchlist').pipe(
      map(patches => {
        this.alarmsExtractor = new AlarmsExtractor(patches);
        const extractors: AbstractItemDetailsExtractor<any>[] = [
          new DeprecatedExtractor(patches),
          new GatheredByExtractor(patches),
          this.alarmsExtractor,
          new CraftedByExtractor(patches),
          new SimpleDetailsExtractor(patches, 'desynth', DataType.DESYNTHS),
          new SimpleDetailsExtractor(patches, 'lootSources', DataType.TREASURES),
          new SimpleDetailsExtractor(patches, 'instanceSources', DataType.INSTANCES),
          new SimpleDetailsExtractor(patches, 'islandCrops', DataType.ISLAND_CROP),
          new SimpleDetailsExtractor(patches, 'mogstationSources', DataType.MOGSTATION),
          new IslandPastureExtractor(patches),
          new QuestsExtractor(patches),
          new VenturesExtractor(patches),
          new VendorsExtractor(patches),
          new TradeSourcesExtractor(patches),
          new DropsExtractor(patches),
          new FatesExtractor(patches),
          new GardeningExtractor(patches),
          new ReducedFromExtractor(patches),
          new VoyagesExtractor(patches),
          new RequirementsExtractor(patches),
          new MasterbooksExtractor(patches)
        ];
        let done = 0;
        const itemIds = Object.keys({ ...this.items, ...this.islandBuildings, ...this.islandLandmarks });
        spinner.update({
          text: `Item details ${done}/${itemIds.length}`
        }).spin();
        return itemIds.reduce((extracts, _itemId) => {
          const itemId = +_itemId;
          const sources = [];
          let contentType: LazyDataI18nKey | null = null;
          let xivapiIcon: string | null = null;
          if (itemId <= -11000) {
            contentType = 'islandLandmarks';
            xivapiIcon = this.islandLandmarks[_itemId].icon;
          } else if (itemId <= -10000) {
            contentType = 'islandBuildings';
            xivapiIcon = this.islandBuildings[_itemId].icon;
          }
          for (const extractor of extractors) {
            const source = extractor.doExtract(itemId, sources);
            const isEmptyArray = Array.isArray(source) && source.length === 0;
            if (source && !isEmptyArray) {
              sources.push({ type: extractor.getDataType(), data: source });
              if (extractor.getDataType() === DataType.DEPRECATED) {
                break;
              }
            }
          }
          if (sources.length > 0) {
            extracts[itemId] = {
              id: itemId,
              sources: sources.sort((a, b) => a.type - b.type)
            };
            if (contentType) {
              extracts[itemId].contentType = contentType;
              extracts[itemId].xivapiIcon = xivapiIcon;
            }
          }
          done++;
          if (done % 100 === 0 || done === itemIds.length) {
            spinner.update({
              text: `Item details ${done}/${itemIds.length}`
            }).spin();
          }
          return extracts;
        }, {} as Extracts);
      })
    ).subscribe(extracts => {
      spinner.success({
        text: 'Item details done.'
      }).spin();
      this.doLogTrackingData(extracts);
      this.doCollectablesData();
      this.persistToMinifiedJsonAsset('../extracts/extracts', extracts);
      this.done();
    });
  }

  private doLogTrackingData(extracts: any): void {
    const craftingLogPages = this.requireLazyFileByKey('craftingLogPages');
    const leves = this.requireLazyFileByKey('leves');
    const notebookDivision = this.requireLazyFileByKey('notebookDivision');
    const gatheringLogPages = this.requireLazyFileByKey('gatheringLogPages');
    const fishingLog = this.requireLazyFileByKey('fishingLog');
    const spearFishingLog = this.requireLazyFileByKey('spearFishingLog');
    const fishParameter = this.requireLazyFileByKey('fishParameter');
    const minBtnSpearNodes = this.alarmsExtractor.minBtnSpearNodes;
    const dohTabs = craftingLogPages.map(page => {
      return page.map(tab => {
        const divisionId = +Object.keys(notebookDivision).find(key => {
          return notebookDivision[key].pages.includes(tab.id);
        });
        (tab as any).divisionId = divisionId;
        const division = notebookDivision[divisionId];
        (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en)
          || division.name.en.startsWith('Fixtures') ||
          division.name.en.indexOf('Furnishings') > -1 || division.name.en.startsWith('Table') ||
          division.name.en.startsWith('Wall-mounted') || division.name.en.startsWith('Ornaments')
          || divisionId === 1049;
        if (divisionId === 1039) {
          (tab as any).requiredForAchievement = false;
        }
        tab.recipes = tab.recipes.map(entry => {
          (entry as any).leves = Object.entries<any>(leves)
            .filter(([, leve]) => {
              return leve.items.some(i => i.itemId === entry.itemId);
            })
            .map(([id]) => +id);
          return entry;
        });
        return tab;
      });
    });
    const dolTabs = gatheringLogPages.map(page => {
      return page.map(tab => {
        (tab as any).divisionId = +Object.keys(notebookDivision).find(key => {
          return notebookDivision[key].pages.includes(tab.id);
        }) || 0;
        const division = notebookDivision[(tab as any).divisionId];
        if (!division) {
          console.log(tab);
        }
        (tab as any).requiredForAchievement = /\d{1,2}-\d{1,2}/.test(division.name.en);
        tab.items = tab.items.map(item => {
          const gatheredBy = getItemSource(getExtract(extracts, item.itemId), DataType.GATHERED_BY);
          (item as any).nodes = (gatheredBy?.nodes || [])
            .slice(0, 3)
            .map(node => {
              return {
                gatheringNode: node,
                alarms: node.limited ? this.alarmsExtractor.generateAlarms(node) : []
              };
            });
          return item;
        });
        return tab;
      });
    });
    const fishingFish = fishingLog.map(entry => {
      const fshData = this.getFshData(entry.itemId, entry.spot.id, this.alarmsExtractor);
      const fish: any = {
        entry,
        id: entry.spot.id,
        itemId: entry.itemId,
        level: entry.level,
        icon: entry.icon,
        data: fshData
      };
      if (fishParameter[entry.itemId]) {
        fish.timed = fishParameter[entry.itemId].timed;
        fish.weathered = fishParameter[entry.itemId].weathered;
      }
      return fish;
    });
    const spearFishingFish = spearFishingLog.map(entry => {
      const spot = minBtnSpearNodes.find(n => n.items.includes(entry.itemId));
      const data = this.getFshData(entry.itemId, spot.id, this.alarmsExtractor);
      return {
        entry,
        id: spot.id,
        itemId: entry.itemId,
        level: spot.level,
        data: data,
        timed: data[0].gatheringNode.limited,
        tug: data[0].gatheringNode.tug
      };
    });
    const finalFshTabs = [fishingFish, spearFishingFish].map(log => {
      return log
        .filter(fish => fish.entry.mapId !== 358)
        .reduce((display, fish) => {
          const displayCopy = { ...display };
          let row = displayCopy.tabs.find(e => e.mapId === fish.entry.mapId);
          if (row === undefined) {
            displayCopy.tabs.push({
              id: fish.id,
              mapId: fish.entry.mapId,
              placeId: fish.entry.placeId,
              done: 0,
              total: 0,
              spots: []
            });
            row = displayCopy.tabs[displayCopy.tabs.length - 1];
          }
          const spotId = fish.entry.spot ? fish.entry.spot.id : fish.entry.id;
          let spot = row.spots.find(s => s.id === spotId);
          if (spot === undefined) {
            const coords = fish.entry.spot ? fish.entry.spot.coords : fish.entry.coords;
            row.spots.push({
              id: spotId,
              placeId: fish.entry.zoneId,
              mapId: fish.entry.mapId,
              done: 0,
              total: 0,
              coords: coords,
              fishes: []
            });
            spot = row.spots[row.spots.length - 1];
          }
          const { entry, ...fishRow } = fish;
          spot.fishes.push(fishRow);
          return displayCopy;
        }, { tabs: [], total: 0, done: 0 });
    });
    const finalLogTrackingData = [
      ...dohTabs,
      ...dolTabs
    ];
    this.persistToMinifiedJsonAsset('log-tracker-page-data', finalLogTrackingData);
    this.persistToMinifiedJsonAsset('fishing-log-tracker-page-data', finalFshTabs);
  }

  private doCollectablesData(): void {
    const jobs = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const collectablesPageData = jobs.reduce((acc, job) => {
      return {
        ...acc,
        [job]: this.getCollectables(job)
      };
    }, {});
    this.persistToMinifiedJsonAsset('collectables-page-data', collectablesPageData);
  }

  private getCollectables(jobId: number) {
    return Object.keys(this.collectables)
      .filter(key => {
        const collectableEntry = this.collectables[key];
        if (collectableEntry.hwd || !collectableEntry.collectable) {
          return false;
        }
        const job = Object.keys(this.collectablesShops).find(sKey => {
          return this.collectablesShops[sKey].includes(collectableEntry.shopId);
        });
        return job !== undefined && (+job + 8) === jobId;
      })
      .map(key => {
        return {
          ...this.collectables[key],
          itemId: +key,
          amount: 1
        };
      })
      .reduce((acc, row) => {
        let group = acc.find(accRow => accRow.groupId === row.group);
        if (group === undefined) {
          acc.push({
            groupId: row.group,
            collectables: []
          });
          group = acc[acc.length - 1];
        }
        group.collectables.push(row);
        return acc;
      }, [])
      .map(group => {
        group.collectables = group.collectables
          .sort((a, b) => b.levelMax - a.levelMax)
          .map(collectable => {
            const expBase = this.getExp(collectable, collectable.base.exp);
            const expMid = this.getExp(collectable, collectable.mid.exp);
            const expHigh = this.getExp(collectable, collectable.high.exp);
            collectable.expBase = expBase;
            collectable.expMid = expMid;
            collectable.expHigh = expHigh;
            if ([16, 17, 18].includes(jobId)) {
              const nodes = this.alarmsExtractor.getItemNodes(collectable.itemId, true);
              collectable.nodes = nodes.map(gatheringNode => {
                return {
                  gatheringNode,
                  alarms: gatheringNode.limited ? this.alarmsExtractor.generateAlarms(gatheringNode) : []
                };
              });
            }
            return collectable;
          });
        return group;
      });
  }

  private getExp(collectable: any, ratio: number): number[] {
    return new Array(this.maxLevel).fill(null)
      .map((ignored, index) => {
        const level = index + 1;
        const firstCollectableDigit = Math.ceil(collectable.levelMax / 10);
        const firstLevelDigit = Math.ceil(level / 10);
        let nerfedExp = firstCollectableDigit < firstLevelDigit;
        if (level % 10 === 0 && level > collectable.levelMax) {
          nerfedExp = nerfedExp && (firstCollectableDigit + 1) < firstLevelDigit
            || (level - collectable.levelMax) >= 10
            || collectable.levelMax % 10 === 0;
        }
        if (nerfedExp) {
          return 1000;
        }
        const row = this.paramGrow[collectable.levelMax];
        return row.ExpToNext * ratio / 1000;
      })
      .filter(v => v !== 1000);
  }

  private getFshData(itemId: number, spotId: number, extractor: AlarmsExtractor): { gatheringNode: GatheringNode, alarms: AlarmDetails[] }[] {
    const nodes = extractor.getItemNodes(itemId, true);
    return uniqBy(nodes.filter(node => node.id === spotId)
      .map(node => {
        return {
          gatheringNode: node,
          alarms: extractor.generateAlarms(node)
        };
      }), entry => entry.gatheringNode.baits && entry.gatheringNode.baits[0])
      .slice(0, 3);
  }

  getName(): string {
    return 'extracts';
  }


}
