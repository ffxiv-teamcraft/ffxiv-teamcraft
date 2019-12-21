import { Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { QuickSearchComponent } from './quick-search/quick-search.component';

@Injectable({
  providedIn: 'root'
})
export class QuickSearchService {

  constructor(private dialog: NzModalService) {
  }

  public openQuickSearch(): void {
    this.dialog.create({
      nzTitle: null,
      nzWidth: '80vw',
      nzContent: QuickSearchComponent,
      nzClosable: false,
      nzFooter: null
    });
  }
}
