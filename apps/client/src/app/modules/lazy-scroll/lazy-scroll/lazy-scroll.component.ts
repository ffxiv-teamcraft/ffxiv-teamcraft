import { ChangeDetectionStrategy, Component, Input, TemplateRef, TrackByFunction } from '@angular/core';

@Component({
  selector: 'app-lazy-scroll',
  templateUrl: './lazy-scroll.component.html',
  styleUrls: ['./lazy-scroll.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyScrollComponent {

  @Input({required: true})
  data: any[];

  @Input({required: true})
  rowTemplate: TemplateRef<any>;

  @Input()
  rowSize = 36;

  @Input()
  displayedRows = 8;

  @Input()
  noScroll = false;

  @Input()
  trackBy: TrackByFunction<any> = (row) => row;
}
