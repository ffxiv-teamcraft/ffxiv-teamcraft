import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';
import { I18nName, LazyDataI18nKey, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { combineLatest, Observable, of, tap } from 'rxjs';

export class SearchExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    combineLatest([
      this.buildItemIndex(),
      this.buildActionIndex(xiv)
    ]).subscribe(() => {
      this.done();
    });
  }

  private buildItemIndex(): Observable<unknown> {
    const ilvls = this.requireLazyFileByKey('ilvls');
    const stats = this.requireLazyFileByKey('itemStats');
    const patches = this.requireLazyFileByKey('itemPatch');
    const equipment = this.requireLazyFileByKey('equipment');
    const bonuses = this.requireLazyFileByKey('itemBonuses');
    const icons = this.requireLazyFileByKey('itemIcons');
    const recipes = this.requireLazyFileByKey('recipesPerItem');
    const collectableFlags = this.requireLazyFileByKey('collectableFlags');
    const mjiBuildings = this.requireLazyFileByKey('islandBuildings');
    const mjiLandmarks = this.requireLazyFileByKey('islandLandmarks');

    const searchIndex = [];

    this.getExtendedNames('items')
      .filter(({ en }) => !en.startsWith('Dated'))
      .forEach(({ id, ...name }) => {
        const itemRecipes = recipes[id];
        if (itemRecipes?.length > 0) {
          itemRecipes.forEach(recipe => {
            searchIndex.push({
              id: `${id}-r${recipe.id}`,
              ...name,
              stats: stats[id],
              bonuses: bonuses[id],
              craftable: true,
              category: equipment[+id]?.equipSlotCategory,
              elvl: equipment[+id]?.level,
              ilvl: ilvls[+id],
              clvl: recipe.lvl,
              craftJob: recipe.job,
              patch: patches[+id],
              data: <SearchResult>{
                itemId: +id,
                icon: icons[id],
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
            id,
            ...name,
            stats: stats[id],
            bonuses: bonuses[id],
            craftable: false,
            category: equipment[+id]?.equipSlotCategory,
            elvl: equipment[+id]?.level,
            ilvl: ilvls[+id],
            patch: patches[+id],
            data: <SearchResult>{
              itemId: +id,
              icon: icons[id],
              amount: 1,
              contentType: 'items'
            }
          });
        }
      });
    searchIndex.push(
      ...Object.entries(mjiBuildings)
        .map(([key, building]) => {
          return <SearchResult>{
            id: +key,
            itemId: +key,
            icon: building.icon,
            contentType: 'islandBuildings',
            amount: 1,
            recipe: {
              recipeId: `mjibuilding-${key}`,
              itemId: +key,
              collectible: false,
              job: -10,
              stars: 0,
              lvl: 1,
              icon: building.icon
            }
          };
        }),
      ...Object.entries(mjiLandmarks)
        .map(([key, landmark]) => {
          return <SearchResult>{
            id: +key,
            itemId: +key,
            icon: landmark.icon,
            contentType: 'islandLandmarks',
            amount: 1,
            recipe: {
              recipeId: `mjilandmark-${key}`,
              itemId: +key,
              collectible: false,
              job: -10,
              stars: 0,
              lvl: 1,
              icon: landmark.icon
            }
          };
        }));
    this.persistToCompressedJsonAsset('item-search', searchIndex);
    return of(null);
  }

  private buildActionIndex(xiv: XivDataService): Observable<unknown> {
    return combineLatest([
      this.getSheet(xiv, 'Action', ['ClassJob#','ClassJobCategory#', 'ClassJobLevel']),
      this.getSheet(xiv, 'CraftAction', ['ClassJob#','ClassJobCategory#', 'ClassJobLevel'])
    ]).pipe(
      tap(([actions, craftActions]) => {
        const index = [];
        const icons = this.requireLazyFileByKey('actionIcons');
        [
          ...this.getExtendedNames('actions'),
          ...this.getExtendedNames('craftActions')
        ].forEach(action => {
          const xivAction = actions.find(row => row.index === +action.id)
            || craftActions.find(row => row.index === +action.id);
          index.push({
            ...action,
            lvl: xivAction?.ClassJobLevel,
            job: xivAction?.ClassJob,
            data: {
              id: +action.id,
              icon: icons[action.id],
              job: xivAction.ClassJob || xivAction.ClassJobCategory,
              level: xivAction.ClassJobLevel
            }
          });
        });
        this.persistToCompressedJsonAsset('action-search', index);
      })
    );

  }

  private getExtendedNames(property: LazyDataI18nKey): Array<{ id: string } & I18nName> {
    const baseEntry = this.requireLazyFileByKey(property);
    const koEntries = this.requireLazyFileByKey(this.findPrefixedProperty(property, 'ko'));
    const zhEntries = this.requireLazyFileByKey(this.findPrefixedProperty(property, 'zh'));
    return Object.entries(baseEntry)
      .map(([id, globalName]) => {
        const row = {
          id,
          ...globalName
        };
        if (koEntries[id]) {
          row.ko = koEntries[id];
        }
        if (zhEntries[id]) {
          row.zh = zhEntries[id];
        }
        return row;
      });
  }

  private findPrefixedProperty(property: LazyDataI18nKey, prefix: 'ko' | 'zh'): LazyDataI18nKey {
    return `${prefix}${property[0].toUpperCase()}${property.slice(1)}` as unknown as LazyDataI18nKey;
  }

  getName(): string {
    return 'Search Indexes';
  }

}
