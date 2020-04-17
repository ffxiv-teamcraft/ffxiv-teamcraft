import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TutorialStepEntry } from './tutorial-step-entry';
import { TutorialService } from './tutorial.service';
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[tutorialStep]'
})
export class TutorialStepDirective implements OnInit {

  @Input('tutorialStep')
  translationKey: string;

  @Input('tutorialStepIndex')
  index: number;

  constructor(private tutorialService: TutorialService, private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef, private overlay: Overlay) {
  }

  play(): Observable<void> {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
      }]);
    const overlayRef = this.overlay.create({ positionStrategy });
    const portal = new ComponentPortal(TutorialStepComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.stepKey = this.translationKey;
    return componentRef.instance.done$.pipe(
      tap(() => {
        overlayRef.detach();
        overlayRef.dispose();
      })
    );
  }

  ngOnInit(): void {
    const step = new TutorialStepEntry(this.index, () => this.play());
    this.tutorialService.register(step);
  }

}
