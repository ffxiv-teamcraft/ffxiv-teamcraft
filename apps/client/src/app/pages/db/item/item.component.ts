import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { filter, first, map, mergeMap, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { DataType, getItemSource, SearchResult, TripleTriadDuel } from '@ffxiv-teamcraft/types';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { ListRow } from '../../../modules/list/model/list-row';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { UsedForType } from '../model/used-for-type';
import { ATTTService } from '../service/attt.service';
import { ItemContextService } from '../service/item-context.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { LazyItemsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-items-database-page';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { IngameStarsPipe } from '../../../pipes/pipes/ingame-stars.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { QuestsComponent } from '../../../modules/item-details/quests/quests.component';
import { AchievementsComponent } from '../../../modules/item-details/achievements/achievements.component';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { VenturesComponent } from '../../../modules/item-details/ventures/ventures.component';
import { VoyagesComponent } from '../../../modules/item-details/voyages/voyages.component';
import { VendorsComponent } from '../../../modules/item-details/vendors/vendors.component';
import { DesynthsComponent } from '../../../modules/item-details/desynth/desynths.component';
import { ReducedFromComponent } from '../../../modules/item-details/reduced-from/reduced-from.component';
import { InstancesComponent } from '../../../modules/item-details/instances/instances.component';
import { GatheredByComponent } from '../../../modules/item-details/gathered-by/gathered-by.component';
import { MogstationComponent } from '../../../modules/item-details/mogstation/mogstation.component';
import { FatesComponent } from '../../../modules/item-details/fates/fates.component';
import { TreasuresComponent } from '../../../modules/item-details/treasures/treasures.component';
import { TradesComponent } from '../../../modules/item-details/trades/trades.component';
import { IslandAnimalComponent } from '../../../modules/item-details/island-animal/island-animal.component';
import { HuntingComponent } from '../../../modules/item-details/hunting/hunting.component';
import { GardeningComponent } from '../../../modules/item-details/gardening/gardening.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { LazyScrollComponent } from '../../../modules/lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FishComponent } from '../fish/fish.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { MarketboardIconComponent } from '../../../modules/marketboard/marketboard-icon/marketboard-icon.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgTemplateOutlet, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, ItemRarityDirective, I18nNameComponent, DbButtonComponent, NzButtonModule, NzInputModule, FormsModule, NzWaveModule, NzToolTipModule, NzIconModule, NgFor, MarketboardIconComponent, RouterLink, I18nDisplayComponent, FishComponent, NzDividerModule, FullpageMessageComponent, NzCardModule, LazyScrollComponent, ItemIconComponent, NzTableModule, NzListModule, NgSwitch, NgSwitchCase, GardeningComponent, HuntingComponent, IslandAnimalComponent, TradesComponent, TreasuresComponent, FatesComponent, MogstationComponent, GatheredByComponent, InstancesComponent, ReducedFromComponent, DesynthsComponent, VendorsComponent, VoyagesComponent, VenturesComponent, MapPositionComponent, AchievementsComponent, QuestsComponent, DbCommentsComponent, NgTemplateOutlet, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, IfMobilePipe, NodeTypeIconPipe, XivapiIconPipe, IngameStarsPipe, LazyIconPipe, JobUnicodePipe, LazyRowPipe]
})
export class ItemComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {
  public noData = false;

  public readonly itemId$ = combineLatest([this.route.paramMap, this.itemContext.itemId$]).pipe(
    filter(([paramMap, itemId]) => !!paramMap.get('slug') && itemId >= 0),
    map(([_, itemId]) => itemId)
  );

  public readonly lazyItem$ = this.itemId$.pipe(
    switchMap((itemId) => {
      return this.lazyData.getRow('itemsDatabasePages', itemId);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly data$: Observable<ListRow> = combineLatest([this.lazyItem$, this.authFacade.logTracking$.pipe(startWith(null))]).pipe(
    switchMap(([item, logTracking]) => {
      return this.lazyData.getRow('extracts', item.id).pipe(
        switchMap((item: any) => {
          item.canBeGathered = getItemSource(item, DataType.GATHERED_BY).type !== undefined;
          if (item.canBeGathered) {
            item.isDoneInLog = logTracking?.gathering.includes(item.id);
          }
          return this.handleAdditionalData(item, item);
        })
      );
    }),
    map(data => {
      if (data.id > 1 && data.id < 19) {
        data.sources = data.sources.filter(s => ![DataType.DESYNTHS].includes(s.type));
      }
      return data;
    }),
    tap((item) => {
      this.noData = item.sources.length === 0;
    })
  );

  public readonly usedFor$: Observable<any> = this.lazyItem$.pipe(
    switchMap((item) => {
      if (item.searchCategory === 30) {
        return this.apollo
          .query<any>({
            query: gql`
        query fishData {
          baits_per_fish(where: {baitId: {_eq: ${item.id}}, occurences: {_gt: 5}}) {
            itemId
          }
        }
        `
          })
          .pipe(
            map((result) => {
              (item as any).BaitInfo = result.data.baits_per_fish.filter((row) => row.itemId > 0);
              return item;
            })
          );
      }
      return of(item);
    }),
    map((item) => {
      const usedFor = [];
      // Ex: Iron ore
      if (item.ingredientFor) {
        usedFor.push({
          type: UsedForType.CRAFT,
          flex: '1 1 auto',
          title: 'DB.Crafts',
          icon: './assets/icons/classjob/blacksmith.png',
          links: item.ingredientFor
        });
      }
      // Ex: Harbor Herring
      if ((item as any).BaitInfo !== undefined && (item as any).BaitInfo.length > 0) {
        usedFor.push({
          type: UsedForType.FISH_BAIT,
          flex: '1 1 auto',
          title: 'DB.FISH.Bait',
          icon: './assets/icons/classjob/fisher.png',
          links: (item as any).BaitInfo.map((row) => {
            return {
              itemId: +row.itemId
            };
          })
        });
      }
      // Ex: bog sage
      if (item.reductions) {
        usedFor.push({
          type: UsedForType.REDUCTION,
          flex: '1 1 auto',
          title: 'DB.Reduces_to',
          icon: './assets/icons/Reduce.png',
          links: item.reductions.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      if (item.collectable !== undefined) {
        if (item.collectable.hwd) {
          // Ex: Skybuilders' Pedestal
          usedFor.push({
            type: UsedForType.ISHGARD_RESTORATION,
            flex: '1 1 auto',
            title: 'DB.Ishgard_restoration',
            icon: './assets/icons/status/collectors_glove.png',
            ishgardRestoration: item.collectable
          });
        } else {
          // Ex: Connoisseur's Chair
          usedFor.push({
            type: UsedForType.ROWENA_SPLENDOR,
            flex: '1 1 auto',
            title: 'DB.Rowena_splendor',
            icon: './assets/icons/status/collectors_glove.png',
            masterpiece: item.collectable
          });
        }
      }
      if (item.desynths) {
        // Ex: Shadeshifter
        usedFor.push({
          type: UsedForType.DESYNTH,
          flex: '1 1 auto',
          title: 'DB.Desynths_to',
          icon: './assets/icons/desynth.png',
          links: item.desynths.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      if (item.action === 1389) {
        // Ex: Susano Card
        usedFor.push({
          flex: '0 0 auto',
          type: UsedForType.TT_CARD_UNLOCK,
          title: 'DB.TT_card_unlock',
          icon: 'https://triad.raelys.com/images/logo.png',
          cardId: item.actionData
        });
      }
      if (item.tradeEntries) {
        // Ex: Irregular Tomestone of Pageantry
        usedFor.push({
          flex: '1 1 auto',
          type: UsedForType.TRADES,
          title: 'DB.Used_for_trades',
          icon: './assets/icons/Shop.png',
          trades: item.tradeEntries
        });
      }
      if (item.loots) {
        //Ex: Idealized Chest Gear Coffer (IL 480)
        usedFor.push({
          type: UsedForType.CAN_CONTAIN_ITEMS,
          flex: '1 1 auto',
          title: 'DB.Can_contain_items',
          icon: './assets/icons/chest_open.png',
          links: item.loots.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      if (item.usedForLeves) {
        // Ex: Iron Ingot
        usedFor.push({
          type: UsedForType.LEVES,
          flex: '1 1 auto',
          title: 'DB.Leves',
          icon: './assets/icons/leve.png',
          leves: item.usedForLeves.map((leve) => {
            return {
              leveId: leve.leve,
              amount: leve.amount,
              level: leve.lvl,
              job: leve.classJob - 1
            };
          })
        });
      }
      if (item.usedInQuests) {
        // Ex: Almace (Item#13223)
        usedFor.push({
          type: UsedForType.QUEST,
          flex: '1 1 auto',
          title: 'Quests',
          icon: './assets/icons/quest.png',
          quests: item.usedInQuests
        });
      }
      if (item.supply) {
        // Ex: Integral Fishing Rod
        usedFor.push({
          type: UsedForType.SUPPLY,
          flex: '1 1 auto',
          title: 'DB.GC_Delivery',
          icon: './assets/icons/supply.png',
          supply: item.supply
        });
      }
      if (item.recipesUnlock) {
        // Ex: Master Culinarian II
        usedFor.push({
          type: UsedForType.UNLOCKS,
          flex: '1 1 auto',
          title: 'DB.Unlocks',
          icon: './assets/icons/unlocks.png',
          links: item.recipesUnlock.map((recipe) => {
            return {
              itemId: recipe.itemId,
              recipes: [recipe]
            };
          })
        });
      }
      if (item.nodesUnlock) {
        // Ex: Tome of Botanical Folklore - Dravania
        // Ex: Tome of Ichthyological Folklore - Coerthas
        usedFor.push({
          type: UsedForType.UNLOCKS,
          flex: '1 1 auto',
          title: 'DB.Unlocks',
          icon: './assets/icons/unlocks.png',
          links: item.nodesUnlock.map((itemId) => {
            return {
              itemId
            };
          })
        });
      }
      return usedFor;
    })
  );

  public readonly links$: Observable<{ title: string; icon: string; url: string }[]> = combineLatest([this.lazyItem$, this.data$]).pipe(
    map(([item, listRow]) => {
      const links = [
        {
          title: 'GarlandTools',
          url: `https://www.garlandtools.org/db/#item/${item.id}`,
          icon: 'https://garlandtools.org/favicon.png'
        },
        {
          title: 'Gamer Escape',
          url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(item.name.en.toString().split(' ').join('_'))}`,
          icon: './assets/icons/ge.png'
        }
      ];
      if (item.trade) {
        links.push({
          title: 'Universalis',
          icon: 'https://universalis.app/i/universalis/universalis.png',
          url: `https://universalis.app/market/${item.id}`
        });
        links.push({
          title: 'Saddlebag Exchange',
          icon: 'https://saddlebagexchange.com/images/tiny-chocobo.png',
          url: `https://saddlebagexchange.com/queries/item-data/${item.id}`
        });
      }
      const gardening = getItemSource(listRow, DataType.GARDENING);
      if (Number.isInteger(gardening)) {
        links.push({
          title: 'FFXIV Gardening',
          icon: './assets/icons/Gardening.png',
          url: `http://www.ffxivgardening.com/seed-details.php?SeedID=${gardening}${this.translate.currentLang === 'en' ? '' : ('&lang=' + this.translate.currentLang + '_' + this.translate.currentLang.toUpperCase())}`
        });
      }
      if (item.action === 1389) {
        links.push({
          title: 'Another Triple Triad Tracker',
          icon: 'https://triad.raelys.com/images/logo.png',
          url: `https://triad.raelys.com/cards/${item.additionalData}`
        });
      }
      if (item.action) {
        if (item.action === 1322) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/mounts/${item.actionData}`
          });
        }
        if (item.action === 853) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/minions/${item.actionData}`
          });
        }
        if (item.action === 5845) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/orchestrions/${item.actionData}`
          });
        }
        if (item.action === 2633 && item.name.en.indexOf('Ballroom Etiquette') > -1) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/emotes/${item.actionData}`
          });
        }
        if (item.action === 2633 && item.name.en.indexOf('Modern Aesthetics') > -1) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/hairstyles/${item.actionData}`
          });
        }
        if (item.action === 1013) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/bardings/${item.actionData}`
          });
        }
      }
      return links;
    })
  );

  public readonly mainAttributes$: Observable<any[]> = this.lazyItem$.pipe(
    map((item) => {
      const mainAttributes = [];
      if (item.cjc) {
        mainAttributes.push({
          name: 'DB.Class_job',
          value: this.lazyData.getI18nName('jobCategories', item.cjc),
          valueRequiresPipe: true
        });
      }
      mainAttributes.push({
        name: 'TOOLTIP.Level',
        value: item.elvl
      });
      mainAttributes.push({
        name: 'TOOLTIP.Ilvl',
        value: item.ilvl
      });
      if (item.cjUse) {
        mainAttributes.push({
          name: 'DB.Delay',
          value: item.delay
        });
        mainAttributes.push({
          name: 'DB.Auto',
          value: Math.floor((item.pDmg * item.delay) / 30) / 100,
          valueHq: Math.floor(((item.pDmg + item.bpSpecial[0]) * item.delay) / 30) / 100
        });
      }
      // If the item has some damage, handle it.
      if (item.pDmg || item.mDmg) {
        if (item.pDmg > item.mDmg) {
          mainAttributes.push({
            name: 'TOOLTIP.Damage_phys',
            value: item.pDmg,
            valueHq: item.pDmg + item.bpSpecial[0]
          });
        } else {
          mainAttributes.push({
            name: 'TOOLTIP.Damage_mag',
            value: item.mDmg,
            valueHq: item.mDmg + item.bpSpecial[1]
          });
        }
      }
      // If the item has some defense, handle it.
      if (item.pDef || item.mDef) {
        mainAttributes.push({
          name: 'TOOLTIP.Defense_phys',
          value: item.pDef,
          valueHq: item.pDef + item.bpSpecial[0]
        });
        mainAttributes.push({
          name: 'TOOLTIP.Defense_mag',
          value: item.mDef,
          valueHq: item.mDef + item.bpSpecial[1]
        });
      }
      return mainAttributes;
    })
  );

  public readonly stats$: Observable<any[]> = this.lazyItem$.pipe(
    map((item) => {
      return [
        ...(item.stats || []),
        ...(item.bonuses || [])
      ];
    })
  );

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  dataTypes = DataType;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly i18n: I18nToolsService,
    public readonly translate: TranslateService,
    private readonly router: Router,
    private readonly listPicker: ListPickerService,
    private readonly listsFacade: ListsFacade,
    private readonly progressService: ProgressPopupService,
    private readonly listManager: ListManagerService,
    private readonly notificationService: NzNotificationService,
    private readonly rotationPicker: RotationPickerService,
    private readonly attt: ATTTService,
    private readonly lazyData: LazyDataFacade,
    private readonly dialog: NzModalService,
    public readonly settings: SettingsService,
    private readonly apollo: Apollo,
    private readonly itemContext: ItemContextService,
    private readonly authFacade: AuthFacade,
    seo: SeoService
  ) {
    super(seo);
  }

  ngOnInit() {
    super.ngOnInit();
    const slug$ = this.route.paramMap.pipe(map((params) => params.get('slug') ?? undefined));
    const itemId$ = this.route.paramMap.pipe(map((params) => +params.get('itemId') || undefined));
    const correctSlug$ = itemId$.pipe(
      switchMap((itemId) => (!itemId ? of(undefined) : this.i18n.getNameObservable('items', itemId))),
      map((name) => name?.split(' ').join('-'))
    );

    combineLatest([slug$, itemId$, correctSlug$])
      .pipe(
        takeUntil(this.onDestroy$),
        map(([slug, itemId, correctSlug]) => ({ slug, itemId, correctSlug: encodeURIComponent(correctSlug) }))
      )
      .subscribe(this.onRouteParams);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.itemContext.setItemId(undefined);
  }

  markAsDoneInLog(id: number): void {
    this.authFacade.markAsDoneInLog('gathering', id, true);
  }

  public openInSimulator(item: ListRow, itemId: number, recipeId: string): void {
    this.rotationPicker.openInSimulator(itemId, recipeId);
  }

  public toSearchResult(item: ListRow): SearchResult {
    return {
      itemId: item.id,
      icon: '',
      contentType: 'items',
      addCrafts: false,
      amount: 1,
      sources: []
    };
  }

  // public openModelViewer(xivapiItem: any, gtData: ItemData): void {
  //   let slot: number | string;
  //   if (gtData.item.mount) {
  //     slot = 'mount';
  //   } else if (gtData.item.minionrace) {
  //     slot = 'minion';
  //   } else if (gtData.item.furniture) {
  //     slot = 'furniture';
  //   } else {
  //     slot = gtData.item.slot;
  //   }
  //   this.dialog.create({
  //     nzTitle: this.translate.instant('DB.3d_model_viewer'),
  //     nzContent: ModelViewerComponent,
  //     nzComponentParams: {
  //       slot: slot,
  //       models: gtData.item.models
  //     },
  //     nzFooter: null,
  //     nzClassName: 'model-viewer-modal'
  //   });
  // }

  public createQuickList(item: SearchResult, amount: number): void {
    this.i18n.getNameObservable('items', +item.itemId).pipe(
      first(),
      switchMap(itemName => {
        const list = this.listsFacade.newEphemeralList(itemName);
        const operation$ = this.listManager.addToList({
          itemId: +item.itemId,
          list: list,
          recipeId: item.recipe ? item.recipe.recipeId : '',
          amount: amount,
          collectable: item.addCrafts
        }).pipe(
          tap((resultList) => this.listsFacade.addList(resultList)),
          mergeMap((resultList) => {
            return this.listsFacade.myLists$.pipe(
              map((lists) => lists.find((l) => l.createdAt.seconds === resultList.createdAt.seconds && l.$key !== undefined)),
              filter((l) => l !== undefined),
              first()
            );
          })
        );

        return this.progressService.showProgress(operation$, 1);
      })
    ).subscribe((newList) => {
      this.router.navigate(['list', newList.$key]);
    });
  }

  public addItemsToList(item: SearchResult, amount: number): void {
    item.amount = amount;
    this.listPicker
      .pickList()
      .pipe(
        mergeMap((list) => {
          const operations = [this.listManager.addToList({
            itemId: +item.itemId,
            list: list,
            recipeId: item.recipe ? item.recipe.recipeId : '',
            amount: item.amount,
            collectable: item.addCrafts
          })];
          let operation$: Observable<any>;
          if (operations.length > 0) {
            operation$ = concat(...operations);
          } else {
            operation$ = of(list);
          }
          return this.progressService.showProgress(operation$, 1, 'Adding_recipes', { amount: 1, listname: list.name });
        }),
        tap((list) => (list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list))),
        mergeMap((list) => {
          // We want to get the list created before calling it a success, let's be pessimistic !
          return this.progressService.showProgress(
            combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
              map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
              map((lists) => lists.find((l) => l.createdAt.seconds === list.createdAt.seconds && l.$key !== undefined)),
              filter((l) => l !== undefined),
              first()
            ),
            1,
            'Saving_in_database'
          );
        })
      )
      .subscribe((list) => {
        this.itemsAdded = 1;
        this.modifiedList = list;
        this.notificationService.template(this.notification);
      });
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.lazyItem$.pipe(
      map((item) => {
        return {
          title: this.getName(item),
          description: this.getDescription(item),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/item/${item.id}/${this.getName(item).split(' ').join('+')}`,
          image: `https://xivapi.com/i2/ls/${item.id}.png`
        };
      })
    );
  }

  private getDescription(item: LazyItemsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(item.description);
  }

  private getName(item: LazyItemsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(item.name);
  }

  private handleAdditionalData(_item: ListRow, lazyItem: LazyItemsDatabasePage): Observable<ListRow> {
    let res$: Observable<ListRow> = of(_item);
    // TT card
    if (lazyItem.action === 1389) {
      res$ = res$.pipe(
        switchMap((item) => {
          return this.attt.getCard(lazyItem.actionData).pipe(
            switchMap(card => {
              return safeCombineLatest(card.sources.npcs.map(npc => {
                return this.lazyData.getRow('npcs', npc.resident_id).pipe(
                  map(npcData => {
                    const npcPosition = npcData.position;
                    const duel: TripleTriadDuel = {
                      atttNpcId: npc.id,
                      npcId: npc.resident_id,
                      mapId: npcPosition ? npcPosition.map : 0,
                      zoneId: npcPosition ? npcPosition.zoneid : 0,
                      coords: {
                        x: npc.location.x,
                        y: npc.location.y
                      },
                      rules: npc.rule_ids
                    };
                    if (npc.quest !== undefined) {
                      duel.unlockingQuestId = npc.quest.id;
                    }
                    return duel;
                  })
                );
              })).pipe(
                map(duels => ({ card, duels }))
              );
            }),
            map(({ card, duels }) => {
              if (duels.length > 0) {
                item.sources.push({
                  type: DataType.TRIPLE_TRIAD_DUELS,
                  data: duels
                });
              }
              if (card.sources.pack) {
                item.sources.push({
                  type: DataType.TRIPLE_TRIAD_PACK,
                  data: {
                    id: [10128, 10129, 10130, 13380, 10077][card.sources.pack.id - 1],
                    price: card.sources.pack.cost
                  }
                });
              }
              return item;
            })
          );
        })
      );
    }

    return res$;
  }

  private readonly onRouteParams = ({ slug, itemId, correctSlug }: { slug?: string; itemId?: number; correctSlug?: string }) => {
    this.itemContext.setItemId(itemId || undefined);
    if (!correctSlug) return;
    if (slug === undefined) {
      this.router.navigate([correctSlug], {
        relativeTo: this.route,
        replaceUrl: true
      });
    } else if (slug !== correctSlug) {
      this.router.navigate(['../', correctSlug], {
        relativeTo: this.route,
        replaceUrl: true
      });
    }
  };
}
