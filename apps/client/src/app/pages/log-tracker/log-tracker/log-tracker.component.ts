import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthFacade } from '../../../+state/auth.facade';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { TrackerComponent } from '../tracker-component';
import { NavigationObjective } from '../../../modules/map/navigation-objective';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WorldNavigationMapComponent } from '../../../modules/map/world-navigation-map/world-navigation-map.component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyLogTrackerPageData } from '@ffxiv-teamcraft/data/model/lazy-log-tracker-page-data';
import { AlarmDisplayPipe } from '../../../core/alarms/alarm-display.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { IngameStarsPipe } from '../../../pipes/pipes/ingame-stars.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { FishingLogTrackerComponent } from '../fishing-log-tracker/fishing-log-tracker.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-log-tracker',
    templateUrl: './log-tracker.component.html',
    styleUrls: ['./log-tracker.component.less'],
    standalone: true,
    imports: [NgIf, NzAlertModule, NzTabsModule, FlexModule, NzSwitchModule, FormsModule, NgFor, I18nNameComponent, NzToolTipModule, NzSpinModule, NzButtonModule, NzWaveModule, NzPopconfirmModule, NzIconModule, NzCheckboxModule, ItemIconComponent, ItemRarityDirective, NzGridModule, MapPositionComponent, NzDropDownModule, NzMenuModule, NzDividerModule, FishingLogTrackerComponent, AsyncPipe, I18nPipe, TranslateModule, TimerPipe, I18nRowPipe, IfMobilePipe, NodeTypeIconPipe, IngameStarsPipe, LazyIconPipe, JobUnicodePipe, AlarmDisplayPipe]
})
export class LogTrackerComponent extends TrackerComponent {

  private static PAGE_TABS = ['DoH', 'MIN-BTN', 'FSH'];

  public anonymousState$ = this.authFacade.loggedIn$.pipe(map(loggedIn => ({ isAnonymous: !loggedIn })));

  public dohTabs$ = this.lazyData.getEntry('logTrackerPageData').pipe(
    map(log => log.slice(0, 8))
  );

  public dolTabs$ = this.lazyData.getEntry('logTrackerPageData').pipe(
    map(log => log.slice(8, 12))
  );

  public userCompletion: { [index: number]: boolean } = {};

  public userGatheringCompletion: { [index: number]: boolean } = {};

  public dolSubTabIndex = 0;

  public dohSubTabIndex = 0;

  public type$: Observable<number>;

  public hideCompleted = this.settings.hideCompletedLogEntries;

  public showNotRequired = this.settings.showNotRequiredLogEntries;

  // { [recipeId]: itemId }
  public selectedRecipes: Record<number, number> = {};

  public selectedRecipesSize = 0;

  private lastSelectedTabIndex = -1;

  constructor(private authFacade: AuthFacade, private translate: TranslateService,
              private listPicker: ListPickerService,
              private router: Router, private route: ActivatedRoute,
              protected alarmsFacade: AlarmsFacade,
              private lazyData: LazyDataFacade, private dialog: NzModalService,
              public settings: SettingsService, private cdr: ChangeDetectorRef) {
    super(alarmsFacade);
    this.type$ = this.route.paramMap.pipe(
      map(params => {
        const type = params.get('type');
        // We have to +1 it because javascript evaluates 0 as false and we use it inside a *ngIf
        return LogTrackerComponent.PAGE_TABS.indexOf(type) + 1;
      })
    );
    combineLatest([this.authFacade.logTracking$, this.type$, this.dohTabs$, this.dolTabs$])
      .pipe(
        takeUntil(this.onDestroy$)
      )
      .subscribe(([logTracking, type, dohTabs, dolTabs]) => {
        this.userCompletion = {};
        this.userGatheringCompletion = {};
        logTracking.crafting.forEach(recipeId => {
          this.userCompletion[recipeId] = true;
        });
        logTracking.gathering.forEach(itemId => {
          this.userGatheringCompletion[itemId] = true;
        });
        if (this.hideCompleted) {
          this.updateSelectedPage(this.hideCompleted, this.showNotRequired, type, dohTabs, dolTabs);
        }
        this.cdr.markForCheck();
      });
  }

  private _dohSelectedPage = 0;

  public get dohSelectedPage(): number {
    return this._dohSelectedPage;
  }

  public set dohSelectedPage(index: number) {
    this._dohSelectedPage = index;
    this.selectedRecipes = {};
    this.selectedRecipesSize = 0;
  }

  private _dolSelectedPage = 0;

  public get dolSelectedPage(): number {
    return this._dolSelectedPage;
  }

  public set dolSelectedPage(index: number) {
    this._dolSelectedPage = index;
    this.selectedRecipes = {};
    this.selectedRecipesSize = 0;
  }

  public updateSelectedPage(hideCompleted: boolean, showNotRequired: boolean, selectedTabNumber: number, dohTabs: LazyLogTrackerPageData[][], dolTabs: LazyLogTrackerPageData[][], resetSelection = false): void {
    const selectedTabIndex = selectedTabNumber - 1;
    this.settings.hideCompletedLogEntries = hideCompleted;
    this.settings.showNotRequiredLogEntries = showNotRequired;
    const selectedSubTabIndex = [this.dohSubTabIndex, this.dolSubTabIndex][selectedTabIndex];
    if (selectedTabIndex === undefined || selectedSubTabIndex === undefined) {
      return;
    }
    const pages = [dohTabs, dolTabs][selectedTabIndex][selectedSubTabIndex];
    const selectedPageIndex = [this.dohSelectedPage, this.dolSelectedPage][selectedTabIndex];
    const isPageDone = [this.isDoHPageDone, this.isDoLPageDone][selectedTabIndex];
    if (pages) {
      const currentPage = pages[selectedPageIndex];
      if (currentPage && (showNotRequired || currentPage?.requiredForAchievement) && isPageDone(currentPage) && hideCompleted) {
        const nextUncompletedPage = [...pages.slice(selectedPageIndex), ...pages.slice(0, selectedPageIndex)].find(page => !isPageDone(page));
        if (selectedTabIndex === 0) {
          this.dohSelectedPage = nextUncompletedPage?.id;
        } else {
          this.dolSelectedPage = nextUncompletedPage?.id;
        }
      } else if (currentPage && this.lastSelectedTabIndex !== selectedTabIndex) {
        if (selectedTabIndex === 0) {
          this.dohSelectedPage = pages[0].id;
        } else {
          this.dolSelectedPage = pages[0].id;
        }
      }
    }
    this.lastSelectedTabIndex = selectedTabIndex;
    if (resetSelection) {
      this.selectedRecipes = {};
    }
  }

  public ensureCorrectDoLPageDisplayed(dolTab: any, currentPageIndex = 0, forceSet = false): void {
    if (dolTab === undefined) {
      return;
    }
    if (this.hideCompleted && this.isDoLPageDone(dolTab[currentPageIndex])) {
      const nextIncompletePage = [...dolTab.slice(currentPageIndex), ...dolTab.slice(0, currentPageIndex)].find(page => !this.isDoLPageDone(page));
      this.dolSelectedPage = nextIncompletePage.id;
    } else if (forceSet && this.dolSelectedPage !== dolTab[currentPageIndex].id) {
      this.dolSelectedPage = dolTab[currentPageIndex].id;
    }
  }

  public ensureCorrectDoHPageDisplayed(dohTab: any, currentPageIndex = 0, forceSet = false): void {
    if (dohTab === undefined) {
      return;
    }
    if (this.hideCompleted && this.isDoHPageDone(dohTab[currentPageIndex])) {
      const nextIncompletePage = [...dohTab.slice(currentPageIndex), ...dohTab.slice(0, currentPageIndex)].find(page => !this.isDoHPageDone(page));
      this.dohSelectedPage = nextIncompletePage.id;
    } else if (forceSet && this.dohSelectedPage !== dohTab[currentPageIndex].id) {
      this.dohSelectedPage = dohTab[currentPageIndex].id;
    }
  }

  public setType(index: number): void {
    this.router.navigate(['../', LogTrackerComponent.PAGE_TABS[index]], {
      relativeTo: this.route
    });
  }

  public setSelection(recipe: { itemId: number, recipeId: number }, selected: boolean): void {
    if (selected) {
      this.selectedRecipes[recipe.recipeId] = recipe.itemId;
    } else {
      delete this.selectedRecipes[recipe.recipeId];
    }
    this.selectedRecipesSize = Object.keys(this.selectedRecipes).length;
  }

  public createListForPage(page: any, limit?: number): void {
    let recipesToAdd = page.recipes.filter(recipe => !this.userCompletion[recipe.recipeId]);
    if (limit) {
      recipesToAdd = recipesToAdd.slice(0, limit);
    }
    this.createList(recipesToAdd.reduce((acc, r) => {
      return {
        ...acc,
        [r.recipeId]: r.itemId
      };
    }, {}));
  }

  public createList(selection: Record<number, number>): void {
    const recipesToAdd = Object.entries(selection);
    this.listPicker.addToList(...recipesToAdd.map(([recipeId, itemId]) => {
      return { id: +itemId, recipeId: recipeId, amount: 1 };
    }));
  }

  public getDohPageCompletion(page: any): string {
    return `${page.recipes.filter(recipe => this.userCompletion[recipe.recipeId]).length}/${page.recipes.length}`;
  }

  public getDolPageCompletion(page: any): string {
    return `${page.items.filter(item => this.userGatheringCompletion[item.itemId]).length}/${page.items.length}`;
  }

  public isDoLPageDone = (page: any) => {
    return !!page && page.items.filter(item => this.userGatheringCompletion[item.itemId]).length >= page.items.length;
  };

  public isDoHPageDone = (page: any) => {
    return !!page && page.recipes.filter(r => this.userCompletion[r.recipeId]).length >= page.recipes.length;
  };

  public getDolIcon(index: number): string {
    return [
      './assets/icons/Mineral_Deposit.png',
      './assets/icons/MIN.png',
      './assets/icons/Mature_Tree.png',
      './assets/icons/BTN.png'
    ][index];
  }

  public markDohAsDone(recipeId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('crafting', recipeId, done);
    this.userCompletion[recipeId] = done;
  }

  public markDolAsDone(itemId: number, done: boolean): void {
    this.authFacade.markAsDoneInLog('gathering', itemId, done);
    this.userGatheringCompletion[itemId] = done;
  }

  public markDohPageAsDone(page: any): void {
    page.recipes
      .filter(r => {
        return !this.userCompletion[r.recipeId];
      })
      .map(r => {
        this.authFacade.markAsDoneInLog('crafting', r.recipeId, true);
      });
  }

  public markDolPageAsDone(page: any): void {
    page.items
      .filter(i => {
        return !this.userGatheringCompletion[i.itemId];
      })
      .map(i => {
        this.authFacade.markAsDoneInLog('gathering', i.itemId, true);
      });
  }

  public showOptimizedMap(pages: LazyLogTrackerPageData[][], index: number): void {
    const steps = [...pages[index], ...pages[index + 1]].map(page => {
      return page.items
        .filter(item => !!item && !this.userGatheringCompletion[item.itemId])
        .map(item => {
          const node = item.nodes.find(n => !n.gatheringNode.limited && n.gatheringNode.x && n.gatheringNode.y && [index, index + 1].includes(n.gatheringNode.type))?.gatheringNode;
          if (node) {
            return <NavigationObjective>{
              mapId: node.map,
              zoneId: node.zoneId,
              iconid: null,
              item_amount: 1,
              name: this.lazyData.getI18nName('items', item.itemId),
              itemId: item.itemId,
              total_item_amount: 1,
              type: 'Gathering',
              x: node.x,
              y: node.y,
              gatheringType: node.type
            };
          }
        })
        .filter(step => !!step);
    }).flat();

    const ref = this.dialog.create({
      nzTitle: this.translate.instant('NAVIGATION.Title'),
      nzContent: WorldNavigationMapComponent,
      nzComponentParams: {
        points: steps
      },
      nzFooter: null
    });
    ref.afterOpen.pipe(
      switchMap(() => {
        return ref.getContentComponent().markAsDone$;
      }),
      takeUntil(ref.afterClose)
    ).subscribe(step => {
      this.markDolAsDone(step.itemId, true);
    });
  }

}
