import { SeoPageComponent } from '../seo/seo-page-component';
import { Subject } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { SeoService } from '../seo/seo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { LazyDataI18nKey } from '@ffxiv-teamcraft/types';
import { I18nToolsService } from '../tools/i18n-tools.service';

@Component({
  template: ''
})
export abstract class TeamcraftPageComponent extends SeoPageComponent implements OnDestroy {
  protected onDestroy$: Subject<void> = new Subject<void>();

  protected constructor(protected seoService: SeoService) {
    super(seoService);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    super.ngOnDestroy();
  }

  protected updateSlug(router: Router, i18n: I18nToolsService, route: ActivatedRoute, entity: LazyDataI18nKey, paramName: string): void {
    route.paramMap.pipe(
      takeUntil(this.onDestroy$),
      switchMap(params => {
        const slug = params.get('slug');
        return i18n.getNameObservable(entity, +params.get(paramName)).pipe(
          map(name => {
            const correctSlug = encodeURIComponent(name.split(' ').join('-'));
            return { slug, correctSlug };
          })
        );
      })
    ).subscribe(({ slug, correctSlug }) => {
      if (slug === null) {
        router.navigate(
          [correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      } else if (slug !== correctSlug) {
        router.navigate(
          ['../', correctSlug],
          {
            relativeTo: route,
            replaceUrl: true
          }
        );
      }
    });
  }
}
