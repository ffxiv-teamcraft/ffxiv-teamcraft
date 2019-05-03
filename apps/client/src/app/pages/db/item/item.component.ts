import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ItemData } from '../../../model/garland-tools/item-data';
import { map, switchMap } from 'rxjs/operators';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoService } from '../../../core/seo/seo.service';
import { DataService } from '../../../core/api/data.service';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class ItemComponent extends TeamcraftPageComponent {

  public xivapiItem$: Observable<any>;

  public garlandToolsItem$: Observable<ItemData>;

  constructor(private route: ActivatedRoute, private xivapi: XivapiService,
              private gt: DataService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private translate: TranslateService,
              seo: SeoService) {
    super(seo);
    const itemId$ = this.route.paramMap.pipe(
      map(params => params.get('itemId'))
    );

    this.xivapiItem$ = itemId$.pipe(
      switchMap(itemId => {
        return this.xivapi.get(XivapiEndpoint.Item, +itemId);
      })
    );

    this.garlandToolsItem$ = itemId$.pipe(
      switchMap(itemId => {
        return this.gt.getItem(+itemId);
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.xivapiItem$.pipe(
      map(item => {
        return {
          title: this.i18n.getName(this.l12n.getItem(item.ID)),
          description: item[`Description_${this.translate.currentLang}`] || item.Description_en,
          url: `https://ffxivteamcraft.com/db/item/${item.ID}`
        };
      })
    );
  }

}
