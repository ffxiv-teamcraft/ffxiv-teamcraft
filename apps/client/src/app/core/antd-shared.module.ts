import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

const nzModules = [
  NzButtonModule,
  NzModalModule,
  NzDividerModule,
  NzListModule,
  NzIconModule,
  NzPopconfirmModule,
  NzToolTipModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzSwitchModule,
  NzCollapseModule,
  NzCardModule,
  NzAutocompleteModule,
  NzTagModule,
  NzTableModule,
  NzBadgeModule,
  NzCheckboxModule,
  NzDrawerModule,
  NzNotificationModule,
  NzSelectModule,
  NzSpinModule,
  NzAlertModule,
  NzDropDownModule,
  NzPopoverModule,
  NzProgressModule,
  NzEmptyModule,
  NzTabsModule
];

@NgModule({
  imports: nzModules,
  exports: nzModules
})
export class AntdSharedModule {
}
