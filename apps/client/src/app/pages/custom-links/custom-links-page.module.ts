import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomLinksComponent } from './custom-links/custom-links.component';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { DatabaseModule } from '../../core/database/database.module';

const routes: Routes = [{
  path: '',
  component: CustomLinksComponent
}];

@NgModule({
  declarations: [CustomLinksComponent],
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    NgZorroAntdModule,
    DatabaseModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomLinksPageModule {
}
