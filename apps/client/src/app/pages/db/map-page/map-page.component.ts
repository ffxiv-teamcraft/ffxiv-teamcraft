import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import * as _ from 'lodash';
import { MapRelatedElement } from './map-related-element';
import { MapMarker } from '../../../modules/map/map-marker';
import * as monsters from '../../../core/data/sources/monsters.json';
import * as nodePositions from '../../../core/data/sources/node-positions.json';
import { HtmlToolsService } from '../../../core/tools/html-tools.service';
import { HttpClient } from '@angular/common/http';
import { hunts } from '../../../core/data/sources/hunts';
import { tap } from 'rxjs/internal/operators/tap';
import { SettingsService } from '../../../modules/settings/settings.service';

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

  private highlight$ = new BehaviorSubject<MapRelatedElement>(null);

  public markers$: Observable<MapMarker[]>;

  public enabledTypes$ = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('map-page:selected-types') || '[]'));

  public availableTypes = ['fate', 'mob', 'npc', 'node', 'hunt'];

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
              private htmlTools: HtmlToolsService, private http: HttpClient, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getMapName(+params.get('mapId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getMapName(+params.get('mapId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getMapName(+params.get('mapId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
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
      shareReplay(1)
    );

    this.related$ = this.map$.pipe(
      map(mapData => {
        return [
          ...this.getFates(mapData.PlaceNameTargetID),
          ...this.getMobs(mapData.PlaceNameTargetID),
          ...this.getNpcs(mapData.PlaceNameTargetID),
          ...this.getNodes(mapData.PlaceNameTargetID),
          ...this.getHunts(mapData.TerritoryTypeTargetID, mapData.SizeFactor)
        ];
      }),
      shareReplay(1)
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
      map((mapData) => {
        return [
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${this.l12n.getMapName(mapData.ID).en.split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
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

  private getHunts(territoryId: number, sizeFactor: number): MapRelatedElement[] {
    const zoneHunts = hunts.find(h => h.zoneid === territoryId);
    if (zoneHunts === undefined) {
      return [];
    }
    const c = sizeFactor / 100;
    return [].concat.apply([], zoneHunts.hunts.map((hunt, index) => {
        const huntName = this.l12n.getMob(this.l12n.getMobId(hunt.name));
        return hunt.spawns.map((spawn) => {
          return <MapRelatedElement>{
            type: 'hunt',
            id: this.l12n.getMobId(hunt.name),
            name: huntName,
            coords: {
              x: (41.0 / c) * ((spawn.x + 1024) / 2048.0),
              y: (41.0 / c) * ((spawn.y + 1024) / 2048.0)
            },
            marker: {
              iconType: 'img',
              iconImg: `./assets/icons/hunt${['b', 'a', 's'][index]}.png`,
              x: (41.0 / c) * ((spawn.x + 1024) / 2048.0),
              y: (41.0 / c) * ((spawn.y + 1024) / 2048.0),
              tooltip: this.i18n.getName(huntName)
            },
            link: `/db/${this.translate.currentLang}/mob/${this.l12n.getMobId(hunt.name)}`
          };
        });
      })
    );
  }

  private getFates(placeNameId: number): MapRelatedElement[] {
    return Object.keys(this.lazyData.fates)
      .map(key => {
        const position = this.lazyData.fates[key].position;
        return position ? { ...this.lazyData.fates[key], id: +key } : null;
      })
      .filter(fate => fate !== null && fate.position.zoneid === placeNameId)
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
  }

  private getNpcs(placeNameId: number): MapRelatedElement[] {
    return Object.keys(this.lazyData.npcs)
      .map(key => {
        const position = this.lazyData.npcs[key].position;
        return position ? { ...this.lazyData.npcs[key], id: +key } : null;
      })
      .filter(npc => npc !== null && npc.position.zoneid === placeNameId && npc.en !== '')
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
  }

  private getNodes(placeNameId: number): MapRelatedElement[] {
    const fromNodePositions = Object.keys(nodePositions)
      .map(key => {
        return { ...nodePositions[key], id: +key };
      })
      .filter(node => node !== null && node.zoneid === placeNameId && !node.items.some(i => i > 2000000))
      .map(node => {
        return <MapRelatedElement>{
          type: 'node',
          id: node.id,
          name: this.i18n.createFakeI18n(`lvl ${node.level}`),
          additionalData: node.items.map(i => ({ id: i })),
          coords: {
            x: node.x,
            y: node.y
          },
          marker: {
            iconType: 'img',
            iconImg: [
              './assets/icons/map/min1.png',
              './assets/icons/map/min0.png',
              './assets/icons/map/btn1.png',
              './assets/icons/map/btn0.png',
              './assets/icons/map/fsh0.png'
            ][node.type],
            x: node.x,
            y: node.y,
            link: `/db/${this.translate.currentLang}/node/${node.id}`
          }
        };
      });
    const fromBell = (window as any).gt.bell.nodes
      .filter(node => {
        return this.l12n.getAreaIdByENName(node.zone) === placeNameId;
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
  }

  private getMobs(placeNameId: number): MapRelatedElement[] {
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
            name: this.l12n.getMob(mob.id),
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
              zIndex: 4,
              tooltip: this.i18n.getName(this.l12n.getMob(mob.id))
            },
            link: `/db/${this.translate.currentLang}/mob/${mob.id}`
          };
        });
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

  private getName(mapData: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(this.l12n.getPlace(mapData.PlaceNameTargetID));
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest([this.map$, this.lazyData.loaded$]).pipe(
      map(([mapData]) => {
        return {
          title: this.getName(mapData),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/map/${mapData.ID}/${this.getName(mapData).split(' ').join('-')}`,
          image: `https://xivapi.com${mapData.MapFilename}`
        };
      })
    );
  }
}
