import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
    exports: [LoadingScreenComponent],
    imports: [
        CommonModule,
        TranslateModule,
        FlexLayoutModule,
        AntdSharedModule,
        LoadingScreenComponent
    ]
})
export class LoadingScreenModule {
}
