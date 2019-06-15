import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLoaderComponent } from './page-loader/page-loader.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

@NgModule({
  imports: [
    CommonModule,

    NgZorroAntdModule
  ],
  declarations: [PageLoaderComponent],
  exports: [PageLoaderComponent]
})
export class PageLoaderModule {
}
