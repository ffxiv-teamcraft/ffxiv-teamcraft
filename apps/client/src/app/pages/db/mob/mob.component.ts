import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { mapIds } from '../../../core/data/sources/map-ids';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { MapService } from '../../../modules/map/map.service';
import { LazyMobsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-mobs-database-page';

@Component({
  selector: 'app-mob',
  templateUrl: './mob.component.html',
  styleUrls: ['./mob.component.less']
})
export class MobComponent extends TeamcraftPageComponent {

  public mob$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('mobId')),
    switchMap(id => {
      return this.lazyData.getRow('mobsDatabasePages', +id);
    })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public drops$: Observable<number[]>;

  public spawns$: Observable<{ map: number, zoneid: number, level: number, positions: Vector2[] }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              private mapService: MapService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'mobs', 'mobId');

    this.drops$ = this.mob$.pipe(
      map(mob => mob.drops)
    );

    this.spawns$ = this.mob$.pipe(
      withLazyData(this.lazyData, 'hunts'),
      map(([mob, hunts]) => {
        const spawns = [];
        if (mob.monster?.positions !== undefined) {
          for (const position of mob.monster.positions) {
            let mapRow = spawns.find(entry => entry.map === position.map);
            if (mapRow === undefined) {
              spawns.push({
                map: position.map,
                level: position.level,
                zoneid: position.zoneid,
                positions: [],
                marker: null
              });
              mapRow = spawns[spawns.length - 1];
            }
            mapRow.positions.push({ x: position.x, y: position.y });
            mapRow.marker = this.mapService.getAvgPosition(mapRow.positions);
          }
        }
        const mobHuntSpawns = hunts.find(h => (h.hunts || []).some(hh => hh.name.toLowerCase() === mob.en.toLowerCase()));
        if (mobHuntSpawns !== undefined) {
          const mapIdEntry = mapIds.find(entry => entry.territory === mobHuntSpawns.zoneid);
          const c = mapIdEntry.scale / 100;
          spawns.push({
              map: mapIdEntry.id,
              level: '??',
              zoneid: mapIdEntry.zone,
              positions: (mobHuntSpawns.hunts ?? []).find(hh => hh.name.toLowerCase() === mob.en.toLowerCase())
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

    this.links$ = this.mob$.pipe(
      map((mob) => {
        return [
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(mob.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.mob$.pipe(
      map((mob) => {
        return {
          title: this.getName(mob),
          description: '',
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/${this.translate.currentLang}/mob/${mob.id}/${this.getName(mob).split(' ').join('-')}`,
          image: `https://xivapi.com/c/BNpcName.png`
        };
      })
    );
  }

  private getName(mob: LazyMobsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(mob);
  }
}
