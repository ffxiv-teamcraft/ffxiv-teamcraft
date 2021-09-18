import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, combineLatest, concat, from, Observable, of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { debounceTime, filter, first, map, mergeMap, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import * as _ from 'lodash';
import { LazyRecipe } from '../../../core/data/lazy-recipe';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { Router } from '@angular/router';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { List } from '../../../modules/list/model/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClipboardImportPopupComponent } from '../clipboard-import-popup/clipboard-import-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { InventoryImportPopupComponent } from '../inventory-import-popup/inventory-import-popup.component';
import { InventoryItem } from '../../../model/user/inventory/inventory-item';
import { PlatformService } from '../../../core/tools/platform.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LogTracking } from '../../../model/user/log-tracking';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-recipe-finder',
  templateUrl: './recipe-finder.component.html',
  styleUrls: ['./recipe-finder.component.less']
})
export class RecipeFinderComponent implements OnDestroy {

  public maxLevel = this.env.maxLevel;

  private tipKey = 'recipe-finder:tip';

  public query: string;

  public onlyCraftable$ = new BehaviorSubject(this.settings.showOnlyCraftableInRecipeFinder);
  public onlyNotCompleted$ = new BehaviorSubject(this.settings.showOnlyNotCompletedInRecipeFinder);
  public onlyCollectables$ = new BehaviorSubject(this.settings.showOnlyCollectablesInRecipeFinder);
  public onlyLeveItems$ = new BehaviorSubject(this.settings.showOnlyLeveItemsInRecipeFinder);

  public clvlMin$ = new BehaviorSubject(0);
  public clvlMax$ = new BehaviorSubject(this.maxLevel);

  public input$: Subject<string> = new Subject<string>();

  public completion$: Observable<{ id: number, name: I18nName }[]> = this.input$.pipe(
    debounceTime(500),
    map(value => {
      if (value.length < 2) {
        return [];
      } else {
        return this.items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
      }
    })
  );

  private items: { id: number, name: I18nName }[] = [];

  public pool: { id: number, amount: number }[] = [];

  public search$: Subject<void> = new Subject<void>();

  public results$: Observable<any[]>;

  public highlight$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  public basket: { entry: any, amount: number, ingredients: { id: number, amount: number }[] }[] = [];

  public editingAmount: number;

  public showTip = localStorage.getItem(this.tipKey) === null;

  public page$: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  public pageSize = 25;

  public totalItems: number;

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private lazyData: LazyDataService, private translate: TranslateService,
              private i18n: I18nToolsService, private listsFacade: ListsFacade,
              private listManager: ListManagerService, private progressService: ProgressPopupService,
              private router: Router, private l12n: LocalizedDataService, private listPicker: ListPickerService,
              private notificationService: NzNotificationService, private message: NzMessageService,
              private dialog: NzModalService, private authFacade: AuthFacade,
              public platform: PlatformService, public settings: SettingsService,
              private env: EnvironmentService) {
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.data.items)
      .filter(key => +key > 19)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });
    this.pool = JSON.parse(localStorage.getItem('recipe-finder:pool') || '[]');
    const results$ = this.search$.pipe(
      switchMap(() => {
        return combineLatest([
          this.authFacade.gearSets$.pipe(first()),
          this.onlyCraftable$,
          this.onlyCollectables$,
          this.onlyNotCompleted$,
          this.onlyLeveItems$,
          this.clvlMin$,
          this.clvlMax$
        ]);
      }),
      withLatestFrom(this.authFacade.logTracking$.pipe(startWith(<LogTracking>null))),
      map(([[sets, onlyCraftable, onlyCollectables, onlyNotCompleted, onlyLeveItems, clvlMin, clvlMax], logTracking]: any[]) => {
        this.settings.showOnlyCraftableInRecipeFinder = onlyCraftable;
        this.settings.showOnlyCollectablesInRecipeFinder = onlyCollectables;
        this.settings.showOnlyNotCompletedInRecipeFinder = onlyNotCompleted;
        this.settings.showOnlyLeveItemsInRecipeFinder = onlyLeveItems;
        const possibleEntries = [];
        for (const item of this.pool) {
          possibleEntries.push(...(this.lazyData.data.recipesIngredientLookup.searchIndex[item.id] || [])
            .map(id => this.lazyData.data.recipesIngredientLookup.recipes[id])
            .filter(entry => {
              let canBeAdded = true;
              if (onlyNotCompleted) {
                canBeAdded = !logTracking || !logTracking.crafting.includes(entry.recipeId);
              }
              const ingredientEntry = entry.ingredients.find(ingredient => ingredient.id === item.id);
              return canBeAdded && ingredientEntry.amount <= item.amount;
            }));
        }
        const uniquified = _.uniqBy(possibleEntries, 'recipeId');
        // Now that we have all possible recipes, let's filter and rate them
        const finalEntries = uniquified.map(entry => {
          const jobSet = sets.find(set => entry.job === set.jobId);
          entry.missingLevel = jobSet === undefined || jobSet.level < entry.lvl;
          entry.missing = entry.ingredients
            // Ignore crystals
            .filter(i => i.id > 19)
            .filter(i => {
              const poolItem = this.pool.find(item => item.id === i.id);
              return !poolItem || poolItem.amount < i.amount;
            });
          entry.possibleAmount = entry.yields;
          while (this.canCraft(entry, entry.possibleAmount)) {
            entry.possibleAmount += entry.yields;
          }
          // Remove the final iteration check
          entry.possibleAmount -= entry.yields;
          return entry;
        });
        return [
          finalEntries
            .filter(entry => {
              let match = !onlyCraftable || !entry.missingLevel;
              if (onlyCollectables) {
                match = match && this.lazyData.data.collectables[entry.itemId]?.collectable === 1;
              }
              return match && (entry.lvl >= clvlMin && entry.lvl <= clvlMax);
            })
            .sort((a, b) => {
              const missingDiff = a.missing.length - b.missing.length;
              if (missingDiff !== 0) {
                return missingDiff;
              }
              if (a.missingLevel && !b.missingLevel) {
                return 1;
              }
              if (b.missingLevel && !a.missingLevel) {
                return -1;
              }
              const jobDiff = a.job - b.job;
              if (jobDiff !== 0) {
                return jobDiff;
              }
              return a.lvl - b.lvl;
            }),
          onlyLeveItems
        ];
      }),
      tap(([entries]) => {
        this.totalItems = entries.length;
      }),
      map(([entries, onlyLeveItems]) => {
        const withLeves = entries.map(entry => {
          entry.leves = this.lazyData.getItemLeveIds(entry.itemId);
          return entry;
        });
        if (onlyLeveItems) {
          return withLeves.filter(entry => entry.leves?.length > 0);
        }
        return withLeves;
      }),
      shareReplay(1)
    );
    this.results$ = combineLatest([results$, this.page$]).pipe(
      map(([results, page]) => {
        const start = (page - 1) * this.pageSize;
        return results.slice(start, start + this.pageSize);
      })
    );
  }

  public canCraft(entry: any, amount: number): boolean {
    const allAvailableIngredients = entry.ingredients.filter(i => this.pool.some(item => i.id === item.id));
    const neededIngredients = allAvailableIngredients
      // Ignore crystals
      .filter(i => i.id > 19)
      .map(i => {
        return {
          ...i,
          amount: i.amount * amount / entry.yields
        };
      });
    return !neededIngredients.some(i => {
      const poolItem = this.pool.find(item => item.id === i.id);
      return poolItem.amount < i.amount;
    });
  }

  public isButtonDisabled(name: string, amount: number): boolean {
    return amount <= 0 || !this.items.some(i => this.i18n.getName(i.name).toLowerCase() === name.toLowerCase());
  }

  public importFromClipboard(): void {
    from((<any>navigator).clipboard.readText())
      .pipe(
        map((text: string) => JSON.parse(text)),
        switchMap(items => {
          return this.dialog.create({
            nzTitle: this.translate.instant('RECIPE_FINDER.Import_from_clipboard'),
            nzContent: ClipboardImportPopupComponent,
            nzComponentParams: {
              items: items
            },
            nzFooter: null
          }).afterClose;
        }),
        filter(items => {
          return items && items.length > 0;
        })
      )
      .subscribe(items => {
        items.forEach(item => {
          this.addToPool(item.id, item.amount, true);
        });
      }, error => {
        console.error(error);
        this.message.error(this.translate.instant('RECIPE_FINDER.Clipboard_content_malformed'), {
          nzDuration: 3000
        });
      });
  }

  importFromInventory(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('RECIPE_FINDER.Import_from_inventory'),
      nzContent: InventoryImportPopupComponent,
      nzFooter: null
    }).afterClose
      .pipe(
        filter(res => res)
      )
      .subscribe((items: InventoryItem[]) => {
        items.forEach(item => {
          this.addToPool(item.itemId, item.quantity, true);
        });
      });
  }

  public clearPool(): void {
    this.pool = [];
    this.savePool();
  }

  public getPoolJSON = () => {
    return JSON.stringify(this.pool);
  };

  public sortPool(): void {
    this.pool = this.pool.sort((a, b) => {
      return this.i18n.getName(this.l12n.getItem(a.id)) > this.i18n.getName(this.l12n.getItem(b.id)) ? 1 : -1;
    });
  }

  closedTip(): void {
    localStorage.setItem(this.tipKey, 'true');
  }

  onInput(value: string): void {
    this.input$.next(value);
  }

  editAmount(id: number) {
    this.editingAmount = id;
  }

  saveAmount(id: number, newAmount: number): void {
    if (newAmount <= 0) {
      this.removeFromPool(id, newAmount, true);
      return;
    }
    delete this.editingAmount;
    this.pool = this.pool.map(item => {
      if (item.id === id) {
        return {
          ...item,
          amount: newAmount
        };
      }
      return item;
    });
    this.savePool();
  }

  addToPool(input: string | number, amount: number, cumulative = false): void {
    let item;
    if (input.toString() === input) {
      item = this.items.find(i => this.i18n.getName(i.name).toLowerCase() === input.toLowerCase());
    } else {
      item = this.items.find(i => i.id === input);
    }
    if (!item || (!cumulative && this.pool.some(i => i.id === item.id))) {
      return;
    }
    const poolEntry = this.pool.find(i => i.id === item.id);
    if (poolEntry === undefined) {
      this.pool = [
        { id: item.id, amount: amount },
        ...this.pool
      ];
    } else {
      poolEntry.amount += amount;
      this.pool = this.pool.map(i => {
        if (i.id === item.id) {
          return poolEntry;
        }
        return i;
      });
    }
    this.savePool();
  }

  removeFromPool(itemId: number, amount: number, save = false): void {
    const poolEntry = this.pool.find(i => i.id === itemId);
    if (!poolEntry) {
      return;
    }
    if (poolEntry.amount <= amount) {
      this.pool = this.pool.filter(i => i.id !== itemId);
    } else {
      poolEntry.amount -= amount;
      this.pool = this.pool.map(i => {
        if (i.id === itemId) {
          return poolEntry;
        }
        return i;
      });
    }
    if (save) {
      this.savePool();
    }
  }

  generateList(): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = this.basket.map(row => {
          return this.listManager.addToList({
            itemId: +row.entry.itemId,
            list: list,
            recipeId: row.entry.recipeId,
            amount: row.amount,
            collectable: false
          });
        });
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          this.basket.length,
          'Adding_recipes',
          { amount: this.basket.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt.toMillis() === list.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.itemsAdded = this.basket.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
      this.basket = [];
      this.savePool();
    });
  }

  addToBasket(entry: any, amount: number): void {
    const newEntry = {
      entry: entry,
      amount: amount,
      ingredients: entry.ingredients
        .map(ingredient => {
          const poolItem = this.pool.find(item => item.id === ingredient.id);
          if (poolItem === undefined) {
            return undefined;
          } else {
            return {
              id: poolItem.id,
              amount: ingredient.amount * amount / entry.yields
            };
          }
        })
        .filter(item => item !== undefined)
    };
    this.basket = [
      ...this.basket,
      newEntry
    ];
    if (this.settings.addResultToPoolInRecipeFinder) {
      this.addToPool(entry.itemId, amount);
    }
    newEntry.ingredients.forEach(ingredient => {
      this.removeFromPool(ingredient.id, ingredient.amount);
    });
    this.search$.next();
  }

  removeFromBasket(row: { entry: any, amount: number, ingredients: { id: number, amount: number }[] }): void {
    this.basket = this.basket.filter(item => {
      return item.entry.recipeId !== row.entry.recipeId;
    });
    row.ingredients.forEach(ingredient => {
      this.addToPool(ingredient.id, ingredient.amount, true);
    });
    if (this.settings.addResultToPoolInRecipeFinder) {
      this.removeFromPool(row.entry.itemId, row.amount);
    }
    this.search$.next();
  }

  public highlight(recipe: LazyRecipe): void {
    if (recipe) {
      this.highlight$.next(recipe.ingredients.map(i => i.id));
    } else {
      this.highlight$.next([]);
    }
  }

  private savePool(): void {
    localStorage.setItem('recipe-finder:pool', JSON.stringify(this.pool));
  }

  ngOnDestroy(): void {
    this.savePool();
  }

}
