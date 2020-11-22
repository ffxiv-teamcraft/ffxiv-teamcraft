import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { PipesModule } from '../../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AntdSharedModule } from '../../core/antd-shared.module';

@NgModule({
  declarations: [QuickSearchComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FlexLayoutModule,
    PipesModule,
    CoreModule,
    TranslateModule,
    AntdSharedModule
  ],
  exports: [QuickSearchComponent]
})
export class QuickSearchModule {
}
