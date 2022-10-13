import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TutorialStepEntry } from './tutorial-step-entry';
import { TutorialService } from './tutorial.service';
import { ConnectedPosition, Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { tap } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[tutorialStep]'
})
export class TutorialStepDirective implements OnInit, OnDestroy {

  @Input('tutorialStep')
  translationKey: string;

  @Input('tutorialStepIndex')
  index = 0;

  @Input('tutorialStepAlign')
  align: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  private registered = false;

  constructor(private tutorialService: TutorialService, private overlayPositionBuilder: OverlayPositionBuilder,
              private elementRef: ElementRef, private overlay: Overlay) {
  }

  play(stepIndex: number, totalSteps: number): Observable<void> {
    const positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([this.getPlacement()]);
    const overlayRef = this.overlay.create({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      backdropClass: 'tutorial-backdrop'
    });
    this.elementRef.nativeElement.scrollIntoView(false);
    // Make the host element show on top of the backdrop
    this.elementRef.nativeElement.style.zIndex = '10000';
    this.elementRef.nativeElement.style.boxShadow = '0px 0px 5px 1px var(--highlight-color)';
    const portal = new ComponentPortal(TutorialStepComponent);
    const componentRef = overlayRef.attach(portal);
    componentRef.instance.stepKey = this.translationKey;
    componentRef.instance.align = this.align;
    componentRef.instance.stepIndex = stepIndex;
    componentRef.instance.totalSteps = totalSteps;
    return componentRef.instance.done$.pipe(
      tap(() => {
        overlayRef.detach();
        overlayRef.dispose();
        this.elementRef.nativeElement.style.zIndex = null;
        this.elementRef.nativeElement.style.boxShadow = null;
      })
    );
  }

  getPlacement(): ConnectedPosition {
    switch (this.align) {
      case 'top':
        return {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        };
      case 'bottom':
        return {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top'
        };
      case 'right':
        return {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        };
      case 'left':
        return {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center'
        };
    }
  }

  ngOnInit(): void {
    // We have to abouse the setTimeout trick to push this in zonejs's microtask queue, making it execute after first rendering happens.
    setTimeout(() => {
      if (this.elementRef.nativeElement.offsetParent !== null) {
        const step = new TutorialStepEntry(+this.index, this.translationKey, (index, total) => this.play(index, total));
        this.registered = this.tutorialService.register(step);
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.registered) {
      this.tutorialService.unregister(this.translationKey);
    }
  }

}
