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
import { LazyTraitsDatabasePage } from '@ffxiv-teamcraft/data/model/lazy-traits-database-page';
import { I18nName } from '@ffxiv-teamcraft/types';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { XivapiActionTooltipDirective } from '../../../modules/tooltip/xivapi-action-tooltip/xivapi-action-tooltip.directive';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-trait',
    templateUrl: './trait.component.html',
    styleUrls: ['./trait.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nNameComponent, DbButtonComponent, NgFor, NzToolTipModule, DbCommentsComponent, NzDividerModule, NzCardModule, NzListModule, XivapiActionTooltipDirective, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, ActionIconPipe, ActionNamePipe, IfMobilePipe, XivapiIconPipe, NzPipesModule]
})
export class TraitComponent extends TeamcraftPageComponent {

  public trait$ = this.route.paramMap.pipe(
    filter(params => params.get('slug') !== null),
    map(params => params.get('traitId')),
    switchMap(id => {
      return this.lazyData.getRow('traitsDatabasePages', +id);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public links$: Observable<{ title: string, icon: string, url: string }[]>;

  public relatedActions$: Observable<number[]>;

  constructor(private route: ActivatedRoute,
              private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade, public settings: SettingsService,
              seo: SeoService) {
    super(seo);
    this.updateSlug(router, i18n, route, 'traits', 'traitId');

    this.relatedActions$ = this.trait$.pipe(
      map(trait => trait.actions)
    );

    this.links$ = this.trait$.pipe(
      map((trait) => {
        return [
          {
            title: 'Gamer Escape',
            url: `https://ffxiv.gamerescape.com/wiki/${encodeURIComponent(trait.en.toString().split(' ').join('_'))}`,
            icon: './assets/icons/ge.png'
          }
        ];
      })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.trait$.pipe(
      map(trait => {
        return {
          title: this.getName(trait),
          description: this.getDescription(trait),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/trait/${trait.id}/${this.getName(trait).split(' ').join('-')}`,
          image: `https://xivapi.com${trait.icon}`
        };
      })
    );
  }

  private getDescription(trait: LazyTraitsDatabasePage): string {
    return this.i18n.getName(trait.description as I18nName);
  }

  private getName(trait: LazyTraitsDatabasePage): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(trait);
  }
}
