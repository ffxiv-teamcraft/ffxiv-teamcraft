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
import { distinctUntilChanged, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import * as shape from 'd3-shape';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';

@Component({
  selector: 'app-fish',
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.less']
})
export class FishComponent extends TeamcraftPageComponent {

  public xivapiFish$: Observable<any>;

  public reloader$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  public gubalData$: Observable<any>;

  public highlightTime$ = this.etime.getEorzeanTime().pipe(
    distinctUntilChanged((a, b) => a.getUTCHours() === b.getUTCHours()),
    map(time => {
      return [{
        name: `${time.getUTCHours()}:00`,
        value: this.settings.theme.highlight
      }];
    })
  );

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService, public settings: SettingsService,
              private apollo: Apollo, private etime: EorzeanTimeService, seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getItem(+params.get('fishId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getItem(+params.get('fishId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getItem(+params.get('fishId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const fishId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('fishId'))
    );

    this.xivapiFish$ = fishId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Item, +id);
      }),
      shareReplay(1)
    );

    this.gubalData$ = combineLatest([fishId$, this.reloader$]).pipe(
      switchMap(([fishId]) => {
        const dataQuery = gql`
          query fishData {
            etimes_per_fish(where: {itemId: {_eq: ${fishId}}}) {
              etime
              occurences
            }
            baits_per_fish(where: {itemId: {_eq: ${fishId}}}) {
              baitId
              occurences
            }
            hooksets_per_fish(where:{itemId: {_eq: ${fishId}}, hookset: {_neq: 0}}) {
              hookset,
              occurences
            }
            tug_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              tug,
              occurences
            }
            bite_time_per_fish(where:{itemId: {_eq: ${fishId}}}) {
              biteTime,
              occurences
            }
          }
        `;
        return this.apollo.query<any>({ query: dataQuery });
      }),
      map(result => {
        const hours = Array.from(Array(24).keys());
        const totalHooksets = result.data.hooksets_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const totalTugs = result.data.tug_per_fish.reduce((acc, row) => acc + row.occurences, 0);
        const sortedBiteTimes = result.data.bite_time_per_fish.sort((a, b) => a.biteTime - b.biteTime);
        return {
          etimesChart: {
            view: [600, 300],
            data: hours.map(hour => {
              const match = result.data.etimes_per_fish.find(fish => fish.etime === hour);
              return match ? {
                name: `${match.etime}:00`,
                value: match.occurences
              } : {
                name: `${hour}:00`,
                value: 0
              };
            })
          },
          baitsChart: {
            view: [600, 300],
            data: result.data.baits_per_fish
              .sort((a, b) => {
                return b.occurences - a.occurences;
              })
              .map(entry => {
                return {
                  name: this.i18n.getName(this.l12n.getItem(entry.baitId)),
                  value: entry.occurences
                };
              })
          },
          biteTimeChart: {
            view: [600, 300],
            data: [
              {
                name: '',
                series: sortedBiteTimes.map(entry => {
                  return {
                    name: entry.biteTime / 10,
                    value: entry.occurences
                  };
                })
              }
            ],
            curve: shape.curveBasisOpen,
            min: sortedBiteTimes[0].biteTime / 10,
            max: sortedBiteTimes[sortedBiteTimes.length - 1].biteTime / 10
          },
          hooksets: result.data.hooksets_per_fish
            .sort((a, b) => b.occurences - a.occurences)
            .map(entry => {
              entry.hookset = entry.hookset === 1 ? 4103 : 4179;
              entry.percent = 100 * entry.occurences / totalHooksets;
              return entry;
            }),
          tugs: result.data.tug_per_fish
            .sort((a, b) => b.occurences - a.occurences)
            .map(entry => {
              entry.tugName = ['Medium', 'Light', 'Big'][entry.tug];
              entry.percent = 100 * entry.occurences / totalTugs;
              return entry;
            })
        };
      })
    );
  }

  private getName(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Name_${this.translate.currentLang}`] || item.Name_en;
  }

  private getDescription(item: any): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return item[`Description_${this.translate.currentLang}`] || item.Description_en;
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiFish$.pipe(
      map(item => {
        return {
          title: this.getName(item),
          description: this.getDescription(item),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/item/${item.ID}/${this.getName(item).split(' ').join('+')}`,
          image: `https://xivapi.com/i2/ls/${item.ID}.png`
        };
      })
    );
  }
}
