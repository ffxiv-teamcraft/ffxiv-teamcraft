import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ItemData } from '../../../model/garland-tools/item-data';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
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
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { tap } from 'rxjs/internal/operators/tap';

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

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private extractor: DataExtractorService,
              seo: SeoService) {
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
      })
    );

    this.data$ = this.garlandToolsItem$.pipe(
      map(data => {
        const item: ListRow = {
          id: data.item.id,
          icon: data.item.icon,
          amount: 1,
          done: 0,
          used: 0,
          yield: 1
        };
        if (data.isCraft()) {
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
        return item;
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
          && (item.alarms === undefined || item.alarms.length === 0);
      })
    );

    this.links$ = combineLatest([this.xivapiItem$, this.data$]).pipe(
      map(([xivapiItem, listRow]) => {
        const links = [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#item/${xivapiItem.ID}`,
            icon: 'http://garlandtools.org/favicon.png'
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
            url: `http://${this.translate.currentLang === 'en' ? 'www' : this.translate.currentLang}.ffxivgardening.com/seed-details.php?SeedID=${listRow.gardening}`
          });
        }
        return links;
      })
    );

    this.usedFor$ = this.garlandToolsItem$.pipe(
      map(data => {
        const usedFor = [];
        if (data.item.ingredient_of !== undefined) {
          usedFor.push({
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
        return usedFor;
      })
    );


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

}
