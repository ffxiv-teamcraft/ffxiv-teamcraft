import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../core/core.module';
import { ContentIdLinkingPopupComponent } from './content-id-linking-popup/content-id-linking-popup.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { InventoryPositionComponent } from './inventory-position/inventory-position.component';

@NgModule({
    exports: [
        InventoryPositionComponent
    ],
    imports: [
        CommonModule,
        CoreModule,
        NzAvatarModule,
        NzDividerModule,
        NzTagModule,
        NzPopconfirmModule,
        NzToolTipModule,
        FlexLayoutModule,
        ContentIdLinkingPopupComponent, InventoryPositionComponent
    ]
})
export class InventoryModule {
}
