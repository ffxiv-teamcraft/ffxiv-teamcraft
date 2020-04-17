import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialStepDirective } from './tutorial-step.directive';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule
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
