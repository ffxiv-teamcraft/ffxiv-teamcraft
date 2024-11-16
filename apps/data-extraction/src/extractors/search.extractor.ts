import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { I18nName } from '@ffxiv-teamcraft/types';
import { combineLatest, concat, Observable, tap } from 'rxjs';
import { LazyItemStat } from '@ffxiv-teamcraft/data/model/lazy-item-stat';
import { LazyItemBonus } from '@ffxiv-teamcraft/data/model/lazy-item-bonus';
import { LazyInstance } from '@ffxiv-teamcraft/data/model/lazy-instance';
import { LazyQuest } from '@ffxiv-teamcraft/data/model/lazy-quest';
import { LazyNpc } from '@ffxiv-teamcraft/data/model/lazy-npc';
import { LazyLeve } from '@ffxiv-teamcraft/data/model/lazy-leve';
import { LazyMob } from '@ffxiv-teamcraft/data/model/lazy-mob';
import { LazyFate } from '@ffxiv-teamcraft/data/model/lazy-fate';
import { LazyPlace } from '@ffxiv-teamcraft/data/model/lazy-place';
import { LazyStatus } from '@ffxiv-teamcraft/data/model/lazy-status';
import { LazyTrait } from '@ffxiv-teamcraft/data/model/lazy-trait';
import { LazyAchievement } from '@ffxiv-teamcraft/data/model/lazy-achievement';
import { LazyRecipesPerItem } from '@ffxiv-teamcraft/data/model/lazy-recipes-per-item';

export class SearchExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const progress = this.multiBarRef.create(13, 0, { label: 'Indexes' });
    concat(
      this.buildItemIndex(),
      this.buildActionIndex(xiv),
      this.buildInstanceIndex(),
      this.buildQuestIndex(),
      this.buildNpcIndex(),
      this.buildLeveIndex(),
      this.buildMonsterIndex(),
      this.buildFateIndex(),
      this.buildMapIndex(),
      this.buildStatusIndex(),
      this.buildTraitIndex(),
      this.buildAchievementIndex(),
      this.buildFishingSpotIndex(),
      this.buildGatheringNodeIndex()
    ).subscribe({
      next: () => {
        progress.increment();
      },
      complete: () => this.done()
    });
  }

  private getBaseEntry(row: I18nName & { id: string }): I18nName & { id: number } {
    return {
      id: +row.id,
      en: row.en,
      de: row.de,
      ja: row.ja,
      fr: row.fr,
      ko: row.ko,
      zh: row.zh
    };
  }

  private buildItemIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const ilvls = this.requireLazyFileByKey('ilvls');
      const stats = this.requireLazyFileByKey('itemStats');
      const patches = this.requireLazyFileByKey('itemPatch');
      const equipment = this.requireLazyFileByKey('equipment');
      const uiCategories = this.requireLazyFileByKey('uiCategories');
      const bonuses = this.requireLazyFileByKey('itemBonuses');
      const icons = this.requireLazyFileByKey('itemIcons');
      const recipes = this.requireLazyFileByKey('recipesPerItem');
      const collectableFlags = this.requireLazyFileByKey('collectableFlags');
      const mjiBuildings = this.requireLazyFileByKey('islandBuildings');
      const mjiLandmarks = this.requireLazyFileByKey('islandLandmarks');
      const additionalData = this.requireLazyFileByKey('additionalItemData');

      const searchIndex = [];

      this.getExtendedNames('items')
        .filter(({ en }) => !en.startsWith('Dated'))
        .forEach(({ id, ...name }) => {
          const itemRecipes: LazyRecipesPerItem[] = recipes[id];
          const baseSearchInfo = {
            ...name,
            iconId: icons[id]?.split('/').reverse()[0].split('_')[0] || 0,
            ...additionalData[id],
            stats: stats[id]?.reduce((acc, stat: LazyItemStat) => {
              return {
                ...acc,
                [stat.ID]: stat.NQ
              };
            }, {}),
            bonuses: bonuses[id]?.reduce((acc, stat: LazyItemBonus) => {
              const { ID, ...values } = stat;
              return {
                ...acc,
                [ID]: {
                  ...values
                }
              };
            }, {}),
            collectible: collectableFlags[id] > 0,
            category: uiCategories[+id],
            cjc: equipment[+id]?.jobs?.reduce((acc, job) => {
              return {
                ...acc,
                [job]: 1
              };
            }, {}),
            elvl: equipment[+id]?.level,
            ilvl: ilvls[+id],
            pDmg: equipment[+id]?.pDmg,
            mDmg: equipment[+id]?.mDmg,
            pDef: equipment[+id]?.pDef,
            mDef: equipment[+id]?.mDef,
            delay: equipment[+id]?.delay,
            patch: patches[+id]
          };
          if (itemRecipes?.length > 0) {
            itemRecipes.forEach(recipe => {
              searchIndex.push({
                ...baseSearchInfo,
                id: `${id}-r${recipe.id}`,
                craftable: true,
                clvl: recipe.lvl,
                craftJob: recipe.job,
                collectible: collectableFlags[id],
                data: {
                  itemId: +id,
                  icon: icons[id],
                  ilvl: ilvls[id],
                  amount: 1,
                  contentType: 'items',
                  recipe: {
                    recipeId: recipe.id.toString(),
                    itemId: +id,
                    collectible: collectableFlags[id],
                    job: recipe.job,
                    stars: recipe.stars,
                    lvl: recipe.lvl
                  }
                }
              });
            });
          } else {
            searchIndex.push({
              id: +id,
              ...baseSearchInfo,
              craftable: false,
              data: {
                itemId: +id,
                ilvl: ilvls[id],
                icon: icons[id],
                amount: 1,
                contentType: 'items'
              }
            });
          }
        });
      searchIndex.push(
        ...Object.entries(mjiBuildings)
          .map(([id, building]) => {
            const { ingredients, key, ...name } = building;
            return {
              id: +id,
              itemId: +id,
              ...name,
              data: {
                itemId: +id,
                icon: building.icon,
                amount: 1,
                contentType: 'islandBuildings',
                recipe: {
                  recipeId: `mjibuilding-${id}`,
                  itemId: +id,
                  collectible: false,
                  job: -10,
                  stars: 0,
                  lvl: 1,
                  icon: building.icon,
                  isIslandRecipe: true
                }
              }
            };
          }),
        ...Object.entries(mjiLandmarks)
          .map(([id, landmark]) => {
            const { ingredients, key, ...name } = landmark;
            return {
              id: +id,
              itemId: +id,
              ...name,
              data: {
                itemId: +id,
                icon: landmark.icon,
                amount: 1,
                contentType: 'islandLandmarks',
                recipe: {
                  recipeId: `mjilandmark-${id}`,
                  itemId: +id,
                  collectible: false,
                  job: -10,
                  stars: 0,
                  lvl: 1,
                  icon: landmark.icon,
                  isIslandRecipe: true
                }
              }
            };
          }));
      this.persistToCompressedJsonAsset('item-search', searchIndex);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildActionIndex(xiv: XivDataService): Observable<unknown> {
    return combineLatest([
      this.getSheet(xiv, 'Action', ['ClassJob#', 'ClassJobCategory#', 'ClassJobLevel#']),
      this.getSheet(xiv, 'CraftAction', ['ClassJob#', 'ClassJobCategory#', 'ClassJobLevel#'])
    ]).pipe(
      tap(([actions, craftActions]) => {
        const index = [];
        const icons = this.requireLazyFileByKey('actionIcons');
        const patches = Object.entries(this.requireLazyFileByKey('patchContent'));
        [
          ...this.getExtendedNames('actions'),
          ...this.getExtendedNames('craftActions')
        ].forEach(action => {
          const patch = +patches.find(([id, patch]) => {
            return [...(patch.action || []), ...(patch.craftaction || [])].includes(+action.id);
          })?.[0] || 1;
          const xivAction = actions.find(row => row.index === +action.id)
            || craftActions.find(row => row.index === +action.id);
          index.push({
            ...action,
            id: +action.id,
            lvl: xivAction?.ClassJobLevel,
            job: xivAction?.ClassJob,
            patch: patch,
            data: {
              id: +action.id,
              icon: icons[action.id],
              job: xivAction?.ClassJob || xivAction?.ClassJobCategory,
              level: xivAction?.ClassJobLevel
            }
          });
        });
        this.persistToCompressedJsonAsset('action-search', index);
      })
    );
  }

  private buildInstanceIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyInstance>('instances');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          lvl: row.levelReq,
          patch: this.findPatch('instancecontent', row.id),
          data: {
            id: +row.id,
            icon: row.icon,
            banner: row.banner,
            level: row.levelReq
          }
        };
      });
      this.persistToCompressedJsonAsset('instance-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildQuestIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyQuest>('quests', q => q.name);
      const index = [];
      names.forEach((row) => {
        index.push({
          ...this.getBaseEntry(row),
          patch: this.findPatch('quest', row.id),
          data: {
            id: row.id,
            icon: row.icon,
            banner: row.banner
            // level: row.lvl
          }
        });
      });
      this.persistToCompressedJsonAsset('quest-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildNpcIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyNpc>('npcs');
      const koTitles = this.requireLazyFileByKey('koNpcTitles');
      const zhTitles = this.requireLazyFileByKey('zhNpcTitles');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('enpcresident', row.id),
          data: {
            id: row.id,
            title: {
              ...row.title,
              ...koTitles[row.id],
              ...zhTitles[row.id]
            }
          }
        };
      });
      this.persistToCompressedJsonAsset('npc-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildLeveIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyLeve>('leves');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('leve', row.id),
          lvl: row.lvl,
          job: row.job.id,
          data: {
            id: row.id,
            icon: '/c/Leve.png',
            level: row.lvl,
            banner: row.banner,
            job: row.job
          }
        };
      });
      this.persistToCompressedJsonAsset('leve-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildMonsterIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyMob>('mobs');
      const monsters = this.requireLazyFileByKey('monsters');
      const index = names.map((row) => {
        const monster = monsters[row.id];
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('bnpcname', row.id),
          data: {
            id: row.id,
            icon: monster?.icon,
            level: monster?.level,
            zoneid: monster && monster.positions[0] ? monster.positions[0].zoneid : null
          }
        };
      });
      this.persistToCompressedJsonAsset('monster-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildFateIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyFate>('fates', data => data.name);
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('fate', row.id),
          data: {
            id: row.id,
            icon: row.icon,
            level: row.level
          }
        };
      });
      this.persistToCompressedJsonAsset('fate-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildMapIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyPlace>('places');
      const entries = this.requireLazyFileByKey('mapEntries');
      const index = names.map((row) => {
        const entry = entries.find(m => m.zone === +row.id);
        if (entry === undefined) {
          return null;
        }
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('placename', row.id),
          data: {
            id: entry.id,
            zoneid: row.id
          }
        };
      })
        .filter(Boolean);
      this.persistToCompressedJsonAsset('map-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  // TODO watch for status data, as it's typed any in the current impl...
  private buildStatusIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyStatus>('statuses');
      const koDescriptions = this.requireLazyFileByKey('koStatusDescriptions');
      const zhDescriptions = this.requireLazyFileByKey('zhStatusDescriptions');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('status', row.id),
          data: {
            id: row.id,
            icon: row.icon,
            description: {
              ...row.description,
              ...koDescriptions[row.id],
              ...zhDescriptions[row.id]
            }
          }
        };
      });
      this.persistToCompressedJsonAsset('status-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildTraitIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyTrait>('traits');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('trait', row.id),
          lvl: row.level,
          job: row.job,
          data: {
            id: row.id,
            icon: row.icon,
            level: row.level,
            job: row.job
          }
        };
      });
      this.persistToCompressedJsonAsset('trait-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  // TODO watch for achievement data, as it's typed any in the current impl...
  private buildAchievementIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const names = this.getExtendedNames<LazyAchievement>('achievements');
      const index = names.map((row) => {
        return {
          ...this.getBaseEntry(row),
          patch: this.findPatch('achievement', row.id),
          data: {
            id: row.id,
            icon: row.icon
          }
        };
      });
      this.persistToCompressedJsonAsset('achievement-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildFishingSpotIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const spots = this.requireLazyFileByKey('fishingSpots');
      const names = this.getExtendedNames<LazyPlace>('places');
      const index = spots.map((spot) => {
        let name = this.findZoneName(names, spot.zoneId, spot.mapId);
        if (name === undefined && spot.id >= 10000) {
          name = names.find(row => +row.id === 1647);
        }
        if (name === undefined) {
          return null;
        }
        return {
          ...this.getBaseEntry(name),
          patch: this.findPatch('placename', spot.zoneId),
          data: {
            id: spot.id,
            spot
          }
        };
      }).filter(Boolean);
      this.persistToCompressedJsonAsset('fishing-spot-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  private buildGatheringNodeIndex(): Observable<unknown> {
    return new Observable(subscriber => {
      const nodes = this.requireLazyFileByKey('nodes');
      const names = this.getExtendedNames<LazyPlace>('places');
      const index = Object.entries(nodes).map(([id, node]) => {
        const name = this.findZoneName(names, node.zoneid, node.map);
        if (name === undefined) {
          return null;
        }
        return {
          ...this.getBaseEntry(name),
          patch: this.findPatch('placename', node.zoneid),
          data: {
            id: +id,
            node
          }
        };
      }).filter(Boolean);
      this.persistToCompressedJsonAsset('gathering-node-search', index);
      subscriber.next();
      subscriber.complete();
    });
  }

  getName(): string {
    return 'Search Indexes';
  }

}
