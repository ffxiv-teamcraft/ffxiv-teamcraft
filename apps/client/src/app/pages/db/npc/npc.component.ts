import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { NpcData } from '../../../model/garland-tools/npc-data';
import { TradeSource } from '../../../modules/list/model/trade-source';
import { TradeNpc } from '../../../modules/list/model/trade-npc';
import { Trade } from '../../../modules/list/model/trade';
import { TradeEntry } from '../../../modules/list/model/trade-entry';
import { levemetes } from '../../../core/data/sources/levemetes';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';

@Component({
  selector: 'app-npc',
  templateUrl: './npc.component.html',
  styleUrls: ['./npc.component.less']
})
export class NpcComponent extends TeamcraftPageComponent {

  public gtData$: Observable<NpcData>;

  public xivapiNpc$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public trades$: Observable<TradeSource[]>;

  public leves$: Observable<number[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
              private i18n: I18nToolsService, public translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'npcs', 'npcId');

    const npcId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('npcId'))
    );

    this.gtData$ = npcId$.pipe(
      switchMap(id => {
        return this.gt.getNpc(+id);
      }),
      shareReplay(1)
    );

    this.xivapiNpc$ = npcId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.ENpcResident, +id);
      }),
      shareReplay(1)
    );

    this.trades$ = this.gtData$.pipe(
      switchMap(gtData => {
        return this.lazyData.getRow('npcs', gtData.npc.id).pipe(
          map(npcEntry => ({ gtData, npcEntry }))
        );
      }),
      map(({ gtData, npcEntry }) => {
        if (gtData.npc.shops === undefined) {
          return [];
        }
        return gtData.npc.shops
          .filter(shop => +shop.entries[0] !== shop.entries[0])
          .map(shop => {
            const npc: TradeNpc = { id: gtData.npc.id };
            if (npcEntry.position !== null) {
              npc.coords = { x: npcEntry.position.x, y: npcEntry.position.y };
              npc.zoneId = npcEntry.position.zoneid;
              npc.mapId = npcEntry.position.map;
            }
            return {
              shopName: shop.name,
              npcs: [
                npc
              ],
              trades: shop.entries.map(row => {
                return <Trade>{
                  currencies: (row.currency || []).map(currency => {
                    const partial = gtData.getPartial(currency.id, 'item');
                    const currencyPartial = partial && partial.obj;
                    if (currencyPartial) {
                      return <TradeEntry>{
                        id: currencyPartial.i,
                        icon: currencyPartial.c,
                        amount: currency.amount,
                        hq: currency.hq === 1
                      };
                    }
                    return undefined;
                  }).filter(res => res !== undefined),
                  items: (row.item || []).map(tradeItem => {
                    const itemPartialFetch = gtData.getPartial(tradeItem.id, 'item');
                    if (itemPartialFetch !== undefined) {
                      const itemPartial = itemPartialFetch.obj;
                      return <TradeEntry>{
                        id: itemPartial.i,
                        icon: itemPartial.c,
                        amount: tradeItem.amount,
                        hq: tradeItem.hq === 1
                      };
                    }
                    return undefined;
                  }).filter(res => res !== undefined)
                };
              })
            };
          });
      })
    );

    this.links$ = this.xivapiNpc$.pipe(
      map((xivapiNpc) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#npc/${xivapiNpc.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiNpc.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );

    this.leves$ = npcId$.pipe(
      map(npcId => {
        return levemetes[npcId];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiNpc$.pipe(
      map(npc => {
        return {
          title: this.getName(npc),
          description: this.getDescription(npc),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/npc/${npc.ID}/${this.getName(npc).split(' ').join('-')}`,
          image: `https://xivapi.com/${npc.Icon}`
        };
      })
    );
  }

  private getDescription(npc: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(npc, 'Title'));
  }

  private getName(npc: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.i18n.xivapiToI18n(npc));
  }

}
