import { Component } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { TradeNpc } from '../../../modules/list/model/trade-npc';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyNpcsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-npcs-database-page';

@Component({
  selector: 'app-npc',
  templateUrl: './npc.component.html',
  styleUrls: ['./npc.component.less']
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
