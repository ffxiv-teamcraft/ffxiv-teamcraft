import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ProgressPopupComponent } from './progress-popup/progress-popup.component';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProgressPopupService {

  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  public showProgress(operation$: Observable<any>, operationsCount: number, labelKey = 'Please_wait', labelParams = {}): Observable<any> {
    if (operationsCount === 0) {
      return of(null);
    }
    return this.dialog.create({
      nzTitle: this.translate.instant(labelKey, labelParams),
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false,
      nzContent: ProgressPopupComponent,
      nzComponentParams: { operation$: operation$.pipe(shareReplay()), count: operationsCount }
    }).afterClose;
  }
}
