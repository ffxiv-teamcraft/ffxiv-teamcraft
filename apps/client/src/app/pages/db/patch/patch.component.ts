import { Component } from '@angular/core';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { Observable } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyPatchName } from '@ffxiv-teamcraft/data/model/lazy-patch-name';

@Component({
  selector: 'app-patch',
  templateUrl: './patch.component.html',
  styleUrls: ['./patch.component.less']
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
