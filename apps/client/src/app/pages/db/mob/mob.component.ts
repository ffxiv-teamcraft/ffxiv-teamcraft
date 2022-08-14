import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { Vector2 } from '../../../core/tools/vector2';
import { mapIds } from '../../../core/data/sources/map-ids';
import { SettingsService } from '../../../modules/settings/settings.service';
import { monsterDrops } from '../../../core/data/sources/monster-drops';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';

@Component({
  selector: 'app-mob',
  templateUrl: './mob.component.html',
  styleUrls: ['./mob.component.less']
})
export class MobComponent extends TeamcraftPageComponent {

  public xivapiMob$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public drops$: Observable<number[]>;

  public spawns$: Observable<{ map: number, zoneid: number, level: number, positions: Vector2[] }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'mobs', 'mobId');

    const mobId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('mobId'))
    );

    this.drops$ = mobId$.pipe(
      switchMap(mobId => {
        return this.lazyData.getEntry('dropSources').pipe(
          map(dropSources => {
            return [
              ...Object.keys(dropSources)
                .filter(key => dropSources[key].includes(+mobId))
                .map(key => +key),
              ...(monsterDrops[mobId] || [])
            ];
          })
        );
      })
    );

    this.xivapiMob$ = mobId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.BNpcName, +id);
      }),
      switchMap(mob => {
        return this.lazyData.getRow('monsters', mob.ID).pipe(
          map(monster => {
            mob.mappyData = monster;
            return mob;
          })
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.spawns$ = this.xivapiMob$.pipe(
      withLazyData(this.lazyData, 'hunts'),
      map(([mob, hunts]) => {
        const spawns = [];
        if (mob.mappyData !== undefined) {
          for (const position of mob.mappyData.positions) {
            let mapRow = spawns.find(entry => entry.map === position.map);
            if (mapRow === undefined) {
              spawns.push({
                map: position.map,
                level: position.level,
                zoneid: position.zoneid,
                positions: []
              });
              mapRow = spawns[spawns.length - 1];
            }
            mapRow.positions.push({ x: position.x, y: position.y });
          }
        }
        const mobHuntSpawns = hunts.find(h => (h.hunts || []).some(hh => hh.name.toLowerCase() === mob.Name_en.toLowerCase()));
        if (mobHuntSpawns !== undefined) {
          const mapIdEntry = mapIds.find(entry => entry.territory === mobHuntSpawns.zoneid);
          const c = mapIdEntry.scale / 100;
          spawns.push({
              map: mapIdEntry.id,
              level: '??',
              zoneid: mapIdEntry.zone,
              positions: (mobHuntSpawns.hunts ?? []).find(hh => hh.name.toLowerCase() === mob.Name_en.toLowerCase())
                .spawns
                .map(hSpawn => {
                  return {
                    x: (41.0 / c) * ((hSpawn.x + 1024) / 2048.0),
                    y: (41.0 / c) * ((hSpawn.y + 1024) / 2048.0)
                  };
                })
            }
          );
        }
        return spawns;
      })
    );

    this.links$ = combineLatest([this.xivapiMob$]).pipe(
      map(([xivapiMob]) => {
        return [
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(xivapiMob.Name_en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiMob$.pipe(
      map((mob) => {
        return {
          title: this.getName(mob),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/${this.translate.currentLang}/mob/${mob.ID}/${this.getName(mob).split(' ').join('-')}`,
          image: `https://xivapi.com/${mob.Icon}`
        };
      })
    );
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Name_${this.translate.currentLang}`] || item.Name_en;
  }
}
