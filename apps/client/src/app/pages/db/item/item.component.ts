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
import { ListRow } from '../../../modules/list/model/list-row';
import { SearchResult } from '../../../model/search/search-result';
import { ListPickerService } from '../../../modules/list-picker/list-picker.service';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { ListManagerService } from '../../../modules/list/list-manager.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { List } from '../../../modules/list/model/list';
import { RotationPickerService } from '../../../modules/rotations/rotation-picker.service';
import { ATTTService } from '../service/attt.service';
import { TripleTriadDuel } from '../model/attt/triple-triad-duel';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { UsedForType } from '../model/used-for-type';

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

  @ViewChild('notificationRef')
  notification: TemplateRef<any>;

  // Notification data
  itemsAdded = 0;

  modifiedList: List;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private extractor: DataExtractorService,
              private listPicker: ListPickerService, private listsFacade: ListsFacade,
              private progressService: ProgressPopupService, private listManager: ListManagerService,
              private notificationService: NzNotificationService, private rotationPicker: RotationPickerService,
              private attt: ATTTService, private lazyData: LazyDataService, seo: SeoService) {
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
              const specialParamIndex = specialParamKey.match(/(\d+)/)[0];
              res.valueHq = res.value + item[`BaseParamValueSpecial${specialParamIndex}`];
            }
            return res;
          });
        if (item.ItemFood !== undefined) {
          const food = item.ItemFood;
          for (let i = 0; i < 2; i++) {
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
        this.noData = (item.craftedBy === undefined || item.craftedBy.length === 0)
          && (item.tradeSources === undefined || item.tradeSources.length === 0)
          && (item.reducedFrom === undefined || item.reducedFrom.length === 0)
          && (item.desynths === undefined || item.desynths.length === 0)
          && (item.instances === undefined || item.instances.length === 0)
          && (!item.gardening)
          && (item.voyages === undefined || item.voyages.length === 0)
          && (item.drops === undefined || item.drops.length === 0)
          && (item.ventures === undefined || item.ventures.length === 0)
          && (!item.gatheredBy)
          && (item.alarms === undefined || item.alarms.length === 0)
          && (item.tripleTriadDuels === undefined || item.tripleTriadDuels.length === 0);
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
            title: 'Mogboard',
            icon: 'https://mogboard.com/i/mog/mog.png',
            url: `https://mogboard.com/market/${xivapiItem.ID}`
          });
        }
        if (listRow.gardening) {
          links.push({
            title: 'FFXIV Gardening',
            icon: './assets/icons/Gardening.png',
            url: `https://${this.translate.currentLang === 'en' ? 'www' : this.translate.currentLang}.ffxivgardening.com/seed-details.php?SeedID=${listRow.gardening}`
          });
        }
        if (xivapiItem.AdditionalData) {
          links.push({
            title: 'Another Triple Triad Tracker',
            icon: 'https://triad.raelys.com/images/logo.png',
            url: `https://triad.raelys.com/cards/${xivapiItem.AdditionalData}`
          });
        }
        return links;
      })
    );

    this.usedFor$ = combineLatest([this.garlandToolsItem$, this.xivapiItem$]).pipe(
      map(([data, xivapiItem]) => {
        const usedFor = [];
        if (data.item.ingredient_of !== undefined) {
          usedFor.push({
            type: UsedForType.CRAFT,
            flex: '1 1 33%',
            title: 'DB.Crafts',
            icon: './assets/icons/classjob/blacksmith.png',
            links: Object.keys(data.item.ingredient_of)
              .map(itemId => {
                return {
                  itemId: +itemId
                };
              })
          });
        }
        if (xivapiItem.AdditionalData) {
          usedFor.push({
            flex: '0 0 auto',
            type: UsedForType.TT_CARD_UNLOCK,
            title: 'DB.TT_card_unlock',
            icon: 'https://triad.raelys.com/images/logo.png',
            cardId: xivapiItem.AdditionalData
          });
        }
        return usedFor;
      })
    );
  }

  public openInSimulator(itemId: number, recipeId: string): void {
    this.rotationPicker.openInSimulator(itemId, recipeId);
  }

  public toSearchResult(item: ListRow): SearchResult {
    return {
      itemId: item.id,
      icon: item.icon.toString(),
      addCrafts: false,
      amount: 1
    };
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiItem$.pipe(
      map(item => {
        return {
          title: this.i18n.getName(this.l12n.getItem(item.ID)),
          description: item[`Description_${this.translate.currentLang}`] || item.Description_en,
          url: `https://ffxivteamcraft.com/db/item/${item.ID}/${this.i18n.getName(this.l12n.getItem(item.ID)).split(' ').join('+')}`
        };
      })
    );
  }

  public addItemsToList(items: SearchResult[]): void {
    this.listPicker.pickList().pipe(
      mergeMap(list => {
        const operations = items.map(item => {
          return this.listManager.addToList(+item.itemId, list,
            item.recipe ? item.recipe.recipeId : '', item.amount, item.addCrafts);
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
          items.length,
          'Adding_recipes',
          { amount: items.length, listname: list.name });
      }),
      tap(list => list.$key ? this.listsFacade.updateList(list) : this.listsFacade.addList(list)),
      mergeMap(list => {
        // We want to get the list created before calling it a success, let's be pessimistic !
        return this.progressService.showProgress(
          combineLatest([this.listsFacade.myLists$, this.listsFacade.listsWithWriteAccess$]).pipe(
            map(([myLists, listsICanWrite]) => [...myLists, ...listsICanWrite]),
            map(lists => lists.find(l => l.createdAt === list.createdAt && l.$key === list.$key && l.$key !== undefined)),
            filter(l => l !== undefined),
            first()
          ), 1, 'Saving_in_database');
      })
    ).subscribe((list) => {
      this.itemsAdded = items.length;
      this.modifiedList = list;
      this.notificationService.template(this.notification);
    });

  }

  private handleAdditionalData(_item: ListRow, gtData: ItemData, xivapiItem: any): Observable<ListRow> {
    let res$: Observable<ListRow> = of(_item);
    if (xivapiItem.AdditionalData) {
      res$ = res$.pipe(
        switchMap(item => {
          return this.attt.getCard(xivapiItem.AdditionalData)
            .pipe(
              map(card => {
                if (card.sources.npcs.length > 0) {
                  item.tripleTriadDuels = card.sources.npcs.map(npc => {
                    const npcPosition = this.lazyData.npcs[npc.resident_id].position;
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
                  });
                }
                if (card.sources.pack !== null) {
                  item.tripleTriadPack = {
                    id: [10128, 10129, 10130, 13380, 10077][card.sources.pack.id - 1],
                    price: card.sources.pack.cost
                  }
                }
                return item;
              })
            );
        })
      );
    }
    return res$;
  }
}
