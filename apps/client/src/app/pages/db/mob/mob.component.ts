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
import * as monsters from '../../../core/data/sources/monsters.json';
import { MobData } from '../../../model/garland-tools/mob-data';

@Component({
  selector: 'app-mob',
  templateUrl: './mob.component.html',
  styleUrls: ['./mob.component.less']
})
export class MobComponent extends TeamcraftPageComponent {

  public gtData$: Observable<MobData | {}>;

  public xivapiMob$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
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
        return this.gt.getMob(this.getGTMobId(+id));
      }),
      catchError(() => of({})),
      shareReplay(1)
    );

    this.xivapiMob$ = mobId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.BNpcName, +id);
      }),
      map(mob => {
        mob.mappyData = monsters[mob.ID];
        return mob;
      }),
      shareReplay(1)
    );

    this.links$ = combineLatest([this.xivapiMob$, this.gtData$]).pipe(
      map(([xivapiMob, gtData]) => {
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
    const monsterEntry = monsters[bnpcNameId];
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
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/mob/${mob.ID}/${this.getName(mob).split(' ').join('-')}`,
          image: `https://xivapi.com/${mob.Icon}`
        };
      })
    );
  }
}
