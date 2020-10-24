import { Injectable, NgZone } from '@angular/core';
import { List } from './model/list';
import { concat, Observable, of } from 'rxjs';
import { getCraftByPriority, getItemSource, isListRow, ListRow } from './model/list-row';
import { DataService } from '../../core/api/data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { DataExtractorService } from './data/data-extractor.service';
import { catchError, filter, first, map, mapTo, skip, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { GarlandToolsService } from '../../core/api/garland-tools.service';
import { DiscordWebhookService } from '../../core/discord/discord-webhook.service';
import { TeamsFacade } from '../teams/+state/teams.facade';
import { environment } from '../../../environments/environment';
import { CustomItemsFacade } from '../custom-items/+state/custom-items.facade';
import { CustomItem } from '../custom-items/model/custom-item';
import { DataType } from './data/data-type';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { CraftedBy } from './model/crafted-by';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftGearsetStats } from '../../model/user/teamcraft-gearset-stats';

interface ListAdditionParams {
  itemId: number | string;
  list: List;
  recipeId: string | number;
  amount?: number;
  collectible?: boolean;
  ignoreHooks?: boolean;
  upgradeCustom?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ListManagerService {

  private customItemsSync: CustomItem[] = [];

  constructor(protected db: DataService,
              private gt: GarlandToolsService,
              protected i18n: I18nToolsService,
              private extractor: DataExtractorService,
              private zone: NgZone,
              private discordWebhookService: DiscordWebhookService,
              private teamsFacade: TeamsFacade,
              private customItemsFacade: CustomItemsFacade,
              private lazyDataService: LazyDataService,
              private authFacade: AuthFacade) {

    this.customItemsFacade.loadAll();
    this.customItemsFacade.allCustomItems$.subscribe(items => this.customItemsSync = items);

  }

  public addToList({ itemId, list, recipeId, amount = 1, collectible = false, ignoreHooks = false, upgradeCustom = false }: ListAdditionParams): Observable<List> {
    let team$ = of(null);
    if (list.teamId && !ignoreHooks) {
      this.teamsFacade.loadTeam(list.teamId);
      team$ = this.teamsFacade.allTeams$
        .pipe(
          map(teams => teams.find(team => list.teamId && team.$key === list.teamId)),
          filter(team => team !== undefined),
          first()
        );
    }
    const itemSource = typeof itemId === 'number' ? this.lazyDataService.getExtract(itemId) : this.customItemsSync.find(i => i.$key === itemId);
    return team$.pipe(
      tap((team) => {
        if (team && team.webhook !== undefined && amount !== 0) {
          if (+itemId === itemId) {
            if (amount > 0) {
              this.discordWebhookService.notifyItemAddition(itemId, amount, list, team);
            } else {
              this.discordWebhookService.notifyItemDeletion(itemId, Math.abs(amount), list, team);
            }
          } else {
            if (amount > 0) {
              this.discordWebhookService.notifyCustomItemAddition((<CustomItem>itemSource).name, amount, list, team);
            } else {
              this.discordWebhookService.notifyCustomItemDeletion((<CustomItem>itemSource).name, Math.abs(amount), list, team);
            }
          }
        }
      }),
      mapTo(itemSource),
      withLatestFrom(this.authFacade.gearSets$),
      switchMap(([data, gearsets]) => {
        if (data === undefined) {
          return of(new List());
        }
        // If it's a standard item, add it with the classic implementation.
        if (isListRow(data)) {
          return this.processItemAddition(data, amount, collectible, recipeId, gearsets);
        } else {
          if ((data as CustomItem).realItemId !== undefined && upgradeCustom) {
            const itemData = this.lazyDataService.getExtract((data as CustomItem).realItemId);
            return this.processItemAddition(itemData, amount, collectible, recipeId, gearsets).pipe(
              catchError(() => {
                return this.processCustomItemAddition(data as CustomItem, amount);
              })
            );
          } else {
            return this.processCustomItemAddition(data as CustomItem, amount);
          }
        }
      }),
      // merge the addition list with the list we want to add items in.
      map(addition => list.merge(addition))
    );
  }

  private processCustomItemAddition(item: CustomItem, amount: number): Observable<List> {
    const addition = new List();
    const itemClone = new CustomItem();
    Object.assign(itemClone, item);
    itemClone.amount = amount;
    itemClone.done = 0;
    itemClone.used = 0;
    itemClone.usePrice = true;
    itemClone.id = itemClone.$key;
    const added = addition.addToFinalItems(itemClone, this.lazyDataService.data);
    if (itemClone.requires.length > 0) {
      return addition.addCraft({
        _additions: [
          {
            amount: added,
            data: itemClone,
            item: null
          }
        ],
        customItems: this.customItemsSync,
        dataService: this.db,
        listManager: this,
        lazyDataService: this.lazyDataService
      });
    }
    return of(addition);
  }

  private processItemAddition(data: ListRow, amount: number, collectible: boolean, recipeId: string | number, gearsets: TeamcraftGearsetStats[]): Observable<List> {
    const crafted = getItemSource<CraftedBy[]>(data, DataType.CRAFTED_BY);
    const addition = new List();
    const toAdd: ListRow = new ListRow();
    // If this is a craft
    if (crafted.length > 0) {
      if (!recipeId) {
        const firstCraft = getCraftByPriority(crafted, gearsets);
        if (firstCraft.id !== undefined) {
          recipeId = firstCraft.id.toString();
        }
      }
      const craft = crafted.find(c => c.id.toString() === recipeId.toString());

      const ingredients = this.lazyDataService.getRecipeSync(craft.id).ingredients;
      const yields = collectible ? 1 : (craft.yield || 1);
      // Then we prepare the list row to add.
      Object.assign(toAdd, {
        id: data.id,
        icon: this.lazyDataService.data.itemIcons[data.id],
        amount: amount,
        done: 0,
        used: 0,
        yield: yields,
        recipeId: recipeId.toString(),
        requires: ingredients.map(ing => {
          return {
            id: ing.id,
            amount: ing.amount
          };
        }),
        craftedBy: crafted,
        usePrice: true
      });
    } else {
      const inspection = this.lazyDataService.data.hwdInspections.find(row => {
        return row.receivedItem === data.id;
      });
      if (inspection) {
        toAdd.requires = [{
          id: inspection.requiredItem,
          amount: 1,
          batches: inspection.amount
        }];
      }
      // If it's not a recipe, add as item
      Object.assign(toAdd, {
        id: data.id,
        icon: this.lazyDataService.data.itemIcons[data.id],
        amount: amount,
        done: 0,
        used: 0,
        yield: 1,
        usePrice: true
      });
    }

    Object.assign(toAdd, data);

    // We add the row to recipes.
    const added = addition.addToFinalItems(toAdd, this.lazyDataService.data);
    let addition$: Observable<List>;
    if (crafted.length > 0) {
      // Then we add the craft to the addition list.
      addition$ = addition.addCraft({
        _additions: [{
          item: toAdd,
          amount: added
        }],
        customItems: this.customItemsSync,
        dataService: this.db,
        listManager: this,
        lazyDataService: this.lazyDataService,
        recipeId: recipeId.toString(),
        gearsets: gearsets
      });
    } else {
      addition$ = of(addition);
    }
    return addition$.pipe(
      map(wipList => {
        return this.addDetails(wipList, recipeId);
      })
    );
  }

  public addDetails(list: List, recipeId?: string | number): List {
    list.forEach(item => {
      Object.assign(item, this.lazyDataService.getExtract(item.id));
      if (getItemSource<CraftedBy[]>(item, DataType.CRAFTED_BY).length > 0) {
        const craftedBy = item.sources.find(s => s.type === DataType.CRAFTED_BY);
        if (recipeId !== undefined && craftedBy.data.some(row => row.id.toString() === recipeId.toString())) {
          craftedBy.data = craftedBy.data.filter(row => {
            return row.id.toString() === recipeId.toString();
          });
        }
      }
    });
    return list;
  }

  public upgradeList(list: List): Observable<List> {
    const permissions = list.registry;
    const backup = [];
    if (list.finalItems.length === 0) {
      return of(list);
    }
    list.items.forEach(item => {
      backup.push({ array: 'items', item: { ...item } });
    });
    list.finalItems.forEach(item => {
      backup.push({ array: 'finalItems', item: { ...item } });
    });
    const add: Observable<List>[] = [];
    list.finalItems.forEach((recipe) => {
      add.push(this.addToList({
        itemId: recipe.id,
        list: list,
        recipeId: recipe.recipeId,
        amount: recipe.amount,
        collectible: false,
        ignoreHooks: true,
        upgradeCustom: true
      }));
    });
    list.items = [];
    list.finalItems = [];
    list.version = environment.version;
    return concat(...add)
      .pipe(
        // Only apply backup at last iteration, to avoid unnecessary slow process.
        skip(add.length - 1),
        map((resultList: List) => {
          backup.forEach(row => {
            const listRow = resultList[row.array].find(item => item.id === row.item.id || item.id === row.realItemId);
            if (listRow !== undefined) {
              listRow.$key = row.item.$key;
              if (row.item.comments !== undefined) {
                listRow.comments = row.item.comments;
              }
              listRow.done = row.item.done || 0;
              listRow.used = row.item.used || 0;
              listRow.requiredAsHQ = row.item.requiredAsHQ;
              if (getItemSource(row.item, DataType.CRAFTED_BY).length > 0) {
                if (listRow.done > listRow.amount) {
                  listRow.done = listRow.amount;
                }
              } else {
                if (listRow.done > listRow.amount_needed) {
                  listRow.done = listRow.amount_needed;
                }
              }
            }
          });
          resultList.updateAllStatuses();
          resultList.registry = permissions;
          return resultList;
        })
      );
  }
}
