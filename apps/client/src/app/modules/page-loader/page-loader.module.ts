import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLoaderComponent } from './page-loader/page-loader.component';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  imports: [
    CommonModule,

    AntdSharedModule
  ],
  declarations: [PageLoaderComponent],
  exports: [PageLoaderComponent]
})
export class PageLoaderModule {
}
