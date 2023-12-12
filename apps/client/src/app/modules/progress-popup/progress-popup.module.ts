import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressPopupComponent } from './progress-popup/progress-popup.component';
import { ProgressPopupService } from './progress-popup.service';


@NgModule({
    imports: [
    CommonModule,
    ProgressPopupComponent
],
    providers: [
        ProgressPopupService
    ]
})
export class ProgressPopupModule {
}
