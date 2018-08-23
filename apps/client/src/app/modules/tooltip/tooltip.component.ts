import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TooltipDataService } from './tooltip-data.service';
import { tap } from 'rxjs/operators';

/**
 * @deprecated Prefer using the XivdbTooltipDirective.
 */
@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class TooltipComponent {

  @Input()
  id: number;

  @Input()
  disabled = false;

  @Output()
  change: EventEmitter<void> = new EventEmitter<void>();

  displayed = false;

  template: string;

  constructor(private tooltipData: TooltipDataService) {
  }

  display(): void {
    this.displayed = true;
    this.loadData();
  }

  hide(): void {
    this.displayed = false;
    this.template = '';
  }

  loadData(): void {
    this.tooltipData.getTooltipData(this.id)
      .pipe(tap(() => this.change.emit()))
      .subscribe(data => this.template = data);
  }

}
