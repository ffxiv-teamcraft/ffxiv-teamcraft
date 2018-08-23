import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { auditTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';

import { ScrollService } from './scroll.service';
import { fromEvent, Observable, ReplaySubject, Subject } from 'rxjs';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';

// https://github.com/angular/angular/blob/3a30f5d937e64289ad9a89a1cbc4bd66d8a8867a/aio/src/app/shared/scroll-spy.service.ts


export interface ScrollItem {
  element: Element;
  index: number;
}

export interface ScrollSpyInfo {
  active: Observable<ScrollItem | null>;
  unspy: () => void;
}

/*
 * Represents a "scroll-spied" element. Contains info and methods for determining whether this
 * element is the active one (i.e. whether it has been scrolled passed), based on the window's
 * scroll position.
 *
 * @prop {Element} element - The element whose position relative to the viewport is tracked.
 * @prop {number}  index   - The index of the element in the original list of element (group).
 * @prop {number}  top     - The `scrollTop` value at which this element becomes active.
 */
export class ScrollSpiedElement implements ScrollItem {
  top = 0;

  /*
   * @constructor
   * @param {Element} element - The element whose position relative to the viewport is tracked.
   * @param {number}  index   - The index of the element in the original list of element (group).
   */
  constructor(public readonly element: Element, public readonly index: number) {
  }

  /*
   * @method
   * Caclulate the `top` value, i.e. the value of the `scrollTop` property at which this element
   * becomes active. The current implementation assumes that window is the scroll-container.
   *
   * @param {number} scrollTop - How much is window currently scrolled (vertically).
   * @param {number} topOffset - The distance from the top at which the element becomes active.
   */
  calculateTop(scrollTop: number, topOffset: number) {
    this.top = scrollTop + (<any>this.element).offsetTop - topOffset;
  }
}

/*
 * Represents a group of "scroll-spied" elements. Contains info and methods for efficiently
 * determining which element should be considered "active", i.e. which element has been scrolled
 * passed the top of the viewport.
 *
 * @prop {Observable<ScrollItem | null>} activeScrollItem - An observable that emits ScrollItem
 *     elements (containing the HTML element and its original index) identifying the latest "active"
 *     element from a list of elements.
 */
export class ScrollSpiedElementGroup {
  activeScrollItem: ReplaySubject<ScrollItem | null> = new ReplaySubject(1);
  private readonly spiedElements: ScrollSpiedElement[];

  /*
   * @constructor
   * @param {Element[]} elements - A list of elements whose position relative to the viewport will
   *     be tracked, in order to determine which one is "active" at any given moment.
   */
  constructor(elements: Element[]) {
    this.spiedElements = elements.map((elem, i) => new ScrollSpiedElement(elem, i));
  }

  /*
   * @method
   * Caclulate the `top` value of each ScrollSpiedElement of this group (based on te current
   * `scrollTop` and `topOffset` values), so that the active element can be later determined just by
   * comparing its `top` property with the then current `scrollTop`.
   *
   * @param {number} scrollTop - How much is window currently scrolled (vertically).
   * @param {number} topOffset - The distance from the top at which the element becomes active.
   */
  calibrate(scrollTop: number, topOffset: number) {
    this.spiedElements.forEach(spiedElem => spiedElem.calculateTop(scrollTop, topOffset));
    this.spiedElements.sort((a, b) => b.top - a.top);   // Sort in descending `top` order.
  }

  /*
   * @method
   * Determine which element is the currently active one, i.e. the lower-most element that is
   * scrolled passed the top of the viewport (taking offsets into account) and emit it on
   * `activeScrollItem`.
   * If no element can be considered active, `null` is emitted instead.
   * If window is scrolled all the way to the bottom, then the lower-most element is considered
   * active even if it not scrolled passed the top of the viewport.
   *
   * @param {number} scrollTop    - How much is window currently scrolled (vertically).
   * @param {number} maxScrollTop - The maximum possible `scrollTop` (based on the viewport size).
   */
  onScroll(scrollTop: number, maxScrollTop: number) {
    let activeItem: ScrollItem | undefined;
    if (maxScrollTop === 0) {
      activeItem = this.spiedElements[this.spiedElements.length - 1];
    } else {
      this.spiedElements.some(spiedElem => {
        if (spiedElem.top <= scrollTop) {
          activeItem = spiedElem;
          return true;
        }
        return false;
      });
    }

    this.activeScrollItem.next(activeItem || null);
  }
}

@Injectable()
export class ScrollSpyService {

  private spiedElementGroups: ScrollSpiedElementGroup[] = [];
  private onStopListening = new Subject();
  private resizeEvents = fromEvent(window, 'resize').pipe(auditTime(300), takeUntil(this.onStopListening));
  private scrollEvents: Observable<CdkScrollable>;
  private lastContentHeight: number;
  private lastMaxScrollTop: number;

  private scrollTop: number;

  constructor(@Inject(DOCUMENT) private doc: any, private scrollService: ScrollService, cdkScroll: ScrollDispatcher) {
    this.scrollEvents = cdkScroll.scrolled()
      .pipe(
        filter(scroll => scroll !== null),
        map(scroll => <CdkScrollable>scroll),
        filter(scroll => scroll.getElementRef().nativeElement.localName === 'mat-sidenav-content')
      )
      .pipe(auditTime(10), takeUntil(this.onStopListening))
      .pipe(tap(scroll => this.scrollTop = scroll.getElementRef().nativeElement.scrollTop));
  }

  /*
   * @method
   * Start tracking a group of elements and emitting active elements; i.e. elements that are
   * currently visible in the viewport. If there was no other group being spied, start listening for
   * `resize` and `scroll` events.
   *
   * @param {Element[]} elements - A list of elements to track.
   *
   * @return {ScrollSpyInfo} - An object containing the following properties:
   *     - `active`: An observable of distinct ScrollItems.
   *     - `unspy`: A method to stop tracking this group of elements.
   */
  spyOn(elements: Element[]): ScrollSpyInfo {
    if (!this.spiedElementGroups.length) {
      this.resizeEvents.subscribe(() => this.onResize());
      this.scrollEvents.subscribe((scroll) => this.onScroll(scroll));
      this.onResize();
    }

    const scrollTop = this.getScrollTop();
    const topOffset = this.getTopOffset();
    const maxScrollTop = this.lastMaxScrollTop;

    const spiedGroup = new ScrollSpiedElementGroup(elements);
    spiedGroup.calibrate(scrollTop, topOffset);
    spiedGroup.onScroll(scrollTop, maxScrollTop);

    this.spiedElementGroups.push(spiedGroup);

    return {
      active: spiedGroup.activeScrollItem.asObservable().pipe(distinctUntilChanged()),
      unspy: () => this.unspy(spiedGroup)
    };
  }

  private getContentHeight() {
    return this.doc.body.scrollHeight || Number.MAX_SAFE_INTEGER;
  }

  private getScrollTop() {
    return this.scrollTop || 0;
  }

  private getTopOffset() {
    return 10;
  }

  private getViewportHeight() {
    return this.doc.body.clientHeight || 0;
  }

  /*
   * @method
   * The size of the window has changed. Re-calculate all affected values,
   * so that active elements can be determined efficiently on scroll.
   */
  private onResize() {
    const contentHeight = this.getContentHeight();
    const viewportHeight = this.getViewportHeight();
    const scrollTop = this.getScrollTop();
    const topOffset = this.getTopOffset();

    this.lastContentHeight = contentHeight;
    this.lastMaxScrollTop = contentHeight - viewportHeight;

    this.spiedElementGroups.forEach(group => group.calibrate(scrollTop, topOffset));
  }

  /*
   * @method
   * Determine which element for each ScrollSpiedElementGroup is active. If the content height has
   * changed since last check, re-calculate all affected values first.
   */
  private onScroll(event: CdkScrollable) {
    if (this.lastContentHeight !== this.getContentHeight()) {
      // Something has caused the scroll height to change.
      // (E.g. image downloaded, accordion expanded/collapsed etc.)
      this.onResize();
    }

    const scrollTop = event.getElementRef().nativeElement.scrollTop;
    const maxScrollTop = event.getElementRef().nativeElement.scrollHeight + event.getElementRef().nativeElement.offsetHeight;
    this.spiedElementGroups.forEach(group => group.onScroll(scrollTop, maxScrollTop));
  }

  /*
   * @method
   * Stop tracking this group of elements and emitting active elements. If there is no other group
   * being spied, stop listening for `resize` or `scroll` events.
   *
   * @param {ScrollSpiedElementGroup} spiedGroup - The group to stop tracking.
   */
  private unspy(spiedGroup: ScrollSpiedElementGroup) {
    spiedGroup.activeScrollItem.complete();
    this.spiedElementGroups = this.spiedElementGroups.filter(group => group !== spiedGroup);

    if (!this.spiedElementGroups.length) {
      this.onStopListening.next();
    }
  }
}
