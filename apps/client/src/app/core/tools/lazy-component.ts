import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[appLazyComponent]'
})
export class LazyComponentDirective implements AfterViewInit {

  private _intersectionObserver?: IntersectionObserver;

  private intersects$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _element: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {
    this.intersects$.pipe(
      distinctUntilChanged()
    ).subscribe((visible) => {
      if (visible) {
        this.cdRef.reattach();
        this.cdRef.detectChanges();
      } else {
        this.cdRef.detach();
      }
    });
  }

  public ngAfterViewInit() {
    this._intersectionObserver = new IntersectionObserver(entries => {
      this.checkForIntersection(entries);
    }, {});
    this._intersectionObserver.observe(<Element>(this._element.nativeElement));
  }

  private checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      this.intersects$.next(this.checkIfIntersecting(entry));
    });
  };

  private checkIfIntersecting(entry: IntersectionObserverEntry) {
    return (<any>entry).isIntersecting && entry.target === this._element.nativeElement;
  }
}
