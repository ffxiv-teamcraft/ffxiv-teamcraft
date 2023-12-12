import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { NzToolTipComponent, NzTooltipDirective } from 'ng-zorro-antd/tooltip';
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

  constructor(elementRef: ElementRef, hostView: ViewContainerRef, resolver: ComponentFactoryResolver, renderer: Renderer2,
              private datePipe: DatePipe, private translate: TranslateService) {
    super(elementRef, hostView, resolver, renderer);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.timerSeconds === null) {
      this.title = null;
    } else {
      const newTitle = this.datePipe.transform(new Date(Date.now() + this.timerSeconds * 1000), 'medium', null, this.translate.currentLang);
      if (newTitle !== this.title) {
        this.title = newTitle;
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
