import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyPatchName } from '@ffxiv-teamcraft/data/model/lazy-patch-name';
import { LazyRowPipe } from '../../../pipes/pipes/lazy-row.pipe';
import { MapIdPipe } from '../../../pipes/pipes/map-id.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { XivapiL12nPipe } from '../../../pipes/pipes/xivapi-l12n.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { DbCommentsComponent } from '../db-comments/db-comments/db-comments.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { LazyScrollComponent } from '../../../modules/lazy-scroll/lazy-scroll/lazy-scroll.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { I18nDisplayComponent } from '../../../modules/i18n-display/i18n-display/i18n-display.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-patch',
    templateUrl: './patch.component.html',
    styleUrls: ['./patch.component.less'],
    standalone: true,
    imports: [NgIf, FlexModule, I18nDisplayComponent, NzDividerModule, NzCardModule, NzListModule, LazyScrollComponent, DbButtonComponent, ItemIconComponent, DbCommentsComponent, PageLoaderComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, IfMobilePipe, XivapiIconPipe, XivapiL12nPipe, LazyIconPipe, MapIdPipe, LazyRowPipe]
})
export class PatchComponent extends TeamcraftPageComponent {

  public patch$: Observable<LazyPatchName>;

  public fallbackIcon = 'https://img.finalfantasyxiv.com/lds/h/k/aL011xxU_6LyWUio1Gi2Fx7-qo.svg';

  constructor(private route: ActivatedRoute, private i18n: I18nToolsService, private translate: TranslateService,
              private router: Router, private lazyData: LazyDataFacade,
              public settings: SettingsService, seo: SeoService) {
    super(seo);

    this.route.paramMap
      .pipe(
        switchMap(params => {
          return this.lazyData.patches$.pipe(
            map(patches => {
              return [params, patches];
            })
          );
        })
      )
      .subscribe(([params, patches]: [ParamMap, LazyPatchName[]]) => {
        const slug = params.get('slug');
        if (slug === null) {
          this.router.navigate(
            [this.getName(patches.find(patch => patch.id === +params.get('patchId'))).split(' ').join('-')],
            {
              relativeTo: this.route,
              replaceUrl: true
            }
          );
        } else if (slug !== this.getName(patches.find(patch => patch.id === +params.get('patchId'))).split(' ').join('-')) {
          this.router.navigate(
            ['../', this.getName(patches.find(patch => patch.id === +params.get('patchId'))).split(' ').join('-')],
            {
              relativeTo: this.route,
              replaceUrl: true
            }
          );
        }
      });

    const patchId$ = this.route.paramMap.pipe(
      filter(params => params.get('slug') !== null),
      map(params => +params.get('patchId'))
    );

    this.patch$ = patchId$.pipe(
      switchMap(patchId => {
        return this.lazyData.patches$.pipe(
          map(patches => {
            return [patchId, patches] as [number, LazyPatchName[]];
          })
        );
      }),
      map(([id, patches]) => {
        return patches.find(p => p.id === id);
      }),
      switchMap(patch => {
        return this.lazyData.getRow('patchContent', patch.id).pipe(
          map(patchContent => {
            return {
              ...patch,
              ...patchContent
            };

          })
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return this.patch$.pipe(
      map(patch => {
        return {
          title: this.getName(patch),
          description: this.getDescription(patch),
          url: `https://ffxivteamcraft.com/db/${this.translate.currentLang}/patch/${patch.id}/${this.getName(patch).split(' ').join('-')}`,
          image: patch.banner || this.fallbackIcon
        };
      })
    );
  }

  private getDescription(patch: any): string {
    return `Everything added in patch ${patch.Version}`;
  }

  private getName(patch: LazyPatchName): string {
    // We might want to add more details for some specific items, which is why this is a method.
    return this.i18n.getName(patch);
  }
}
