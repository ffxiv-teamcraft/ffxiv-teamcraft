import { Injectable, NgZone } from '@angular/core';
import { List } from './model/list';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { ListRow } from './model/list-row';
import { DataService } from '../../core/api/data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { Ingredient } from '../../model/garland-tools/ingredient';
import { DataExtractorService } from './data/data-extractor.service';
import { filter, first, map, skip, tap } from 'rxjs/operators';
import { GarlandToolsService } from '../../core/api/garland-tools.service';
import { ItemData } from '../../model/garland-tools/item-data';
import { DiscordWebhookService } from '../../core/discord/discord-webhook.service';
import { TeamsFacade } from '../teams/+state/teams.facade';
import { Team } from '../../model/team/team';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListManagerService {

  constructor(protected db: DataService,
              private gt: GarlandToolsService,
              protected i18n: I18nToolsService,
              private extractor: DataExtractorService,
              private zone: NgZone,
              private discordWebhookService: DiscordWebhookService,
              private teamsFacade: TeamsFacade) {
  }

  public addToList(itemId: number, list: List, recipeId: string | number, amount = 1, collectible = false, ignoreHooks = false): Observable<List> {
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
    return combineLatest(team$, this.db.getItem(itemId))
      .pipe(
        tap(([team, itemData]) => {
          if (team && team.webhook !== undefined && amount !== 0) {
            if (amount > 0) {
              this.discordWebhookService.notifyItemAddition(itemId, itemData.item.icon, amount, list, team);
            } else {
              this.discordWebhookService.notifyItemDeletion(itemId, itemData.item.icon, Math.abs(amount), list, team);
            }
          }
        }),
        map(([, data]: [Team, ItemData]) => {
          const crafted = this.extractor.extractCraftedBy(+itemId, data);
          const addition = new List();
          let toAdd: ListRow;
          // If this is a craft
          if (data.isCraft()) {
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
            toAdd = {
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
            };
          } else {
            // If it's not a recipe, add as item
            toAdd = {
              id: data.item.id,
              icon: data.item.icon,
              amount: amount,
              done: 0,
              used: 0,
              yield: 1,
              usePrice: true
            };
          }
          // We add the row to recipes.
          const added = addition.addToFinalItems(toAdd);

          if (data.isCraft()) {
            // Then we add the craft to the addition list.
            addition.addCraft([{
              item: data.item,
              data: data,
              amount: added
            }], this.gt, this.i18n, recipeId.toString());
          }
          // Process items to add details.
          addition.forEach(item => {
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
          // Return the addition for the next chain element.
          return addition;
        }),
        // merge the addition list with the list we want to add items in.
        map(addition => list.merge(addition))
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
            const listRow = resultList[row.array].find(item => item.id === row.item.id);
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
