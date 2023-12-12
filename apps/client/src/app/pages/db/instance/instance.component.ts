import { Component } from '@angular/core';
import { SeoService } from '../../../core/seo/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyInstance } from '@ffxiv-teamcraft/data/model/lazy-instance';
import { I18nName } from '@ffxiv-teamcraft/types';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiL12nPipe } from '../../../pipes/pipes/xivapi-l12n.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-instance',
    templateUrl: './instance.component.html',
    styleUrls: ['./instance.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, NzDividerModule, NzCardModule, MapComponent, ItemIconComponent, ItemRarityDirective, PageLoaderComponent, AsyncPipe, DecimalPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, IfMobilePipe, XivapiIconPipe, XivapiL12nPipe, LazyIconPipe]
})
export class InstanceComponent extends TeamcraftPageComponent {

  public lazyInstance$: Observable<LazyInstance>;

  public drops$: Observable<number[]>;

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'instances', 'instanceId');

    const instanceId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => params.get('instanceId'))
    );

    this.lazyInstance$ = instanceId$.pipe(
      switchMap(id => {
        return this.lazyData.getRow('instances', +id);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.drops$ = instanceId$.pipe(
      switchMap(id => this.lazyData.getRow('reverseInstanceSources', +id))
    );

    this.links$ = this.lazyInstance$.pipe(
      map((instance) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#instance/${instance.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(instance.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.lazyInstance$.pipe(
      map(instance => {
        return {
          title: this.getName(instance),
          description: this.getDescription(instance),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/instance/${instance.id}/${this.getName(instance).split(' ').join('-')}`,
          image: `https://xivapi.com/${instance.banner}`
        };
      })
    );
  }

  private getDescription(instance: any): string {
    return this.i18n.getName(this.i18n.xivapiToI18n(instance, 'Description'));
  }

  private getName(item: I18nName): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(item);
  }

}
