import { isPlatformServer } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IS_HEADLESS } from '../../../../environments/is-headless';
import { combineLatest } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { Language } from '../../../core/data/language';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { QuickSearchComponent } from '../../../modules/quick-search/quick-search/quick-search.component';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-db',
    templateUrl: './db.component.html',
    styleUrls: ['./db.component.less'],
    standalone: true,
    imports: [FlexModule, QuickSearchComponent, RouterOutlet]
})
export class DbComponent extends TeamcraftComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private settings = inject(SettingsService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private platform = inject(PLATFORM_ID);
  private readonly i18n = inject(I18nToolsService);


  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('language')),
        takeUntil(this.onDestroy$)
      )
      .subscribe((lang) => {
        if (this.settings.availableLocales.indexOf(lang) === -1) {
          lang = 'en';
        }
        const savedLang = localStorage.getItem('locale');
        if (!savedLang || isPlatformServer(this.platform) || IS_HEADLESS) {
          this.translate.use(lang);
          this.i18n.use(lang as Language);
        }
      });

    if (!IS_HEADLESS) {
      combineLatest([this.route.paramMap, this.i18n.currentLang$])
        .pipe(
          takeUntil(this.onDestroy$),
          filter(([params]) => !!params.get('language'))
        )
        .subscribe(([params, lang]) => {
          const urlLang = params.get('language');
          if (urlLang !== lang) {
            this.router.navigateByUrl(this.router.url.replace(`/${urlLang}/`, `/${lang}/`));
          }
        });
    }
  }
}
