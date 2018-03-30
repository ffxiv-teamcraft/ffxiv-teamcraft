import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TemplateComponent} from './template/template.component';
import {CoreModule} from '../../core/core.module';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from '../../modules/common-components/common-components.module';
import {MaintenanceGuard} from '../maintenance/maintenance.guard';
import {
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
} from '@angular/material';
import {TemplatePopupComponent} from './template-popup/template-popup.component';
import {FormsModule} from '@angular/forms';
import {ClipboardModule} from 'ngx-clipboard';

const routes: Routes = [{
    path: 'template/:nickName/:uri',
    component: TemplateComponent,
    canActivate: [MaintenanceGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        TranslateModule,
        ClipboardModule,

        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSelectModule,

        CommonComponentsModule,
        CoreModule,
    ],
    declarations: [TemplateComponent, TemplatePopupComponent],
    entryComponents: [TemplatePopupComponent]
})
export class TemplateModule {
}
