import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SettingsService } from '../../../modules/settings/settings.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyStatusesDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-statuses-database-page';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, I18nDisplayComponent, DbCommentsComponent, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, IfMobilePipe, XivapiIconPipe]
})
export class StatusComponent extends TeamcraftPageComponent {

  public status$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('statusId')),
    switchMap(id => this.lazyData.getRow('statusesDatabasePages', +id)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]> = of([]);

  constructor(private route: ActivatedRoute, private lazyData: LazyDataFacade,
              private i18n: I18nToolsService,
              private translate: TranslateService, private router: Router,
              public settings: SettingsService, seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'statuses', 'statusId');
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.status$.pipe(
      map(status => {
        return {
          title: this.getName(status),
          description: this.getDescription(status),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/status/${status.id}/${this.getName(status).split(' ').join('-')}`,
          image: `https://xivapi.com${status.icon}`
        };
      })
    );
  }

  private getDescription(status: LazyStatusesDatabasePage): string {
    return this.i18n.getName(status.description);
  }

  private getName(status: LazyStatusesDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(status);
  }
}
