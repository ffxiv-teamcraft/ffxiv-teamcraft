import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { ItemData } from '../../../model/garland-tools/item-data';
import { filter, first, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoService } from '../../../core/seo/seo.service';
import { DataService } from '../../../core/api/data.service';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { DataExtractorService } from '../../../modules/list/data/data-extractor.service';
import { getItemSource, ListRow } from '../../../modules/list/model/list-row';
import { SearchResult } from '../../../model/search/search-result';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { List } from '../../../modules/list/model/list';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { ATTTService } from '../service/attt.service';
import { TripleTriadDuel } from '../model/attt/triple-triad-duel';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { UsedForType } from '../model/used-for-type';
import { TradeNpc } from '../../../modules/list/model/trade-npc';
import { Trade } from '../../../modules/list/model/trade';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { Craft } from '../../../model/garland-tools/craft';
import { DomSanitizer } from '@angular/platform-browser';
import { ModelViewerComponent } from './model-viewer/model-viewer.component';
import { SettingsService } from '../../../modules/settings/settings.service';
import { hwdSupplies } from '../../../core/data/sources/hwd-supplies';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { DataType } from '../../../modules/list/data/data-type';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class ItemComponent extends TeamcraftPageComponent {

  public xivapiItem$: Observable<any>;

  public garlandToolsItem$: Observable<ItemData>;

  public data$: Observable<ListRow>;

  public usedFor$: Observable<any>;

  public noData = false;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public mainAttributes$: Observable<any[]>;

  public stats$: Observable<any[]>;

  @ViewChild('notificationRef', { static: true })
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  dataTypes = DataType;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private extractor: DataExtractorService,
              private listPicker: ListPickerService, private listsFacade: ListsFacade,
              private progressService: ProgressPopupService, private listManager: ListManagerService,
              private notificationService: NzNotificationService, private rotationPicker: RotationPickerService,
              private attt: ATTTService, private lazyData: LazyDataService, private sanitizer: DomSanitizer,
              private dialog: NzModalService, public settings: SettingsService,
              private apollo: Apollo, seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getItem(+params.get('itemId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getItem(+params.get('itemId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getItem(+params.get('itemId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const itemId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('itemId'))
    );

    this.xivapiItem$ = itemId$.pipe(
      switchMap(itemId => {
        return this.xivapi.get(XivapiEndpoint.Item, +itemId);
      }),
      switchMap((item) => {
        item.IsFish = this.lazyData.data.fishes.indexOf(item.ID) > -1;
        // If it's a  consumable, get item action details and put it inside item action itself.
        if (item.ItemAction && [844, 845, 846].indexOf(item.ItemAction.Type) > -1) {
          return this.xivapi.get(XivapiEndpoint.ItemFood, item.ItemAction.Data1).pipe(
            map(itemFood => {
              item.ItemFood = itemFood;
              return item;
            })
          );
        }
        return of(item);
      }),
      shareReplay(1)
    );

    this.mainAttributes$ = this.xivapiItem$.pipe(
      map(item => {
        const mainAttributes = [];
        if (item.ClassJobUseTargetID) {
          mainAttributes.push({
            name: 'DB.Class_job',
            value: item.ClassJobCategory[`Name_${this.translate.currentLang}`] || item.ClassJobCategory.Name_en
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

    this.stats$ = this.xivapiItem$.pipe(
      map(item => {
        const stats = Object.keys(item)
          .filter(key => /^BaseParam\d+$/.test(key) && item[key] && key !== undefined)
          .map(key => {
            const statIndex = key.match(/(\d+)/)[0];
            const res: any = {
              name: item[key],
              value: item[`BaseParamValue${statIndex}`],
              requiresPipe: true
            };
            if (item.CanBeHq === 1) {
              const statId = item[`BaseParam${statIndex}TargetID`];
              const specialParamKey = Object.keys(item)
                .filter(k => /^BaseParamSpecial\d+TargetID$/.test(k) && item[k])
                .find(k => item[k] === statId);
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
              statsEntry.name = food[`BaseParam${i}`];
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

    this.garlandToolsItem$ = itemId$.pipe(
      switchMap(itemId => {
        return this.gt.getItem(+itemId);
      }),
      shareReplay(1)
    );

    this.data$ = combineLatest([this.garlandToolsItem$, this.xivapiItem$]).pipe(
      switchMap(([data, xivapiItem]) => {
        let item: ListRow = {
          id: data.item.id,
          icon: data.item.icon,
          amount: 1,
          done: 0,
          used: 0,
          yield: 1
        };
        item = this.extractor.addDataToItem(item, data);
        return this.handleAdditionalData(item, data, xivapiItem);
      }),
      tap(item => {
        this.noData = item.sources.length === 0;
      })
    );

    this.links$ = combineLatest([this.xivapiItem$, this.data$]).pipe(
      map(([xivapiItem, listRow]) => {
        const links = [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#item/${xivapiItem.ID}`,
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
            url: `http://${this.translate.currentLang === 'en' ? 'www' : this.translate.currentLang}.ffxivgardening.com/seed-details.php?SeedID=${gardening}`
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

    this.usedFor$ = combineLatest([this.garlandToolsItem$, this.xivapiItem$]).pipe(
      switchMap(([data, xivapiItem]) => {
        if (xivapiItem.ItemSearchCategoryTargetID === 30) {
          return this.apollo.query<any>({
            query: gql`
          query fishData {
            baits_per_fish(where: {baitId: {_eq: ${xivapiItem.ID}}}) {
              itemId
            }
          }
          `
          })
            .pipe(
              map(result => {
                xivapiItem.BaitInfo = result.data.baits_per_fish.filter(bait => bait.id > 0);
                return [data, xivapiItem];
              })
            );
        }
        return of([data, xivapiItem]);
      }),
      map(([data, xivapiItem]) => {
        const usedFor = [];
        if (data.item.ingredient_of !== undefined) {
          usedFor.push({
            type: UsedForType.CRAFT,
            flex: '1 1 auto',
            title: 'DB.Crafts',
            icon: './assets/icons/classjob/blacksmith.png',
            links: Object.keys(data.item.ingredient_of)
              .map(itemId => {
                return {
                  itemId: +itemId,
                  recipes: this.lazyData.data.recipes.filter(r => r.result === +itemId)
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
            links: xivapiItem.BaitInfo
              .map(row => {
                return {
                  itemId: +row.itemId
                };
              })
          });
        }
        if (data.item.reducesTo !== undefined) {
          usedFor.push({
            type: UsedForType.REDUCTION,
            flex: '1 1 auto',
            title: 'DB.Reduces_to',
            icon: 'https://www.garlandtools.org/db/images/Reduce.png',
            links: data.item.reducesTo
              .map(itemId => {
                return {
                  itemId: +itemId
                };
              })
          });
        }
        if (data.item.masterpiece !== undefined) {
          usedFor.push({
            type: UsedForType.ROWENA_SPLENDOR,
            flex: '1 1 auto',
            title: 'DB.Rowena_splendor',
            icon: './assets/icons/status/collectors_glove.png',
            masterpiece: data.item.masterpiece
          });
        }
        if (hwdSupplies[data.item.id] !== undefined) {
          usedFor.push({
            type: UsedForType.ISHGARD_RESTORATION,
            flex: '1 1 auto',
            title: 'DB.Ishgard_restoration',
            icon: './assets/icons/status/collectors_glove.png',
            ishgardRestoration: hwdSupplies[data.item.id]
          });
        }
        if (data.item.desynthedTo !== undefined) {
          usedFor.push({
            type: UsedForType.DESYNTH,
            flex: '1 1 auto',
            title: 'DB.Desynths_to',
            icon: './assets/icons/desynth.png',
            links: data.item.desynthedTo
              .map(itemId => {
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
          usedFor.push({
            flex: '1 1 auto',
            type: UsedForType.TRADES,
            title: 'DB.Used_for_trades',
            icon: 'https://www.garlandtools.org/db/images/Shop.png',
            trades: data.item.tradeCurrency.map(ts => {
              return {
                npcs: ts.npcs.map(npcId => {
                  const npc: TradeNpc = { id: npcId };
                  const npcEntry = this.lazyData.data.npcs[npcId];
                  if (npcEntry.position) {
                    npc.coords = { x: npcEntry.position.x, y: npcEntry.position.y };
                    npc.zoneId = npcEntry.position.zoneid;
                    npc.mapId = npcEntry.position.map;
                  }
                  return npc;
                }),
                trades: ts.listings.map(row => {
                  return <Trade>{
                    currencies: row.currency.map(currency => {
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
                    }).filter(res => res !== undefined),
                    items: row.item.map(tradeItem => {
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
                    }).filter(res => res !== undefined)
                  };
                }),
                shopName: ts.shop
              };
            })
          });
        }
        if (data.item.loot) {
          usedFor.push({
            type: UsedForType.CAN_CONTAIN_ITEMS,
            flex: '1 1 auto',
            title: 'DB.Can_contain_items',
            icon: './assets/icons/chest_open.png',
            links: data.item.loot
              .map(itemId => {
                return {
                  itemId: +itemId
                };
              })
          });
        }
        if (data.item.requiredByLeves) {
          usedFor.push({
            type: UsedForType.LEVES,
            flex: '1 1 auto',
            title: 'DB.Leves',
            icon: './assets/icons/leve.png',
            leves: data.item.requiredByLeves
              .map(leve => {
                const partial = data.getPartial(leve.toString(), 'leve');
                return {
                  leveId: leve,
                  level: partial.obj.l,
                  job: partial.obj.j
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
          usedFor.push({
            type: UsedForType.UNLOCKS,
            flex: '1 1 auto',
            title: 'DB.Unlocks',
            icon: './assets/icons/unlocks.png',
            links: data.item.unlocks
              .map(itemId => {
                return {
                  itemId: +itemId,
                  recipes: [this.lazyData.data.recipes.find(r => r.result === +itemId)]
                };
              })
          });
        }
        return usedFor;
      })
    );
  }

  public openInSimulator(item: ListRow, itemId: number, recipeId: string): void {
    const entry = getItemSource(item,  DataType.CRAFTED_BY).find(c => c.recipeId === recipeId);
    const craft: Partial<Craft> = {
      id: recipeId,
      job: entry.jobId,
      lvl: entry.level,
      stars: entry.stars_tooltip.length,
      rlvl: entry.rlvl,
      durability: entry.durability,
      progress: entry.progression,
      quality: entry.quality
    };
    this.rotationPicker.openInSimulator(itemId, recipeId, craft);
  }

  public toSearchResult(item: ListRow): SearchResult {
    return {
      itemId: item.id,
      icon: item.icon.toString(),
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

  private getDescription(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Description_${this.translate.currentLang}`] || item.Description_en;
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Name_${this.translate.currentLang}`] || item.Name_en;
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiItem$.pipe(
      map(item => {
        return {
          title: this.getName(item),
          description: this.getDescription(item),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/item/${item.ID}/${this.getName(item).split(' ').join('+')}`,
          image: `https://xivapi.com/i2/ls/${item.ID}.png`
        };
      })
    );
  }

  public createQuickList(item: SearchResult): void {
    const list = this.listsFacade.newEphemeralList(this.i18n.getName(this.l12n.getItem(+item.itemId)));
    const operation$ = this.listManager.addToList(+item.itemId, list, item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts)
      .pipe(
        tap(resultList => this.listsFacade.addList(resultList)),
        mergeMap(resultList => {
          return this.listsFacade.myLists$.pipe(
            map(lists => lists.find(l => l.createdAt.toMillis() === resultList.createdAt.toMillis() && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          );
        })
      );

    this.progressService.showProgress(operation$, 1)
      .subscribe((newList) => {
        this.router.navigate(['list', newList.$key]);
      });
  }

  public addItemsToList(item: SearchResult, amount: number): void {
    item.amount = amount;
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = [this.listManager.addToList(+item.itemId, list,
          item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts)];
        let operation$: Observable<any>;
        if (operations.length > 0) {
          operation$ = concat(
            ...operations
          );
        } else {
          operation$ = of(list);
        }
        return this.progressService.showProgress(operation$,
          1,
          'Adding_recipes',
          { amount: 1, listname: list.name });
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
      this.itemsAdded = 1;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });

  }

  private handleAdditionalData(_item: ListRow, gtData: ItemData, xivapiItem: any): Observable<ListRow> {
    let res$: Observable<ListRow> = of(_item);
    // TT card
    if (xivapiItem.ItemActionTargetID === 1389) {
      res$ = res$.pipe(
        switchMap(item => {
          return this.attt.getCard(xivapiItem.ItemAction.Data0)
            .pipe(
              map(card => {
                if (card.sources.npcs.length > 0) {
                  item.sources.push({
                    type: DataType.TRIPLE_TRIAD_DUELS,
                    data: card.sources.npcs.map(npc => {
                      const npcPosition = this.lazyData.data.npcs[npc.resident_id].position;
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
    if (xivapiItem.GameContentLinks) {
      if (xivapiItem.GameContentLinks.Achievement && xivapiItem.GameContentLinks.Achievement.Item) {
        res$ = res$.pipe(
          map(res => {
            res.sources.push({
              type: DataType.ACHIEVEMENTS,
              data: xivapiItem.GameContentLinks.Achievement.Item
            });
            return res;
          })
        );
      }
    }
    if (gtData.item.quests) {
      res$ = res$.pipe(
        map(res => {
          res.sources.push({
            type: DataType.QUESTS,
            data: gtData.item.quests
          });
          return res;
        })
      );
    }
    return res$;
  }
}
