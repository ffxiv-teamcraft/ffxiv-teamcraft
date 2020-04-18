import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialStepDirective } from './tutorial-step.directive';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule, NzDividerModule } from 'ng-zorro-antd';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
    TranslateModule,
    NzButtonModule,
    FlexLayoutModule,
    NzDividerModule
  ],
  declarations: [
    TutorialStepDirective,
    TutorialStepComponent
  ],
  entryComponents: [
    TutorialStepComponent
  ],
  exports: [
    TutorialStepDirective
  ]
})
export class TutorialModule {
}
