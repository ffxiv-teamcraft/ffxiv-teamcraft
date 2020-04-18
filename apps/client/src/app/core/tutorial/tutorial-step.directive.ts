import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TutorialStepEntry } from './tutorial-step-entry';
import { TutorialService } from './tutorial.service';
import { Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TutorialStepComponent } from './tutorial-step/tutorial-step.component';
import { tap } from 'rxjs/operators';
import { ConnectedPosition } from '@angular/cdk/overlay/position/flexible-connected-position-strategy';

@Directive({
  selector: '[tutorialStep]'
})
export class TutorialStepDirective implements AfterViewInit, OnDestroy {

  @Input('tutorialStep')
  translationKey: string;

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
      hasBackdrop: true
    });
    // Make the host element show on top of the backdrop
    this.elementRef.nativeElement.style.zIndex = '1001';
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
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center'
        };
      case 'left':
        return {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        };
    }
  }

  ngAfterViewInit(): void {
    const step = new TutorialStepEntry(this.translationKey, (index, total) => this.play(index, total));
    this.registered = this.tutorialService.register(step);
  }

  ngOnDestroy(): void {
    if (this.registered) {
      this.tutorialService.unregister(this.translationKey);
    }
  }

}
