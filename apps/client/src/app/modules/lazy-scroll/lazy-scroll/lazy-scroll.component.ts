import { booleanAttribute, ChangeDetectionStrategy, Component, Input, numberAttribute, TemplateRef, TrackByFunction } from '@angular/core';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { NgIf, NgTemplateOutlet, NgFor } from '@angular/common';

@Component({
    selector: 'app-lazy-scroll',
    templateUrl: './lazy-scroll.component.html',
    styleUrls: ['./lazy-scroll.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, NgTemplateOutlet, NgFor]
})
export class LazyScrollComponent {

  @Input({required: true})
  data: any[];

  @Input({required: true})
  rowTemplate: TemplateRef<any>;

  @Input({transform: numberAttribute})
  rowSize = 36;

  @Input({transform: numberAttribute})
  displayedRows = 8;

  @Input({transform: booleanAttribute})
  noScroll = false;

  @Input()
  trackBy: TrackByFunction<any> = (row) => row;
}
