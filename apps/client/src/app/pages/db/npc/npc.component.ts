import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { TradeNpc } from '../../../modules/list/model/trade-npc';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyNpcsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-npcs-database-page';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { TradesComponent } from '../../../modules/item-details/trades/trades.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-npc',
    templateUrl: './npc.component.html',
    styleUrls: ['./npc.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, NzDividerModule, NzCardModule, MapComponent, NzListModule, RouterLink, TradesComponent, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, IfMobilePipe, XivapiIconPipe]
})
export class NpcComponent extends TeamcraftPageComponent {

  public npc$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('npcId')),
    switchMap(id => this.lazyData.getRow('npcsDatabasePages', +id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public trades$: Observable<TradeSource[]>;

  public gilShops$: Observable<TradeSource[]>;

  public leves$: Observable<number[]>;

  constructor(private route: ActivatedRoute,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'npcs', 'npcId');

    const shops$ = this.npc$.pipe(
      switchMap(npc => {
        return combineLatest([
          of(npc),
          this.lazyData.getRow('shopsByNpc', +npc.id, [])
        ]);
      }),
      map(([npcEntry, shops]) => {
        return shops
          .map(shop => {
            const npc: TradeNpc = { id: +npcEntry.id };
            if (npcEntry.position !== null) {
              npc.coords = { x: npcEntry.position.x, y: npcEntry.position.y };
              npc.zoneId = npcEntry.position.zoneid;
              npc.mapId = npcEntry.position.map;
            }
            return {
              ...shop,
              npcs: [
                npc
              ]
            };
          });
      }),
      shareReplay(1)
    );

    this.trades$ = shops$.pipe(
      map(shops => shops.filter(s => s.type !== 'GilShop'))
    );

    this.gilShops$ = shops$.pipe(
      map(shops => shops.filter(s => s.type === 'GilShop'))
    );

    this.links$ = this.npc$.pipe(
      map((npc) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#npc/${npc.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(npc.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );

    this.leves$ = this.npc$.pipe(
      map(npc => {
        return npc.levemetes;
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.npc$.pipe(
      map(npc => {
        return {
          title: this.getName(npc),
          description: this.getDescription(npc),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/npc/${npc.id}/${this.getName(npc).split(' ').join('-')}`,
          image: `https://xivapi.com/c/ENpcResident.png`
        };
      })
    );
  }

  private getDescription(npc: LazyNpcsDatabasePage): string {
    return this.i18n.getName(npc.title);
  }

  private getName(npc: LazyNpcsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(npc);
  }

}
