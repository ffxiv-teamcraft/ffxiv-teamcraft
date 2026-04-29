import { ChangeDetectorRef, Directive, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[timerTooltip]',
  standalone: true
})
export class TimerTooltipDirective extends NzTooltipDirective implements OnChanges {

  @Input('timerTooltip')
  timerSeconds: number;

  @Input()
  prefix = '';

  #cdr = inject(ChangeDetectorRef);

  constructor(private datePipe: DatePipe, private translate: TranslateService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.timerSeconds === null) {
      this.title = null;
    } else {
      const newTitle = `${this.prefix}${this.datePipe.transform(new Date(Date.now() + this.timerSeconds * 1000), 'medium', null, this.translate.currentLang)}`;
      if (newTitle !== this.title) {
        this.title = newTitle;
        this.#cdr.markForCheck();
        const visible = this.visible;
        if (visible) {
          this.hide();
        }
        if (visible) {
          this.show();
        }
      }
    }
    super.ngOnChanges(changes);
  }
}
