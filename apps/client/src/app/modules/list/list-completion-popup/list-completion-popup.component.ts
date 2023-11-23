import { Component } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ListsFacade } from '../+state/lists.facade';
import { List } from '../model/list';
import { Router } from '@angular/router';
import { CommissionsFacade } from '../../commission-board/+state/commissions.facade';
import { ListController } from '../list-controller';
import { ListPricingService } from '../../../pages/list-details/list-pricing/list-pricing.service';
import { TranslateModule } from '@ngx-translate/core';
import { LowerCasePipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-list-completion-popup',
    templateUrl: './list-completion-popup.component.html',
    styleUrls: ['./list-completion-popup.component.less'],
    standalone: true,
    imports: [FlexModule, NzButtonModule, NzWaveModule, NzPopconfirmModule, NzIconModule, LowerCasePipe, TranslateModule]
})
export class ListCompletionPopupComponent {

  list: List;

  constructor(private ref: NzModalRef, private listsFacade: ListsFacade, private router: Router,
              private commissionsFacade: CommissionsFacade, private listPricingService: ListPricingService) {
  }

  close(): void {
    this.ref.close();
  }

  deleteList(): void {
    if (this.list.hasCommission) {
      this.commissionsFacade.delete(this.list.$key, true);
    } else {
      this.listsFacade.deleteList(this.list.$key, this.list.offline);
    }
    this.router.navigate(['/lists']);
    this.close();
  }

  resetList(): void {
    ListController.reset(this.list);
    this.listsFacade.updateList(this.list);
    this.listsFacade.clearModificationsHistory(this.list.$key);
    this.close();
  }

  archiveList(): void {
    this.listsFacade.pureUpdateList(this.list.$key, { archived: true });
    this.close();
  }

  clearList(): void {
    this.list.finalItems = [];
    this.list.items = [];
    ListController.reset(this.list);
    this.listPricingService.removeEntriesForList(this.list.$key);
    this.listsFacade.clearModificationsHistory(this.list.$key);
    this.listsFacade.updateList(this.list, true, true);
    this.close();
  }
}
