import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { INTEGRITY_CHECKS, IntegrityCheck } from '../integrity-checks/integrity-check';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { UserService } from '../../../../core/database/user.service';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';

@Component({
  selector: 'app-integrity-check-popup',
  templateUrl: './integrity-check-popup.component.html',
  styleUrls: ['./integrity-check-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IntegrityCheckPopupComponent extends TeamcraftComponent {

  user$: ReplaySubject<TeamcraftUser> = new ReplaySubject<TeamcraftUser>();

  results$ = this.user$.pipe(
    switchMap(user => this.runChecks(user)),
    startWith(this.integrityChecks.map(check => {
      return {
        label: check.getNameKey(),
        check: check,
        result: 'loading'
      };
    })),
    takeUntil(this.onDestroy$)
  );

  constructor(@Inject(INTEGRITY_CHECKS) private integrityChecks: IntegrityCheck[],
              private userService: UserService) {
    super();
  }

  private _user: TeamcraftUser;

  set user(user: TeamcraftUser) {
    this.user$.next(user);
    this._user = user;
  }

  runChecks(user: TeamcraftUser): Observable<Array<any | null>> {
    return combineLatest(this.integrityChecks.map(check => {
      return check.check(user).pipe(
        map(res => {
          return {
            label: check.getNameKey(),
            check: check,
            result: res
          };
        })
      );
    }));
  }

  fix(check: IntegrityCheck, result: any | null): void {
    result.fixing = true;
    const fixedUser = check.fix(this._user, result);
    if (!fixedUser) {
      throw new Error('Tried to save undefined user, dangerous move !');
    }
    this.userService.set(fixedUser.$key, fixedUser, true).subscribe(() => {
      this.user = fixedUser;
    });
  }

}
