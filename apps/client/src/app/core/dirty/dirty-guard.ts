import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { DirtyFacade } from './+state/dirty.facade';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { DirtyScope } from './dirty-scope';
import { first, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class DirtyGuard implements CanDeactivate<any> {

  constructor(private dirtyFacade: DirtyFacade, private translate: TranslateService, private dialog: NzModalService) {
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> {
    return this.dirtyFacade.allEntries$.pipe(
      first(),
      switchMap(entries => {
        const isDirty = entries.some(entry => entry.scope === DirtyScope.PAGE);
        if (!isDirty) {
          return of(true);
        }
        const result$ = new Subject<boolean>();
        this.dialog.confirm({
          nzTitle: this.translate.instant('DIRTY.Dialog_title'),
          nzContent: this.translate.instant('DIRTY.Dialog_description'),
          nzCancelText: this.translate.instant('No'),
          nzOkText: this.translate.instant('Yes'),
          nzOnOk: () => result$.next(true),
          nzOnCancel: () => result$.next(false)
        });
        return result$.pipe(
          tap(res => {
            if (res) {
              entries
                .filter(entry => entry.scope === DirtyScope.PAGE)
                .forEach(entry => {
                  this.dirtyFacade.removeEntry(entry.id, entry.scope);
                });
            }
          }));
      })
    );
  }

}
