import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FreecompanyPickerComponent } from './user-picker/freecompany-picker.component';

@Injectable()
export class FreecompanyPickerService {

  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  public pickFCId(): Observable<string> {
    return this.dialog.create({
      nzTitle: this.translate.instant('Pick_a_fc'),
      nzContent: FreecompanyPickerComponent,
      nzFooter: null
    }).afterClose;
  }
}
