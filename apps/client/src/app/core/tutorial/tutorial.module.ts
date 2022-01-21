import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialStepDirective } from './tutorial-step.directive';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TutorialPopupComponent } from './tutorial-popup/tutorial-popup.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        OverlayModule,
        TranslateModule,
        NzButtonModule,
        FlexLayoutModule,
        NzDividerModule,
        NzModalModule
    ],
    declarations: [
        TutorialStepDirective,
        TutorialStepComponent,
        TutorialPopupComponent
    ],
    exports: [
        TutorialStepDirective
    ]
})
export class TutorialModule {
}
