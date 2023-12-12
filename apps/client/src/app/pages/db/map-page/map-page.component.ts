import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { MapRelatedElement } from './map-related-element';
import { MapMarker } from '../../../modules/map/map-marker';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { mapIds } from '../../../core/data/sources/map-ids';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { MapComponent } from '../../../modules/map/map/map.component';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-map-page',
    templateUrl: './map-page.component.html',
    styleUrls: ['./map-page.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, NzDividerModule, NzCardModule, NzSelectModule, FormsModule, MapComponent, FullpageMessageComponent, NzListModule, I18nNameComponent, DbButtonComponent, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, IfMobilePipe, XivapiIconPipe, MapNamePipe]
})
export class MapPageComponent extends TeamcraftPageComponent {

  public mapId$: Observable<number>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public related$: Observable<MapRelatedElement[]>;

  public relatedDisplay$: Observable<MapRelatedElement[]>;

  public markers$: Observable<MapMarker[]>;

  public enabledTypes$ = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('map-page:selected-types') || '[]'));

  public availableTypes = ['fate', 'mob', 'npc', 'node'];

  private highlight$ = new BehaviorSubject<MapRelatedElement>(null);

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService, private translate: TranslateService,
              router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    route.paramMap.pipe(
      takeUntil(this.onDestroy$),
      switchMap(params => {
        const slug = params.get('slug');
        return i18n.getMapName(+params.get('mapId')).pipe(
          map(name => {
            const correctSlug = name.split(' ').join('-');
            return { slug, correctSlug };
          })
        );
      })
    ).subscribe(({ slug, correctSlug }) => {
      if (slug === null) {
        router.navigate(
          [correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      } else if (slug !== correctSlug) {
        router.navigate(
          ['../', correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      }
    });

    this.mapId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => +params.get('mapId'))
    );

    this.related$ = this.mapId$.pipe(
      switchMap(id => {
        return combineLatest([
          this.getFates(id),
          this.getMobs(id),
          this.getNpcs(id),
          this.getNodes(id)
        ]);
      }),
      map((res) => res.flat()),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const filteredTypes$ = combineLatest([this.related$, this.enabledTypes$]).pipe(
      tap(([, enabledTypes]) => {
        localStorage.setItem('map-page:selected-types', JSON.stringify(enabledTypes));
      }),
      map(([related, enabledTypes]) => {
        return related.filter(row => enabledTypes.indexOf(row.type) > -1);
      })
    );

    this.markers$ = combineLatest([filteredTypes$, this.highlight$]).pipe(
      map(([related, highlight]) => {
        if (highlight === null) {
          return related.map(element => element.marker);
        }
        return related.map(element => {
          const marker = element.marker;
          if (element.id === highlight.id && element.type === highlight.type) {
            return {
              ...marker,
              additionalStyle: {
                ...marker.additionalStyle,
                width: '48px',
                height: '48px',
                'max-width': '48px',
                'max-height': '48px',
                'z-index': 500
              }
            };
          } else {
            return {
              ...marker,
              additionalStyle: {
                ...marker.additionalStyle,
                opacity: 0.3
              }
            };
          }
        });
      })
    );

    this.relatedDisplay$ = combineLatest([this.related$, this.enabledTypes$]).pipe(
      map(([related, enabledTypes]) => {
        return related
          .filter(row => enabledTypes.indexOf(row.type) > -1)
          .reduce((display, row) => {
            let displayRow = display.find(d => d.type === row.type);
            if (displayRow === undefined) {
              display.push({
                type: row.type,
                elements: []
              });
              displayRow = display[display.length - 1];
            }
            if ((row.type === 'mob' || row.type === 'hunt') && displayRow.elements.find(el => el.id === row.id) !== undefined) {
              return display;
            }
            displayRow.elements.push(row);
            return display;
          }, []);
      })
    );

    this.links$ = this.mapId$.pipe(
      switchMap((id) => {
        const entry = mapIds.find((m) => m.id === id);
        return this.lazyData.getRow('places', entry?.zone).pipe(
          map(place => {
            return [
              {
                title: 'Gamer Escape',
                url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(place.en.split(' ').join('_'))}`,
                icon: './assets/icons/ge.png'
              }
            ];
          })
        );
      })
    );
  }

  public highlight(row: MapRelatedElement, highlight: boolean): void {
    if (highlight) {
      this.highlight$.next(row);
    } else {
      this.highlight$.next(null);
    }
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.mapId$.pipe(
      switchMap((id) => {
        return combineLatest([
          this.getName(id),
          this.lazyData.getRow('maps', id)
        ]).pipe(
          map(([title, mapData]) => {
            return {
              title,
              description: '',
              url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/map/${id}/${title.split(' ').join('-')}`,
              image: mapData.image
            };
          })
        );
      })
    );
  }

  private getFates(mapId: number): Observable<MapRelatedElement[]> {
    return this.lazyData.getEntry('fates').pipe(
      map(fates => {
        return Object.keys(fates)
          .map(key => {
            const fate = fates[+key];
            const position = fate.position;
            return position ? { ...fate, id: +key } : null;
          })
          .filter(fate => fate !== null && fate.position.map === mapId)
          .map(fate => {
            return <MapRelatedElement>{
              type: 'fate',
              id: fate.id,
              name: fate.name,
              description: fate.description,
              coords: {
                x: fate.position.x,
                y: fate.position.y
              },
              marker: {
                iconType: 'img',
                iconImg: `https://xivapi.com${fate.icon}`,
                x: fate.position.x,
                y: fate.position.y,
                tooltip: this.i18n.getName(fate.name)
              },
              link: `/db/${this.translate.currentLang}/fate/${fate.id}`
            };
          });
      })
    );
  }

  private getNpcs(mapId: number): Observable<MapRelatedElement[]> {
    return this.lazyData.getEntry('npcs').pipe(
      map(npcs => {
        return Object.keys(npcs)
          .map(key => {
            const npc = npcs[+key];
            const position = npc.position;
            return position ? { ...npc, id: +key } : null;
          })
          .filter(npc => npc !== null && npc.position.map === mapId && npc.en !== '')
          .map(npc => {
            return <MapRelatedElement>{
              type: 'npc',
              id: npc.id,
              name: npc,
              coords: {
                x: npc.position.x,
                y: npc.position.y
              },
              marker: {
                iconType: 'img',
                iconImg: `https://xivapi.com/c/ENpcResident.png`,
                x: npc.position.x,
                y: npc.position.y,
                tooltip: this.i18n.getName(npc),
                link: `/db/${this.translate.currentLang}/npc/${npc.id}`
              }
            };
          });
      })
    );

  }

  private getNodes(mapId: number): Observable<MapRelatedElement[]> {
    return this.lazyData.getEntry('nodes').pipe(
      map(nodes => {
        const fromNodePositions = Object.keys(nodes)
          .map(key => {
            return { ...nodes[key], id: +key };
          })
          .filter(node => node !== null && node.map === mapId && !node.items.some(i => i > 2000000))
          .map(node => {
            return <MapRelatedElement>{
              type: 'node',
              linkType: node.type === 4 ? 'spearfishing-spot' : 'node',
              id: node.id,
              name: this.i18n.createFakeI18n(`lvl ${node.level}`),
              additionalData: node.items.map(i => ({ id: i })),
              coords: {
                x: node.x,
                y: node.y
              },
              marker: {
                iconType: 'img',
                iconImg: node.limited ? NodeTypeIconPipe.timed_icons[node.type] : NodeTypeIconPipe.icons[node.type],
                x: node.x,
                y: node.y,
                link: `/db/${this.translate.currentLang}/${node.type === 4 ? 'spearfishing-spot' : 'node'}/${node.id}`
              }
            };
          });


        return _.uniqBy(fromNodePositions, 'id');
      })
    );
  }

  private getMobs(placeNameId: number): Observable<MapRelatedElement[]> {
    return this.lazyData.getEntry('monsters').pipe(
      map(monsters => {
        return [].concat.apply([], Object.keys(monsters)
          .map(key => {
            const monster = monsters[key];
            monster.positions = cloneDeep(monster.positions).filter(p => p.zoneid === placeNameId);
            return { id: +key, ...monster };
          })
          .filter(monster => {
            return monster.positions.length > 0;
          })
          .map(mob => {
            return mob.positions.map(position => {
              return <MapRelatedElement>{
                type: 'mob',
                id: mob.id,
                name: this.lazyData.getI18nName('mobs', mob.id),
                description: this.i18n.createFakeI18n(`lvl ${position.level}`),
                coords: {
                  x: position.x,
                  y: position.y
                },
                marker: {
                  iconType: 'img',
                  iconImg: `https://xivapi.com/c/BNpcName.png`,
                  x: position.x,
                  y: position.y,
                  zIndex: 4
                },
                link: `/db/${this.translate.currentLang}/mob/${mob.id}`
              };
            });
          })
        );
      })
    );
  }

  private getName(id: number): Observable<string> {
    return this.i18n.getMapName(id);
  }
}
