import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyFatesDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-fates-database-page';
import { UiTextPipe } from '../../../modules/tooltip/xiv-ui-text.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { ItemRarityDirective } from '../../../core/item-rarity/item-rarity.directive';
import { NzListModule } from 'ng-zorro-antd/list';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-fate',
    templateUrl: './fate.component.html',
    styleUrls: ['./fate.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, NzDividerModule, NzCardModule, MapComponent, NzListModule, ItemRarityDirective, ItemIconComponent, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, IfMobilePipe, XivapiIconPipe, UiTextPipe]
})
export class FateComponent extends TeamcraftPageComponent {

  public fate$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('fateId')),
    switchMap(fateId => this.lazyData.getRow('fatesDatabasePages', +fateId)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService,
              private lazyData: LazyDataFacade,
              private translate: TranslateService, private router: Router,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'fates', 'fateId');

    this.links$ = this.fate$.pipe(
      map((fate) => {
        return [
          {
            title: 'GarlandTools',
            url: `https://www.garlandtools.org/db/#fate/${fate.id}`,
            icon: 'https://garlandtools.org/favicon.png'
          },
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${fate.en.toString().split(' ').join('_').replace('\'', '%27')}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.fate$.pipe(
      map(fate => {
        return {
          title: this.getName(fate),
          description: this.getDescription(fate),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/fate/${fate.id}/${this.getName(fate).split(' ').join('-')}`,
          image: `https://xivapi.com${fate.icon}`
        };
      })
    );
  }

  private getDescription(fate: LazyFatesDatabasePage): string {
    return this.i18n.getName(fate.description);
  }

  private getName(fate: LazyFatesDatabasePage): string {
    return this.i18n.getName(fate);
  }
}
