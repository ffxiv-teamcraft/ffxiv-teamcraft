import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutEditorPageComponent } from './layout-editor-page/layout-editor-page.component';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { LayoutEditorModule } from '../../modules/layout-editor/layout-editor.module';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTagModule } from 'ng-zorro-antd/tag';

const routes: Routes = [
  {
    path: '',
    component: LayoutEditorPageComponent,
    canActivate: [MaintenanceGuard, VersionLockGuard]
  }
];

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        TranslateModule,
        CoreModule,
        RouterModule.forChild(routes),
        LayoutEditorModule,
        PipesModule,
        ReactiveFormsModule,
        NzCheckboxModule,
        NzInputNumberModule,
        ItemIconModule,
        FullpageMessageModule,
        NzDividerModule,
        FormsModule,
        NzSelectModule,
        NzCollapseModule,
        NzTagModule,
        LayoutEditorPageComponent
    ]
})
export class LayoutEditorPageModule {
}
