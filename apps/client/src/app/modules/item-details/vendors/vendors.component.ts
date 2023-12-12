import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { Vendor } from '../../list/model/vendor';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ClosestAetherytePipe } from '../../../pipes/pipes/closest-aetheryte.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapPositionComponent } from '../../map/map-position/map-position.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NgIf, AsyncPipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
    selector: 'app-vendors',
    templateUrl: './vendors.component.html',
    styleUrls: ['./vendors.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzListModule, FlexModule, NgIf, NzTagModule, DbButtonComponent, MapPositionComponent, AsyncPipe, I18nPipe, TranslateModule, I18nRowPipe, ClosestAetherytePipe]
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
