import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private settings: SettingsService,
              private translate: TranslateService) {
    super();
    this.route.paramMap.pipe(
      map(params => params.get('language')),
      takeUntil(this.onDestroy$)
    ).subscribe(lang => {
      if (this.settings.availableLocales.indexOf(lang) === -1) {
        lang = 'en';
      }
      this.translate.use(lang);
    });
  }

}
