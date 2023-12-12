import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, OnDestroy, Optional, ViewContainerRef } from '@angular/core';
import { TooltipDataService } from '../tooltip-data.service';
import { Subscription } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Directionality } from '@angular/cdk/bidi';
import { XivapiItemTooltipComponent } from './xivapi-item-tooltip.component';

/**
 * Directive that attaches a XivDB tooltip to the host element.
 * This directive take care of the XivDB request, based on the given item ID.
 */
@Directive({
    selector: '[appXivApiTooltip]',
    standalone: true
})
export class XivapiItemTooltipDirective implements OnDestroy {

  // Disable TSLint to follow the style guide for directive inputs aliases.
  // See https://angular.io/guide/styleguide#avoid-aliasing-inputs-and-outputs
  // - "You should use an alias when the directive name is also an input property, and the directive name doesn't describe the property."

  /* tslint:disable:no-input-rename */
  @Input('appXivApiTooltip') itemId: number;

  @Input('appXivApiTooltipDisabled') disabled = false;

  /* tslint:enable:no-input-rename */

  /** Subscription for the request. */
  private _subscription?: Subscription;

  /** Overlay reference used to remove the tooltip. */
  private _overlayRef?: OverlayRef;

  // Using any here because it's using Node types for whatever reason but it's a number
  private _hideDelayId: any | undefined;

  // Using any here because it's using Node types for whatever reason but it's a number
  private _showDelayId: any | undefined;

  constructor(private _detectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef,
              private _tooltipData: TooltipDataService,
              private _viewContainerRef: ViewContainerRef,
              private _overlay: Overlay,
              @Optional() private _directionality: Directionality) {
  }

  ngOnDestroy(): void {
    this.hide(null);
  }

  @HostListener('mouseenter')
  show() {
    clearTimeout(this._hideDelayId);
    // If the tooltip is disabled, just ignore it.
    if (this.disabled || this._overlayRef) {
      return;
    }

    this._showDelayId = setTimeout(() => {

      // Unsubscribe from previous request.
      if (this._subscription) {
        this._subscription.unsubscribe();
      }

      // Request information for the item in lazy files.
      this._subscription = this._tooltipData.getItemTooltipData(this.itemId).subscribe(this._createTooltip);
    }, 300);
  }

  @HostListener('mouseleave', ['$event'])
  hide(event: MouseEvent | null) {
    clearTimeout(this._showDelayId);
    this._hideDelayId = setTimeout(() => {
      const newTarget = event?.relatedTarget as Node | null;
      if (!newTarget || !this._overlayRef?.overlayElement.contains(newTarget)) {
        // Unsubscribe from the request if needed.
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
    }, 500);
  }

  /** Create a new tooltip with the given HTML, and inject it in the overlay layout. */
  private _createTooltip = (item: any) => {
    // Position the tooltip at the top right of the anchor.
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions([
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }
      ]);

    // Create the overlay that will contain the tooltip.
    this._overlayRef = this._overlay.create({
      positionStrategy,
      panelClass: 'app-xivapi-tooltip-panel',
      direction: this._directionality ? this._directionality.value : 'ltr',
      width: 575
    });

    this._overlayRef.overlayElement.onmouseleave = () => this.hide(null);

    // Create the portal that will be injected into the overlay, with our component inside.
    // No need of the injector, because our component does not have any DI.
    const portal = new ComponentPortal<XivapiItemTooltipComponent>(XivapiItemTooltipComponent, this._viewContainerRef);

    // Inject the portal into the overlay.
    const tooltip = this._overlayRef.attach(portal).instance;

    // Set the innerHtml of our component with the html given by XivDB.
    tooltip.item = item;
    this._detectorRef.markForCheck();
  };

}
