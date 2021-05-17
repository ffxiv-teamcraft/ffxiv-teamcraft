import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, OnDestroy, Optional, ViewContainerRef } from '@angular/core';
import { TooltipDataService } from '../tooltip-data.service';
import { Subscription } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { XivapiActionTooltipComponent } from './xivapi-action-tooltip.component';
import { Directionality } from '@angular/cdk/bidi';
import { StepState } from '@ffxiv-teamcraft/simulator';

/**
 * Directive that attaches a XivDB tooltip to the host element.
 * This directive take care of the XivDB request, based on the given action ID.
 */
@Directive({
  selector: '[appXivdbActionTooltip]'
})
export class XivapiActionTooltipDirective implements OnDestroy {

  // Disable TSLint to follow the style guide for directive inputs aliases.
  // See https://angular.io/guide/styleguide#avoid-aliasing-inputs-and-outputs
  // - "You should use an alias when the directive name is also an input property, and the directive name doesn't describe the property."

  /* tslint:disable:no-input-rename */
  @Input('appXivdbActionTooltip') actionId: number;

  @Input('appXivdbActionState') state: StepState;

  @Input('appXivdbActionStateColor') stateColor: string;

  @Input('appXivdbActionTooltipDisabled') disabled = false;
  /* tslint:enable:no-input-rename */

  /** Subscription for the XivDB request. */
  private _subscription?: Subscription;

  /** Overlay reference used to remove the tooltip. */
  private _overlayRef?: OverlayRef;
  /** Create a new tooltip with the given HTML, and inject it in the overlay layout. */
  private _createTooltip = (action: any) => {
    // Remove an existing tooltip if needed.
    // It can be present due to a missing mouseleave event during drag and drop.
    if (this._overlayRef) {
      this._overlayRef.dispose();
      delete this._overlayRef;
    }
    // Position the tooltip at the top right of the anchor.
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        }, {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        }]);

    // Create the overlay that will contain the tooltip.
    this._overlayRef = this._overlay.create({
      positionStrategy,
      panelClass: 'app-xivapi-tooltip-panel',
      direction: this._directionality ? this._directionality.value : 'ltr'
    });

    // Create the portal that will be injected into the overlay, with our component inside.
    // No need of the injector, because our component does not have any DI.
    const portal = new ComponentPortal<XivapiActionTooltipComponent>(XivapiActionTooltipComponent, this._viewContainerRef);

    // Inject the portal into the overlay.
    const tooltip = this._overlayRef.attach(portal).instance;

    // Set the innerHtml of our component with the html given by XivDB.
    tooltip.action = action;
    tooltip.state = this.state;
    tooltip.stateColor = this.stateColor;
    this._detectorRef.detectChanges();
  };

  constructor(private _detectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef,
              private _tooltipData: TooltipDataService,
              private _viewContainerRef: ViewContainerRef,
              private _overlay: Overlay,
              @Optional() private _directionality: Directionality) {
  }

  ngOnDestroy(): void {
    this.hide();
  }

  @HostListener('mouseenter')
  show() {
    // If the tooltip is disabled, just ignore it.
    if (this.disabled) {
      return;
    }

    // Unsubscribe from previous request.
    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    // Request information for the item on XivDB database.
    this._subscription = this._tooltipData.getActionTooltipData(this.actionId).subscribe(this._createTooltip);
  }

  @HostListener('mousedown')
  @HostListener('mouseleave')
  hide() {
    // Unsubscribe from the XivDB request if needed.
    if (this._subscription) {
      this._subscription.unsubscribe();
      delete this._subscription;
    }

    // Remove the tooltip if needed.
    if (this._overlayRef) {
      this._overlayRef.dispose();
      delete this._overlayRef;
    }
  }

}
