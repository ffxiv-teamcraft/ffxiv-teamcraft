import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as semver from 'semver';
import { first, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Database, objectVal, ref } from '@angular/fire/database';
import { TranslateModule } from '@ngx-translate/core';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';

@Component({
    selector: 'app-version-lock',
    templateUrl: './version-lock.component.html',
    styleUrls: ['./version-lock.component.less'],
    standalone: true,
    imports: [FullpageMessageComponent, TranslateModule]
})
export class VersionLockComponent {
  constructor(private router: Router, private firebase: Database) {
    objectVal<string>(ref(this.firebase, 'version_lock'))
      .pipe(
        map(version => {
          return semver.gte(environment.version, version);
        }),
        first()
      ).subscribe(move => {
      if (move) {
        this.router.navigate(['/']);
      }
    });
  }
}
