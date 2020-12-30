import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyWorkshopTreePopupComponent } from './company-workshop-tree-popup/company-workshop-tree-popup.component';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { CompanyWorkshopTreeButtonComponent } from './company-workshop-tree-button/company-workshop-tree-button.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';


@NgModule({
  declarations: [CompanyWorkshopTreePopupComponent, CompanyWorkshopTreeButtonComponent],
  exports: [CompanyWorkshopTreeButtonComponent],
  imports: [
    CommonModule,
    NzButtonModule,
    NzToolTipModule,
    TranslateModule,
    PipesModule,
    CoreModule,
    NzModalModule
  ]
})
export class CompanyWorkshopTreeModule {
}
