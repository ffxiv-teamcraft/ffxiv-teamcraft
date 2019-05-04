import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemData } from '../../../model/garland-tools/item-data';
import { filter, map, switchMap } from 'rxjs/operators';
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
                  itemId: +itemId,
                };
              })
          })
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
