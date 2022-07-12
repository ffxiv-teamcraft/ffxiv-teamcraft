import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { uniq } from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { filter, first, map, mergeMap, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DataService } from '../../../core/api/data.service';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Memoized } from '../../../core/decorators/memoized';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ItemData } from '../../../model/garland-tools/item-data';
import { SearchResult } from '../../../model/search/search-result';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { DataExtractorService } from '../../../modules/list/data/data-extractor.service';
import { DataType } from '../../../modules/list/data/data-type';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { List } from '../../../modules/list/model/list';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { Trade } from '../../../modules/list/model/trade';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { TradeNpc } from '../../../modules/list/model/trade-npc';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TripleTriadDuel } from '../model/attt/triple-triad-duel';
import { UsedForType } from '../model/used-for-type';
import { ATTTService } from '../service/attt.service';
import { ItemContextService } from '../service/item-context.service';
import { ModelViewerComponent } from './model-viewer/model-viewer.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { environment } from '../../../../environments/environment';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { withLazyRow } from '../../../core/rxjs/with-lazy-row';
import { LazyRecipesPerItem } from '../../../lazy-data/model/lazy-recipes-per-item';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class ItemComponent extends TeamcraftPageComponent implements OnInit, OnDestroy {
  public noData = false;

  public readonly itemId$ = combineLatest([this.route.paramMap, this.itemContext.itemId$]).pipe(
    filter(([paramMap, itemId]) => !!paramMap.get('slug') && itemId >= 0),
    map(([_, itemId]) => itemId)
  );

  public readonly xivapiItem$: Observable<any> = this.itemId$.pipe(
    switchMap((itemId) => {
      return this.xivapi.get(XivapiEndpoint.Item, itemId);
    }),
    withLazyData(this.lazyData, 'fishes'),
    switchMap(([item, fishes]) => {
      item.IsFish = fishes.indexOf(item.ID) > -1;
      // If it's a  consumable, get item action details and put it inside item action itself.
      if (item.ItemAction && [844, 845, 846].indexOf(item.ItemAction.Type) > -1) {
        return this.xivapi.get(XivapiEndpoint.ItemFood, item.ItemAction.Data1).pipe(
          map((itemFood) => {
            item.ItemFood = itemFood;
            return item;
          })
        );
      }
      // If it's a fish, add the ingame drawing image link
      item.ingameDrawing = item.Icon.split('/')
        .map((fragment) => {
          if (+fragment > 0 || fragment.endsWith('.png')) {
            return `07${fragment.slice(2)}`;
          }
          return fragment;
        })
        .join('/');

      // For now we only have more details if there's an associated series
      item.hasMoreDetails = item.ItemSeries !== null;

      if (item.ItemSeries) {
        return this.lazyData.getRow('itemSeries', item.ItemSeries.ID).pipe(
          switchMap(itemSeries => {
            if (itemSeries.items.length > 20) {
              return of(item);
            }
            return safeCombineLatest(itemSeries.items.map(itemId => {
              return this.lazyData.getRow('itemSetBonuses', itemId, { bonuses: [], itemSeriesId: item.ItemSeries.ID }).pipe(
                map(bonuses => {
                  return {
                    itemId,
                    bonuses
                  };
                })
              );
            })).pipe(
              map(bonuses => {
                return {
                  ...item,
                  bonuses
                };
              })
            );
          })
        );
      }
      return of(item);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly garlandToolsItem$: Observable<ItemData> = this.itemId$.pipe(
    switchMap((itemId) => {
      return this.gt.getItem(itemId);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public readonly data$: Observable<ListRow> = combineLatest([this.garlandToolsItem$, this.xivapiItem$, this.authFacade.logTracking$.pipe(startWith(null))]).pipe(
    switchMap(([data, xivapiItem, logTracking]) => {
      const mockRow: any = {
        id: data.item.id,
        icon: data.item.icon,
        amount: 1,
        done: 0,
        used: 0,
        yield: 1
      };
      if (!environment.production) {
        // Useful for debugging extractors
        return this.extractor.addDataToItem(mockRow).pipe(
          switchMap((item: any) => {
            item.canBeGathered = getItemSource(item, DataType.GATHERED_BY).type !== undefined;
            if (item.canBeGathered) {
              item.isDoneInLog = logTracking?.gathering.includes(item.id);
            }
            return this.handleAdditionalData(item, xivapiItem);
          })
        );
      } else {
        return this.lazyData.getRow('extracts', data.item.id).pipe(
          switchMap((item: any) => {
            item.canBeGathered = getItemSource(item, DataType.GATHERED_BY).type !== undefined;
            if (item.canBeGathered) {
              item.isDoneInLog = logTracking?.gathering.includes(item.id);
            }
            return this.handleAdditionalData(item, xivapiItem);
          })
        );
      }
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

  public readonly usedFor$: Observable<any> = combineLatest([this.garlandToolsItem$, this.xivapiItem$]).pipe(
    switchMap(([data, xivapiItem]) => {
      if (xivapiItem.ItemSearchCategoryTargetID === 30) {
        return this.apollo
          .query<any>({
            query: gql`
        query fishData {
          baits_per_fish(where: {baitId: {_eq: ${xivapiItem.ID}}, occurences: {_gt: 5}}) {
            itemId
          }
        }
        `
          })
          .pipe(
            map((result) => {
              xivapiItem.BaitInfo = result.data.baits_per_fish.filter((row) => row.itemId > 0);
              return [data, xivapiItem];
            })
          );
      }
      return of([data, xivapiItem]);
    }),
    withLazyData(this.lazyData, 'recipes', 'reduction', 'collectables', 'desynth', 'npcs', 'lootSources'),
    withLazyRow(this.lazyData, 'usedInQuests', ([[, xivapiItem]]) => xivapiItem.ID),
    withLazyRow(this.lazyData, 'levesPerItem', ([[[, xivapiItem]]]) => xivapiItem.ID),
    switchMap(([[[[data, xivapiItem], recipes, reduction, collectables, desynth, npcs, loots], usedInQuests], usedForLeves]) => {
      const usedFor = [];
      if (data.item.ingredient_of !== undefined) {
        usedFor.push({
          type: UsedForType.CRAFT,
          flex: '1 1 auto',
          title: 'DB.Crafts',
          icon: './assets/icons/classjob/blacksmith.png',
          links: Object.keys(data.item.ingredient_of).map((itemId) => {
            return {
              itemId: +itemId,
              recipes: recipes.filter((r) => r.result === +itemId)
            };
          })
        });
      }
      if (xivapiItem.BaitInfo !== undefined && xivapiItem.BaitInfo.length > 0) {
        usedFor.push({
          type: UsedForType.FISH_BAIT,
          flex: '1 1 auto',
          title: 'DB.FISH.Bait',
          icon: './assets/icons/classjob/fisher.png',
          links: xivapiItem.BaitInfo.map((row) => {
            return {
              itemId: +row.itemId
            };
          })
        });
      }
      const lazyReductions = Object.keys(reduction)
        .filter((key) => reduction[key].indexOf(data.item.id) > -1)
        .map((key) => +key);
      const reductions = uniq([...(data.item.reducesTo || []), ...(lazyReductions || [])]);
      if (reductions.length > 0) {
        usedFor.push({
          type: UsedForType.REDUCTION,
          flex: '1 1 auto',
          title: 'DB.Reduces_to',
          icon: 'https://www.garlandtools.org/db/images/Reduce.png',
          links: reductions.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      const collectable = collectables[data.item.id];
      if (collectable !== undefined) {
        if (collectable.hwd) {
          usedFor.push({
            type: UsedForType.ISHGARD_RESTORATION,
            flex: '1 1 auto',
            title: 'DB.Ishgard_restoration',
            icon: './assets/icons/status/collectors_glove.png',
            ishgardRestoration: collectables[data.item.id]
          });
        } else {
          usedFor.push({
            type: UsedForType.ROWENA_SPLENDOR,
            flex: '1 1 auto',
            title: 'DB.Rowena_splendor',
            icon: './assets/icons/status/collectors_glove.png',
            masterpiece: collectables[data.item.id]
          });
        }
      }
      const lazyDesynths = Object.keys(desynth)
        .filter((key) => desynth[key].indexOf(data.item.id) > -1)
        .map((key) => +key);
      const desynths = uniq([...(data.item.desynthedTo || []), ...(lazyDesynths || [])]);
      if (desynths.length > 0) {
        usedFor.push({
          type: UsedForType.DESYNTH,
          flex: '1 1 auto',
          title: 'DB.Desynths_to',
          icon: './assets/icons/desynth.png',
          links: desynths.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      if (xivapiItem.ItemActionTargetID === 1389) {
        usedFor.push({
          flex: '0 0 auto',
          type: UsedForType.TT_CARD_UNLOCK,
          title: 'DB.TT_card_unlock',
          icon: 'https://triad.raelys.com/images/logo.png',
          cardId: xivapiItem.ItemAction.Data0
        });
      }
      if (data.item.tradeCurrency) {
        const trades = data.item.tradeCurrency.map((ts) => {
          return {
            npcs: ts.npcs.map((npcId) => {
              const npc: TradeNpc = { id: npcId };
              const npcEntry = npcs[npcId];
              if (npcEntry.position) {
                npc.coords = { x: npcEntry.position.x, y: npcEntry.position.y };
                npc.zoneId = npcEntry.position.zoneid;
                npc.mapId = npcEntry.position.map;
              }
              return npc;
            }),
            trades: ts.listings.map((row) => {
              return <Trade>{
                currencies: row.currency
                  .map((currency) => {
                    const partial = data.getPartial(currency.id, 'item');
                    const currencyPartial = partial && partial.obj;
                    if (currencyPartial) {
                      return <TradeEntry>{
                        id: currencyPartial.i,
                        icon: currencyPartial.c,
                        amount: currency.amount,
                        hq: currency.hq === 1
                      };
                    } else if (+currency.id === data.item.id) {
                      return <TradeEntry>{
                        id: data.item.id,
                        icon: data.item.icon,
                        amount: currency.amount,
                        hq: currency.hq === 1
                      };
                    }
                    return undefined;
                  })
                  .filter((res) => res !== undefined),
                items: row.item
                  .map((tradeItem) => {
                    const itemPartialFetch = data.getPartial(tradeItem.id, 'item');
                    if (itemPartialFetch !== undefined) {
                      const itemPartial = itemPartialFetch.obj;
                      return <TradeEntry>{
                        id: itemPartial.i,
                        icon: itemPartial.c,
                        amount: tradeItem.amount,
                        hq: tradeItem.hq === 1
                      };
                    } else if (+tradeItem.id === data.item.id) {
                      return <TradeEntry>{
                        id: data.item.id,
                        icon: data.item.icon,
                        amount: tradeItem.amount,
                        hq: tradeItem.hq === 1
                      };
                    }
                    return undefined;
                  })
                  .filter((res) => res !== undefined)
              };
            }),
            shopName: ts.shop
          };
        });
        usedFor.push({
          flex: '1 1 auto',
          type: UsedForType.TRADES,
          title: 'DB.Used_for_trades',
          icon: 'https://www.garlandtools.org/db/images/marker/Shop.png',
          trades
        });
      }
      const lootEntries = Object.keys(loots).filter(key => {
        return loots[key].includes(xivapiItem.ID);
      });
      if (lootEntries.length > 0) {
        usedFor.push({
          type: UsedForType.CAN_CONTAIN_ITEMS,
          flex: '1 1 auto',
          title: 'DB.Can_contain_items',
          icon: './assets/icons/chest_open.png',
          links: lootEntries.map((itemId) => {
            return {
              itemId: +itemId
            };
          })
        });
      }
      if (usedForLeves?.length > 0) {
        usedFor.push({
          type: UsedForType.LEVES,
          flex: '1 1 auto',
          title: 'DB.Leves',
          icon: './assets/icons/leve.png',
          leves: usedForLeves.map((leve) => {
            return {
              leveId: leve.leve,
              amount: leve.amount,
              level: leve.lvl,
              job: leve.classJob - 1
            };
          })
        });
      }
      if (data.item.usedInQuest) {
        usedFor.push({
          type: UsedForType.QUEST,
          flex: '1 1 auto',
          title: 'Quests',
          icon: './assets/icons/quest.png',
          quests: data.item.usedInQuest
        });
      } else if (usedInQuests) {
        usedFor.push({
          type: UsedForType.QUEST,
          flex: '1 1 auto',
          title: 'Quests',
          icon: './assets/icons/quest.png',
          quests: usedInQuests
        });
      }
      if (data.item.supply) {
        usedFor.push({
          type: UsedForType.SUPPLY,
          flex: '1 1 auto',
          title: 'DB.GC_Delivery',
          icon: './assets/icons/supply.png',
          supply: {
            amount: data.item.supply.count,
            xp: data.item.supply.xp,
            seals: data.item.supply.seals
          }
        });
      }
      if (data.item.unlocks) {
        return safeCombineLatest(
          data.item.unlocks.map(itemId => this.lazyData.getRow('recipesPerItem', itemId, []))
        ).pipe(
          map(unlockedRecipes => {
            usedFor.push({
              type: UsedForType.UNLOCKS,
              flex: '1 1 auto',
              title: 'DB.Unlocks',
              icon: './assets/icons/unlocks.png',
              links: unlockedRecipes.flat().map((recipe: LazyRecipesPerItem) => {
                const res: any = {
                  itemId: recipe.result
                };
                if (recipe) {
                  res.recipes = [recipe];
                }
                return res;
              })
            });
          })
        );
      }
      return of(usedFor);
    })
  );

  public readonly links$: Observable<{ title: string; icon: string; url: string }[]> = combineLatest([this.xivapiItem$, this.data$]).pipe(
    map(([xivapiItem, listRow]) => {
      const links = [
        {
          title: 'GarlandTools',
          url: `https://www.garlandtools.org/db/#item/${xivapiItem.ID}`,
          icon: 'https://garlandtools.org/favicon.png'
        },
        {
          title: 'Gamer Escape',
          url: `https://ffxiv.gamerescape.com/wiki/${xivapiItem.Name_en.toString().split(' ').join('_')}`,
          icon: './assets/icons/ge.png'
        }
      ];
      if (!xivapiItem.IsUntradable) {
        links.push({
          title: 'Universalis',
          icon: 'https://universalis.app/i/universalis/universalis.png',
          url: `https://universalis.app/market/${xivapiItem.ID}`
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
      if (xivapiItem.ItemActionTargetID === 1389) {
        links.push({
          title: 'Another Triple Triad Tracker',
          icon: 'https://triad.raelys.com/images/logo.png',
          url: `https://triad.raelys.com/cards/${xivapiItem.AdditionalData}`
        });
      }
      if (xivapiItem.ItemAction) {
        if (xivapiItem.ItemAction.Type === 1322) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/mounts/${xivapiItem.ItemAction.Data0}`
          });
        }
        if (xivapiItem.ItemAction.Type === 853) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/minions/${xivapiItem.ItemAction.Data0}`
          });
        }
        if (xivapiItem.ItemAction.Type === 5845) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/orchestrions/${xivapiItem.ItemAction.Data0}`
          });
        }
        if (xivapiItem.ItemAction.Type === 2633 && xivapiItem.Name_en.indexOf('Ballroom Etiquette') > -1) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/emotes/${xivapiItem.ItemAction.Data0}`
          });
        }
        if (xivapiItem.ItemAction.Type === 2633 && xivapiItem.Name_en.indexOf('Modern Aesthetics') > -1) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/hairstyles/${xivapiItem.ItemAction.Data0}`
          });
        }
        if (xivapiItem.ItemAction.Type === 1013) {
          links.push({
            title: 'FFXIV Collect',
            icon: 'https://ffxivcollect.com/images/logo_small.png',
            url: `https://ffxivcollect.com/bardings/${xivapiItem.ItemAction.Data0}`
          });
        }
      }
      return links;
    })
  );

  public readonly mainAttributes$: Observable<any[]> = this.xivapiItem$.pipe(
    map((item) => {
      const mainAttributes = [];
      if (item.ClassJobUseTargetID) {
        mainAttributes.push({
          name: 'DB.Class_job',
          value: this.i18n.getName(this.i18n.xivapiToI18n(item.ClassJobCategory))
        });
      }
      mainAttributes.push({
        name: 'TOOLTIP.Level',
        value: item.LevelEquip
      });
      mainAttributes.push({
        name: 'TOOLTIP.Ilvl',
        value: item.LevelItem
      });
      if (item.ClassJobUseTargetID) {
        mainAttributes.push({
          name: 'DB.Delay',
          value: item.DelayMs / 1000
        });
        mainAttributes.push({
          name: 'DB.Auto',
          value: Math.floor((item.DamagePhys * item.DelayMs) / 30) / 100,
          valueHq: Math.floor(((item.DamagePhys + item.BaseParamValueSpecial0) * item.DelayMs) / 30) / 100
        });
      }
      // If the item has some damage, handle it.
      if (item.DamagePhys || item.DamageMag) {
        if (item.DamagePhys > item.DamageMag) {
          mainAttributes.push({
            name: 'TOOLTIP.Damage_phys',
            value: item.DamagePhys,
            valueHq: item.DamagePhys + item.BaseParamValueSpecial0
          });
        } else {
          mainAttributes.push({
            name: 'TOOLTIP.Damage_mag',
            value: item.DamageMag,
            valueHq: item.DamageMag + item.BaseParamValueSpecial1
          });
        }
      }
      // If the item has some defense, handle it.
      if (item.DefensePhys || item.DefenseMag) {
        mainAttributes.push({
          name: 'TOOLTIP.Defense_phys',
          value: item.DefensePhys,
          valueHq: item.DefensePhys + item.BaseParamValueSpecial0
        });
        mainAttributes.push({
          name: 'TOOLTIP.Defense_mag',
          value: item.DefenseMag,
          valueHq: item.DefenseMag + item.BaseParamValueSpecial1
        });
      }
      return mainAttributes;
    })
  );

  public readonly stats$: Observable<any[]> = this.xivapiItem$.pipe(
    map((item) => {
      const stats = Object.keys(item)
        .filter((key) => /^BaseParam\d+$/.test(key) && item[key] && key !== undefined)
        .map((key) => {
          const statIndex = key.match(/(\d+)/)[0];
          const res: any = {
            name: this.i18n.xivapiToI18n(item[key]),
            value: item[`BaseParamValue${statIndex}`],
            requiresPipe: true
          };
          if (item.CanBeHq === 1) {
            const statId = item[`BaseParam${statIndex}TargetID`];
            const specialParamKey = Object.keys(item)
              .filter((k) => /^BaseParamSpecial\d+TargetID$/.test(k) && item[k])
              .find((k) => item[k] === statId);
            if (specialParamKey !== undefined) {
              const specialParamIndex = specialParamKey.match(/(\d+)/)[0];
              res.valueHq = res.value + item[`BaseParamValueSpecial${specialParamIndex}`];
            } else {
              res.valueHq = res.value;
            }
          }
          return res;
        });
      if (item.ItemFood !== undefined) {
        const food = item.ItemFood;
        for (let i = 0; i < 3; i++) {
          const statsEntry: any = {};
          const value = food[`Value${i}`];
          const valueHq = food[`ValueHQ${i}`];
          const isRelative = food[`IsRelative${i}`] === 1;
          const max = food[`Max${i}`];
          const maxHq = food[`MaxHQ${i}`];
          if (value > 0) {
            statsEntry.name = this.i18n.xivapiToI18n(food[`BaseParam${i}`]);
            statsEntry.requiresPipe = true;
            if (isRelative) {
              statsEntry.value = `${value}% (${max})`;
              statsEntry.valueHq = `${valueHq}% (${maxHq})`;
            } else {
              statsEntry.value = value.toString();
            }
            stats.push(statsEntry);
          }
        }
      }
      return stats;
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
    private readonly xivapi: XivapiService,
    private readonly gt: DataService,
    private readonly i18n: I18nToolsService,
    public readonly translate: TranslateService,
    private readonly router: Router,
    private readonly extractor: DataExtractorService,
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

  @Memoized()
  public getRecipe(recipeId: string, fallbackData: ItemData): Observable<any> {
    return this.lazyData.getRecipe(recipeId).pipe(
      map((recipe) => {
        if (!recipe) {
          return fallbackData.getCraft(recipeId);
        }
        return recipe;
      })
    );
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
      addCrafts: false,
      amount: 1
    };
  }

  public openModelViewer(xivapiItem: any, gtData: ItemData): void {
    let slot: number | string = 1;
    if (gtData.item.mount) {
      slot = 'mount';
    } else if (gtData.item.minionrace) {
      slot = 'minion';
    } else if (gtData.item.furniture) {
      slot = 'furniture';
    } else {
      slot = gtData.item.slot;
    }
    this.dialog.create({
      nzTitle: this.translate.instant('DB.3d_model_viewer'),
      nzContent: ModelViewerComponent,
      nzComponentParams: {
        slot: slot,
        models: gtData.item.models
      },
      nzFooter: null,
      nzClassName: 'model-viewer-modal'
    });
  }

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
    return this.xivapiItem$.pipe(
      map((item) => {
        return {
          title: this.getName(item),
          description: this.getDescription(item),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/item/${item.ID}/${this.getName(item).split(' ').join('+')}`,
          image: `https://xivapi.com/i2/ls/${item.ID}.png`
        };
      })
    );
  }

  private getDescription(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(item, 'Description'));
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(item));
  }

  private handleAdditionalData(_item: ListRow, xivapiItem: any): Observable<ListRow> {
    let res$: Observable<ListRow> = of(_item);
    // TT card
    if (xivapiItem.ItemActionTargetID === 1389) {
      res$ = res$.pipe(
        switchMap((item) => {
          return this.attt.getCard(xivapiItem.ItemAction.Data0).pipe(
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
                  type: DataType.TRIPLE_TRIAD_DUELS,
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
