import { Injectable, NgZone } from '@angular/core';
import { List } from './model/list';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { getCraftByPriority, ListRow } from './model/list-row';
import { DataService } from '../../core/api/data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { filter, first, map, skip, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { GarlandToolsService } from '../../core/api/garland-tools.service';
import { DiscordWebhookService } from '../../core/discord/discord-webhook.service';
import { TeamsFacade } from '../teams/+state/teams.facade';
import { environment } from '../../../environments/environment';
import { CraftedBySource, DataType, ExtractRow, Extracts, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { CraftedBy } from './model/crafted-by';
import { AuthFacade } from '../../+state/auth.facade';
import { TeamcraftGearsetStats } from '../../model/user/teamcraft-gearset-stats';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { ListController } from './list-controller';
import { Team } from '../../model/team/team';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';

export interface ListAdditionParams {
  itemId: number | string;
  list: List;
  recipeId: string | number;
  amount?: number;
  collectable?: boolean;
  ignoreHooks?: boolean;
  upgradeCustom?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ListManagerService {

  constructor(protected db: DataService,
              private gt: GarlandToolsService,
              protected i18n: I18nToolsService,
              private zone: NgZone,
              private discordWebhookService: DiscordWebhookService,
              private teamsFacade: TeamsFacade,
              private lazyData: LazyDataFacade,
              private authFacade: AuthFacade) {
  }

  public addToList({
                     itemId,
                     list,
                     recipeId,
                     amount = 1,
                     collectable = false,
                     ignoreHooks = false
                   }: ListAdditionParams): Observable<List> {
    let team$: Observable<Team | null> = of(null);
    if (list.teamId && !ignoreHooks) {
      this.teamsFacade.loadTeam(list.teamId);
      team$ = this.teamsFacade.allTeams$
        .pipe(
          map(teams => teams.find(team => list.teamId && team.$key === list.teamId)),
          filter(team => team !== undefined),
          first()
        );
    }
    return combineLatest([
      this.lazyData.getEntry('extracts'),
      this.lazyData.getRecipes()
    ]).pipe(
      switchMap(([extracts, recipes]) => {
        let itemSource: ExtractRow;
        if (typeof itemId === 'number') {
          itemSource = getExtract(extracts, itemId);
        } else if (itemId.startsWith('mjibuilding')) {
          itemSource = getExtract(extracts, +itemId.replace('mjibuilding-', ''));
        } else if (itemId.startsWith('mjilandmark')) {
          itemSource = getExtract(extracts, +itemId.replace('mjilandmark-', ''));
        }
        return team$.pipe(
          tap((team) => {
            if (team && team.webhook !== undefined && amount !== 0) {
              if (+itemId === itemId) {
                if (amount > 0) {
                  this.discordWebhookService.notifyItemAddition(itemId, amount, list, team);
                } else {
                  this.discordWebhookService.notifyItemDeletion(itemId, Math.abs(amount), list, team);
                }
              }
            }
          }),
          map(() => itemSource),
          withLatestFrom(this.authFacade.gearSets$),
          switchMap(([data, gearsets]) => {
            if (data === undefined) {
              return of(new List());
            }
            // If it's a standard item, add it with the classic implementation.
            return this.processItemAddition(data, amount, collectable, recipeId, gearsets, list.ignoreRequirementsRegistry, extracts, recipes);
          }),
          // merge the addition list with the list we want to add items in.
          map(addition => ListController.clean(ListController.merge(list, addition))),
          first()
        );
      })
    );
  }

  public addDetails(list: List, recipeId?: string | number): Observable<List> {
    return combineLatest([this.addDetailsForArray(list.items, recipeId), this.addDetailsForArray(list.finalItems, recipeId)]).pipe(
      map(([items, finalItems]) => {
        list.items = items;
        list.finalItems = finalItems;
        return list;
      })
    );
  }

  public upgradeList(list: List): Observable<List> {
    const permissions = list.registry;
    const backup = [];
    if (list.finalItems.length === 0) {
      return of(ListController.clean(list));
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
        recipeId: 0,
        amount: recipe.amount,
        collectable: recipe.collectable,
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
          ListController.updateAllStatuses(resultList);
          ListController.updateEtag(resultList);
          resultList.registry = permissions;
          return resultList;
        })
      );
  }

  private processItemAddition(data: ExtractRow, amount: number, collectable: boolean, recipeId: string | number, gearsets: TeamcraftGearsetStats[], ignoreRequirementsRegistry: Record<string, 1>,
                              extracts: Extracts, recipes: LazyData['recipes']): Observable<List> {
    const crafted = getItemSource<CraftedBy[]>(data, DataType.CRAFTED_BY);
    const list = new List();
    list.ignoreRequirementsRegistry = ignoreRequirementsRegistry;
    return of(new ListRow()).pipe(
      switchMap(listRow => {
        listRow.id = data.id;
        listRow.amount = amount;
        listRow.done = 0;
        listRow.used = 0;
        listRow.sources = data.sources;
        // If this is a craft
        if (crafted.length > 0) {
          if (!recipeId) {
            const firstCraft = getCraftByPriority(crafted, gearsets);
            if (firstCraft.id !== undefined) {
              recipeId = firstCraft.id.toString();
            }
          }
          const craft = crafted.find(c => c.id.toString() === recipeId.toString()) || crafted[0];

          const yields = collectable ? 1 : (craft.yield || 1);
          // Then we prepare the list row to add.
          return this.lazyData.getRecipe(craft.id).pipe(
            map(recipe => {
              const ingredients = recipe?.ingredients || [];
              listRow.yield = yields;
              listRow.collectable = collectable;
              listRow.recipeId = recipeId.toString();
              listRow.requires = ingredients.map(ing => {
                return {
                  id: ing.id,
                  amount: ing.amount
                };
              });
              return listRow;
            })
          );
        } else {
          const requirements = getItemSource(data, DataType.REQUIREMENTS);
          if (requirements.length > 0) {
            listRow.requires = requirements;
          }
          // If it's not a recipe, add as item
          return of(listRow);
        }
      }),
      map((listRow) => {
        // We add the row to recipes.
        const added = ListController.addToFinalItems(list, listRow);
        if (listRow.requires.length > 0) {
          return ListController.addCraft(list, {
            _additions: [{
              item: listRow,
              amount: added
            }],
            extracts: extracts,
            recipes: recipes,
            recipeId: recipeId?.toString(),
            gearsets: gearsets
          });
        } else {
          return list;
        }
      }),
      switchMap(wipList => this.addDetails(wipList, recipeId))
    );
  }

  private addDetailsForArray(array: ListRow[], recipeId?: string | number): Observable<ListRow[]> {
    return safeCombineLatest(array.map(item => {
      return this.lazyData.getRow('extracts', item.id).pipe(
        map(extract => {
          const newItem = { ...item, ...extract };
          if (getItemSource<CraftedBy[]>(extract, DataType.CRAFTED_BY).length > 0) {
            const craftedBy: CraftedBySource = { ...newItem.sources.find(s => s.type === DataType.CRAFTED_BY) as CraftedBySource };
            if (recipeId !== undefined && craftedBy.data.some(row => row.id.toString() === recipeId.toString())) {
              craftedBy.data = craftedBy.data.filter(row => {
                return row.id.toString() === recipeId.toString();
              });
            }
          }
          return newItem;
        })
      );
    }));
  }
}
