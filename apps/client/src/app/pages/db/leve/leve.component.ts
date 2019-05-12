import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { DataService } from '../../../core/api/data.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { LeveData } from '../../../model/garland-tools/leve-data';
import { LinkToolsService } from '../../../core/tools/link-tools.service';

@Component({
  selector: 'app-leve',
  templateUrl: './leve.component.html',
  styleUrls: ['./leve.component.less']
})
export class LeveComponent extends TeamcraftPageComponent {

  public gtData$: Observable<LeveData>;

  public xivapiLeve$: Observable<any>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public rewards$: Observable<{ type: string, id: number, amount: number }[]>;

  public items$: Observable<{ id: number, amount: number }[]>;

  public npcs$: Observable<{ id: number, issuer?: boolean, client?: boolean }[]>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataService,
              private linkTools: LinkToolsService,
              seo: SeoService) {
    super(seo);

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug === null) {
        this.router.navigate(
          [this.i18n.getName(this.l12n.getLeve(+params.get('leveId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      } else if (slug !== this.i18n.getName(this.l12n.getLeve(+params.get('leveId'))).split(' ').join('-')) {
        this.router.navigate(
          ['../', this.i18n.getName(this.l12n.getLeve(+params.get('leveId'))).split(' ').join('-')],
          {
            relativeTo: this.route,
            replaceUrl: true
          }
        );
      }
    });

    const leveId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('leveId'))
    );

    this.gtData$ = leveId$.pipe(
      switchMap(id => {
        return this.gt.getLeve(+id);
      }),
      shareReplay(1)
    );

    this.xivapiLeve$ = leveId$.pipe(
      switchMap(id => {
        return this.xivapi.get(XivapiEndpoint.Leve, +id);
      }),
      shareReplay(1)
    );

    this.items$ = this.xivapiLeve$.pipe(
      filter(leve => leve.CraftLeve),
      map(leve => {
        return [0, 1, 2, 3]
          .filter(index => leve.CraftLeve[`Item${index}TargetID`] > 0)
          .map(index => {
            return {
              id: leve.CraftLeve[`Item${index}TargetID`],
              amount: leve.CraftLeve[`ItemCount${index}`]
            };
          });
      })
    );

    this.rewards$ = this.xivapiLeve$.pipe(
      map((leve) => {
        return [0, 1, 2, 3, 4, 5, 6, 7]
          .filter(index => {
            return leve.LeveRewardItem[`LeveRewardItemGroup${index}TargetID`] > 0;
          })
          .reduce((rewards, index) => {
            const group = leve.LeveRewardItem[`LeveRewardItemGroup${index}`];
            rewards.push({
              items: [0, 1, 2, 3, 4, 5, 6, 7, 8]
                .filter(itemIndex => group[`Item${itemIndex}TargetID`] > 0)
                .reduce((items, itemIndex) => {
                  items.push({
                    id: group[`Item${itemIndex}TargetID`],
                    amount: group[`Count${itemIndex}`],
                    hq: group[`HQ${itemIndex}`] === 1
                  });
                  return items;
                }, []),
              chances: leve.LeveRewardItem[`Probability%${index}`]
            });
            return rewards;
          }, []);
      })
    );

    this.npcs$ = combineLatest([this.xivapiLeve$, this.gtData$]).pipe(
      map(([leve, data]) => {
        const npcs = [{
          id: leve.LevelLevemete.Object,
          client: true
        }];
        return npcs;
      })
    );

    this.links$ = combineLatest([this.xivapiLeve$, this.gtData$]).pipe(
      map(([xivapiLeve, gtData]) => {
        return [
          {
            title: 'GarlandTools',
            url: `http://www.garlandtools.org/db/#leve/${xivapiLeve.ID}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${xivapiLeve.Name_en.toString().split(' ').join('_')}`,
            icon: './assets/icons/ge.png'
          }
        ];
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
    return this.xivapiLeve$.pipe(
      map((leve) => {
        return {
          title: this.getName(leve),
          description: this.getDescription(leve),
          url: `https://ffxivteamcraft.com/db/leve/${leve.ID}/${this.getName(leve).split(' ').join('-')}`,
          image: `https://xivapi.com/${leve.IconIssuer}`
        };
      })
    );
  }

}
