import { Injectable, NgZone } from '@angular/core';
import { List } from './model/list';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { ListRow } from './model/list-row';
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

  public addToList(itemId: number | string, list: List, recipeId: string | number, amount = 1, collectible = false, ignoreHooks = false): Observable<List> {
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
    const dataSource$ = +itemId === itemId ? this.db.getItem(itemId) : of(this.customItemsSync.find(i => i.$key === itemId));
    return combineLatest(team$, dataSource$)
      .pipe(
        tap(([team, itemData]) => {
          if (team && team.webhook !== undefined && amount !== 0) {
            if (+itemId === itemId) {
              if (amount > 0) {
                this.discordWebhookService.notifyItemAddition(itemId, itemData.item.icon, amount, list, team);
              } else {
                this.discordWebhookService.notifyItemDeletion(itemId, itemData.item.icon, Math.abs(amount), list, team);
              }
            } else {
              if (amount > 0) {
                this.discordWebhookService.notifyCustomItemAddition(itemData.name, itemData.item.icon, amount, list, team);
              } else {
                this.discordWebhookService.notifyCustomItemDeletion(itemData.name, itemData.item.icon, Math.abs(amount), list, team);
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
            if (data.realItemId !== undefined) {
              return this.db.getItem(data.realItemId).pipe(
                switchMap(itemData => {
                  return this.processItemAddition(itemData, data.realItemId, amount, collectible, recipeId);
                }),
                catchError(() => {
                  return this.processCustomItemAddition(data as CustomItem, amount);
                }),
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
      ], this.gt, this.customItemsSync, this.db);
    }
    return of(addition);
  }

  private processItemAddition(data: ItemData, itemId: number, amount: number, collectible: boolean, recipeId: string | number): Observable<List> {
    const crafted = this.extractor.extractCraftedBy(+itemId, data);
    const addition = new List();
    const toAdd: ListRow = new ListRow();
    // If this is a craft
    if (data.isCraft()) {
      if (!recipeId) {
        recipeId = data.item.craft[0].toString();
      }
      const craft = data.getCraft(recipeId.toString());
      const ingredients: Ingredient[] = [];
      // We have to remove unused ingredient properties.
      craft.ingredients.forEach(i => {
        delete i.quality;
        delete i.stepid;
        delete i.part;
        delete i.phase;
      });
      craft.ingredients.forEach(req => {
        const requirementsRow = ingredients.find(row => row.id === req.id);
        if (requirementsRow === undefined) {
          ingredients.push(req);
        } else {
          requirementsRow.amount += req.amount;
        }
      });
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
        requires: ingredients,
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
      }], this.gt, this.customItemsSync, this.db, recipeId.toString());
    } else {
      addition$ = of(addition);
    }
    return addition$.pipe(
      map(additionToParse => {
        // Process items to add details.
        additionToParse.forEach(item => {
          if (data.isCraft() && recipeId !== undefined && data.item.id === item.id) {
            item.craftedBy = this.extractor.extractCraftedBy(item.id, data).filter(row => {
              return row.recipeId.toString() === recipeId.toString();
            });
          } else {
            item.craftedBy = this.extractor.extractCraftedBy(item.id, data);
          }
          item.vendors = this.extractor.extractVendors(item.id, data);
          item.tradeSources = this.extractor.extractTradeSources(item.id, data);
          item.reducedFrom = this.extractor.extractReducedFrom(item.id, data);
          item.desynths = this.extractor.extractDesynths(item.id, data);
          item.instances = this.extractor.extractInstances(item.id, data);
          item.gardening = this.extractor.extractGardening(item.id, data);
          item.voyages = this.extractor.extractVoyages(item.id, data);
          item.drops = this.extractor.extractDrops(item.id, data);
          item.ventures = this.extractor.extractVentures(item.id, data);
          item.gatheredBy = this.extractor.extractGatheredBy(item.id, data);
          item.alarms = this.extractor.extractAlarms(item.id, data, item);
          item.masterbooks = this.extractor.extractMasterBooks(item.id, data, item);
        });
        return addition;
      })
    );
  }

  public upgradeList(list: List): Observable<List> {
    const permissions = list.registry;
    const backup = [];
    list.items.forEach(item => {
      backup.push({ array: 'items', item: { ...item } });
    });
    list.finalItems.forEach(item => {
      backup.push({ array: 'finalItems', item: { ...item } });
    });
    const add: Observable<List>[] = [];
    list.finalItems.forEach((recipe) => {
      add.push(this.addToList(recipe.id, list, recipe.recipeId, recipe.amount, recipe.yield === 1, true));
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
              if (row.item.comments !== undefined) {
                listRow.comments = row.item.comments;
              }
              listRow.done = row.item.done || 0;
              listRow.used = row.item.used || 0;
              if (row.item.craftedBy !== undefined && row.item.craftedBy.length > 0) {
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
          resultList.registry = permissions;
          return resultList;
        })
      );
  }
}
