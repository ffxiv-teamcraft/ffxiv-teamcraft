import { Injectable, inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { QuickSearchComponent } from './quick-search/quick-search.component';

@Injectable({
  providedIn: 'root'
})
export class QuickSearchService {
  private dialog = inject(NzModalService);


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
