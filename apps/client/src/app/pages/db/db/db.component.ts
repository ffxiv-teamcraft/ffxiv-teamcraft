import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { map, takeUntil } from 'rxjs/operators';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.less']
})
export class DbComponent extends TeamcraftComponent {

  private lang: string;

  constructor(private route: ActivatedRoute, private settings: SettingsService,
              private translate: TranslateService, private router: Router) {
    super();
    this.route.paramMap.pipe(
      map(params => params.get('language')),
      takeUntil(this.onDestroy$)
    ).subscribe(lang => {
      if (this.settings.availableLocales.indexOf(lang) === -1) {
        lang = 'en';
      }
      const savedLang = localStorage.getItem('locale');
      if (!savedLang) {
        this.translate.use(lang);
      }
    });

    this.translate.onLangChange.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(change => {
      this.router.navigateByUrl(this.router.url.replace(`/${this.lang}/`, `/${change.lang}/`));
      this.lang = change.lang;
    });
  }

}
