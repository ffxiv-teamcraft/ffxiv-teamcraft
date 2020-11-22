import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UserPickerComponent } from './user-picker/user-picker.component';

@Injectable()
export class UserPickerService {

  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  public pickUserId(hideContacts = false): Observable<string> {
    return this.dialog.create({
      nzTitle: this.translate.instant('Pick_a_user'),
      nzContent: UserPickerComponent,
      nzComponentParams: {
        hideContacts: hideContacts
      },
      nzFooter: null
    }).afterClose;
  }
}
