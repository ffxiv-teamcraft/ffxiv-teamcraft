import { Injectable, NgZone } from '@angular/core';
import { List } from './model/list';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { ListRow, getItemSource } from './model/list-row';
import { DataService } from '../../core/api/data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { Ingredient } from '../../model/garland-tools/ingredient';
import { DataExtractorService } from './data/data-extractor.service';
import { catchError, filter, first, map, skip, switchMap, tap } from 'rxjs/operators';
import { GarlandToolsService } from '../../core/api/garland-tools.service';
import { ItemData } from '../../model/garland-tools/item-data';
import { DiscordWebhookService } from '../../core/discord/discord-webhook.service';
import { TeamsFacade } from '../teams/+state/teams.facade';
import { Team } from '../../model/team/team';
import { environment } from '../../../environments/environment';
import { CustomItemsFacade } from '../custom-items/+state/custom-items.facade';
import { CustomItem } from '../custom-items/model/custom-item';
import { DataType } from './data/data-type';

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
              private customItemsFacade: CustomItemsFacade) {

    this.customItemsFacade.loadAll();
    this.customItemsFacade.allCustomItems$.subscribe(items => this.customItemsSync = items);

  }

  public addToList(itemId: number | string, list: List, recipeId: string | number, amount = 1, collectible = false, ignoreHooks = false, upgradeCustom = false): Observable<List> {
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
    const dataSource$ = +itemId === itemId ? this.db.getItem(itemId).pipe(catchError(() => of(undefined))) : of(this.customItemsSync.find(i => i.$key === itemId));
    return combineLatest([team$, dataSource$])
      .pipe(
        tap(([team, itemData]) => {
          if (team && team.webhook !== undefined && amount !== 0) {
            if (+itemId === itemId) {
              if (amount > 0) {
                this.discordWebhookService.notifyItemAddition(itemId, amount, list, team);
              } else {
                this.discordWebhookService.notifyItemDeletion(itemId, Math.abs(amount), list, team);
              }
            } else {
              if (amount > 0) {
                this.discordWebhookService.notifyCustomItemAddition((<CustomItem>itemData).name, (<ItemData>itemData).item.id, amount, list, team);
              } else {
                this.discordWebhookService.notifyCustomItemDeletion((<CustomItem>itemData).name, (<ItemData>itemData).item.id, Math.abs(amount), list, team);
              }
            }
          }
        }),
        switchMap(([, data]: [Team, ItemData | CustomItem]) => {
          if (data === undefined) {
            return of(new List());
          }
          // If it's a standard item, add it with the classic implementation.
          if (data instanceof ItemData) {
            return this.processItemAddition(data, +itemId, amount, collectible, recipeId);
          } else {
            if (data.realItemId !== undefined && upgradeCustom) {
              return this.db.getItem(data.realItemId).pipe(
                switchMap(itemData => {
                  return this.processItemAddition(itemData, data.realItemId, amount, collectible, recipeId);
                }),
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
    const added = addition.addToFinalItems(itemClone);
    if (itemClone.requires.length > 0) {
      return addition.addCraft([
        {
          amount: added,
          data: itemClone,
          item: null
        }
      ], this.gt, this.customItemsSync, this.db, this);
    }
    return of(addition);
  }

  private processItemAddition(data: ItemData, itemId: number, amount: number, collectible: boolean, recipeId: string | number): Observable<List> {
    const crafted = this.extractor.extract(DataType.CRAFTED_BY, +itemId, data);
    const addition = new List();
    const toAdd: ListRow = new ListRow();
    // If this is a craft
    if (data.isCraft()) {
      if (!recipeId) {
        const firstCraft = data.item.craft[0];
        if (firstCraft.id !== undefined) {
          recipeId = firstCraft.id.toString();
        } else {
          recipeId = data.item.craft[0].toString();
        }
      }
      const craft = data.getCraft(recipeId.toString());
      // We have to remove unused ingredient properties.
      craft.ingredients.forEach(i => {
        delete i.quality;
        delete i.stepid;
        delete i.part;
        delete i.phase;
      });
      craft.ingredients = craft.ingredients.reduce((uniq: Ingredient[], ing) => {
        const row = uniq.find(r => r.id === ing.id);
        if (row === undefined) {
          uniq.push(ing);
          return uniq;
        }
        row.amount += ing.amount;
        return uniq;
      }, []);
      const yields = collectible ? 1 : (craft.yield || 1);
      // Then we prepare the list row to add.
      Object.assign(toAdd, {
        id: data.item.id,
        icon: data.item.icon,
        amount: amount,
        done: 0,
        used: 0,
        yield: yields,
        recipeId: recipeId.toString(),
        requires: craft.ingredients,
        craftedBy: crafted,
        usePrice: true
      });
    } else {
      // If it's not a recipe, add as item
      Object.assign(toAdd, {
        id: data.item.id,
        icon: data.item.icon,
        amount: amount,
        done: 0,
        used: 0,
        yield: 1,
        usePrice: true
      });
    }
    // We add the row to recipes.
    const added = addition.addToFinalItems(toAdd);
    let addition$: Observable<List>;
    if (data.isCraft()) {
      // Then we add the craft to the addition list.
      addition$ = addition.addCraft([{
        item: data.item,
        data: data,
        amount: added
      }], this.gt, this.customItemsSync, this.db, this, recipeId.toString());
    } else {
      addition$ = of(addition);
    }
    return addition$.pipe(
      map(wipList => {
        return this.addDetails(wipList, data, recipeId);
      })
    );
  }

  public addDetails(list: List, data: ItemData, recipeId?: string | number): List {
    list.forEach(item => {
      // If it's not inside data and it isn't a crystal, we can already skip.
      if (item.id > 20 && data.item.id !== item.id && !data.ingredients.some(i => i.id === item.id)) {
        return;
      }
      item = this.extractor.addDataToItem(item, data);
      if (data.isCraft()) {
        const craftedBy = item.sources.find(s => s.type === DataType.CRAFTED_BY);
        if (recipeId !== undefined && data.item.id === item.id) {
          craftedBy.data = craftedBy.data.filter(row => {
            return row.recipeId.toString() === recipeId.toString();
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
      add.push(this.addToList(recipe.id, list, recipe.recipeId, recipe.amount, false, true, true));
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
