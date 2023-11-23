import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdComponent } from './ad/ad.component';
import { RemoveAdsPopupComponent } from './remove-ads-popup/remove-ads-popup.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslateModule } from '@ngx-translate/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
    exports: [AdComponent, RemoveAdsPopupComponent],
    imports: [
        CommonModule,
        NzModalModule,
        NzButtonModule,
        TranslateModule,
        NzDividerModule,
        FlexLayoutModule,
        AdComponent, RemoveAdsPopupComponent
    ]
})
export class AdsModule {
}
