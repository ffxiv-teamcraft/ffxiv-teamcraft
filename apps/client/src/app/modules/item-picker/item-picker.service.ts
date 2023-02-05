import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SearchResult } from '@ffxiv-teamcraft/types';
import { Observable } from 'rxjs';
import { ItemPickerComponent } from './item-picker/item-picker.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ItemPickerService {

  constructor(private dialog: NzModalService, private translate: TranslateService) {
  }

  public pickItem(): Observable<SearchResult> {
    return this.dialog.create({
      nzContent: ItemPickerComponent,
      nzFooter: null,
      nzCloseOnNavigation: true,
      nzTitle: this.translate.instant('Pick_an_item')
    }).afterClose;
  }

  public pickItems(): Observable<SearchResult[]> {
    return this.dialog.create({
      nzContent: ItemPickerComponent,
      nzFooter: null,
      nzCloseOnNavigation: true,
      nzComponentParams: {
        multi: true
      },
      nzTitle: this.translate.instant('Pick_an_item')
    }).afterClose;
  }
}
