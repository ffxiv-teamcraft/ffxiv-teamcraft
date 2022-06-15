import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import * as _ from 'lodash';
import { MapRelatedElement } from './map-related-element';
import { MapMarker } from '../../../modules/map/map-marker';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { mapIds } from '../../../core/data/sources/map-ids';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.less']
})
export class MapPageComponent extends TeamcraftPageComponent {

  public map$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public related$: Observable<MapRelatedElement[]>;

  public relatedDisplay$: Observable<MapRelatedElement[]>;

  public markers$: Observable<MapMarker[]>;

  public enabledTypes$ = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('map-page:selected-types') || '[]'));

  public availableTypes = ['fate', 'mob', 'npc', 'node'];

  private highlight$ = new BehaviorSubject<MapRelatedElement>(null);

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade,
              private htmlTools: HtmlToolsService, private http: HttpClient, public settings: SettingsService,
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

    const mapId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('mapId'))
    );

    this.map$ = mapId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Map, +id);
      }),
      switchMap(mapData => {
        return this.xivapi.get(XivapiEndpoint.PlaceName, mapData.PlaceNameTargetID)
          .pipe(
            map(placeName => {
              mapData.GameContentLinks = this.mergeGameContentLinks(mapData, placeName);
              return mapData;
            })
          );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.related$ = this.map$.pipe(
      switchMap(mapData => {
        return combineLatest([
          this.getFates(mapData.ID),
          this.getMobs(mapData.ID),
          this.getNpcs(mapData.ID),
          this.getNodes(mapData.ID)
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

    this.links$ = this.map$.pipe(
      switchMap((mapData) => {
        const entry = mapIds.find((m) => m.id === mapData.ID);
        return this.lazyData.getRow('places', entry?.zone).pipe(
          map(place => {
            return [
              {
                title: 'Gamer Escape',
                url: `https://ffxiv.gamerescape.com/wiki/${place.en.split(' ').join('_')}`,
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
    return this.map$.pipe(
      switchMap((mapData) => {
        return this.getName(mapData).pipe(
          map(title => {
            return {
              title,
              description: '',
              url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/map/${mapData.ID}/${title.split(' ').join('-')}`,
              image: `https://xivapi.com${mapData.MapFilename}`
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
        const fromBell = (window as any).gt.bell.nodes
          .filter(node => {
            return this.lazyData.getMapId(node.zone) === mapId;
          })
          .map(node => {
            node.type = ['Rocky Outcropping', 'Mineral Deposit', 'Mature Tree', 'Lush Vegetation'].indexOf(node.type);
            return <MapRelatedElement>{
              type: 'node',
              id: node.id,
              name: this.i18n.createFakeI18n(`lvl ${node.lvl}`),
              additionalData: node.items.map(i => {
                return {
                  id: i.id,
                  slot: i.slot
                };
              }),
              coords: {
                x: node.coords[0],
                y: node.coords[1]
              },
              marker: {
                iconType: 'img',
                iconImg: [
                  './assets/icons/map/min4.png',
                  './assets/icons/map/min3.png',
                  './assets/icons/map/btn4.png',
                  './assets/icons/map/btn3.png',
                  './assets/icons/map/fsh2.png'
                ][node.type],
                x: node.coords[0],
                y: node.coords[1],
                link: `/db/${this.translate.currentLang}/node/${node.id}`
              }
            };
          });


        return _.uniqBy([...fromBell, ...fromNodePositions], 'id');
      })
    );
  }

  private getMobs(placeNameId: number): Observable<MapRelatedElement[]> {
    return this.lazyData.getEntry('monsters').pipe(
      map(monsters => {
        return [].concat.apply([], Object.keys(monsters)
          .map(key => {
            const monster = monsters[key];
            monster.positions = monster.positions.filter(p => p.zoneid === placeNameId);
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

  private mergeGameContentLinks(mapData: any, placeName: any): any {
    mapData.GameContentLinks = mapData.GameContentLinks || {};
    Object.keys(placeName.GameContentLinks || {}).forEach(key => {
      if (mapData.GameContentLinks[key] === undefined) {
        mapData.GameContentLinks[key] = placeName.GameContentLinks[key];
      } else {
        const mapLink = mapData.GameContentLinks[key];
        const placeNameLink = placeName.GameContentLinks[key];
        Object.keys(placeNameLink).forEach(linkKey => {
          if (mapLink[linkKey] !== undefined) {
            mapLink[linkKey] = _.uniq([
              ...mapLink[linkKey],
              ...placeNameLink[linkKey]
            ]);
          } else {
            mapLink[linkKey] = placeNameLink[linkKey];
          }
        });
      }
    });
    return mapData.GameContentLinks;
  }

  private getName(mapData: any): Observable<string> {
    return this.i18n.getMapName(mapData.ID);
  }
}
