import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { combineLatest, Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SeoService } from '../../../core/seo/seo.service';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { MobData } from '../../../model/garland-tools/mob-data';
import { Vector2 } from '../../../core/tools/vector2';
import { mapIds } from '../../../core/data/sources/map-ids';
import { SettingsService } from '../../../modules/settings/settings.service';
import { monsterDrops } from '../../../core/data/sources/monster-drops';

@Component({
  selector: 'app-mob',
  templateUrl: './mob.component.html',
  styleUrls: ['./mob.component.less']
})
export class MobComponent extends TeamcraftPageComponent {

  public gtData$: Observable<MobData | {}>;

  public xivapiMob$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public drops$: Observable<number[]>;

  public spawns$: Observable<{ map: number, zoneid: number, level: number, positions: Vector2[] }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService, public settings: SettingsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getMob(+params.get('mobId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getMob(+params.get('mobId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getMob(+params.get('mobId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const mobId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('mobId'))
    );

    this.gtData$ = mobId$.pipe(
      switchMap(id => {
        return this.gt.getMob(this.getGTMobId(+id))
          .pipe(
            catchError(() => of({ mob: { id: +id } }))
          );
      }),
      shareReplay(1)
    );

    this.drops$ = this.gtData$.pipe(
      map((data: MobData) => {
        if (data.mob && data.mob.drops) {
          return data.mob.drops;
        }
        return monsterDrops[data.mob.id] || [];
      })
    );

    this.xivapiMob$ = mobId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.BNpcName, +id);
      }),
      map(mob => {
        mob.mappyData = this.lazyData.data.monsters[mob.ID];
        return mob;
      }),
      shareReplay(1)
    );

    this.spawns$ = this.xivapiMob$.pipe(
      map(mob => {
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
        const mobHuntSpawns = this.lazyData.data.hunts.find(h => (h.hunts || []).some(hh => hh.name.toLowerCase() === mob.Name_en.toLowerCase()));
        if (mobHuntSpawns !== undefined) {
          const mapIdEntry = mapIds.find(entry => entry.territory === mobHuntSpawns.zoneid);
          const c = mapIdEntry.scale / 100;
          spawns.push({
              map: mapIdEntry.id,
              level: '??',
              zoneid: mapIdEntry.zone,
              positions: mobHuntSpawns.hunts.find(hh => hh.name.toLowerCase() === mob.Name_en.toLowerCase())
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
        const gtId = this.getGTMobId(xivapiMob.ID);
        const links = [];
        if (gtId.length > 0) {
          links.push({
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#mob/${gtId}`,
            icon: 'https://garlandtools.org/favicon.png'
          });
        }
        return [
          ...links,
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiMob.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  private getGTMobId(bnpcNameId: number): string {
    const monsterEntry = this.lazyData.data.monsters[bnpcNameId];
    if (monsterEntry === undefined) {
      return '';
    }
    return `${monsterEntry.baseid}${bnpcNameId < 1000 ? '0000000' : '000000'}${bnpcNameId}`;
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Name_${this.translate.currentLang}`] || item.Name_en;
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
}
