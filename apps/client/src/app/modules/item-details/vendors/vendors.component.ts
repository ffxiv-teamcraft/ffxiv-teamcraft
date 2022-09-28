import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Vendor } from '../../list/model/vendor';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsComponent extends ItemDetailsPopup<Vendor[]> implements OnInit {

  constructor(@Optional() public modalRef: NzModalRef) {
    super();
  }

  ngOnInit(): void {
    this.details = this.details.sort((a, b) => {
      if (a.zoneId && !b.zoneId) {
        return -1;
      } else if (b.zoneId) {
        return 1;
      } else {
        return 0;
      }
    });
    super.ngOnInit();
  }

}
