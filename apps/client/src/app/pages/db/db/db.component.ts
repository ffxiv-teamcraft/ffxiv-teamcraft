import { isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IS_HEADLESS } from '../../../../environments/is-headless';
import { combineLatest } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { Language } from '../../../core/data/language';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { SettingsService } from '../../../modules/settings/settings.service';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.less']
})
export class DbComponent extends TeamcraftComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private settings: SettingsService,
    private translate: TranslateService,
    private router: Router,
    @Inject(PLATFORM_ID) private platform: any,
    private readonly i18n: I18nToolsService
  ) {
    super();
  }

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
