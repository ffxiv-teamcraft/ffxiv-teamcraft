import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as semver from 'semver';
import { first, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-version-lock',
  templateUrl: './version-lock.component.html',
  styleUrls: ['./version-lock.component.less']
})
export class VersionLockComponent {
  constructor(private router: Router, private firebase: AngularFireDatabase) {
    this.firebase.object<string>('version_lock')
      .valueChanges()
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
