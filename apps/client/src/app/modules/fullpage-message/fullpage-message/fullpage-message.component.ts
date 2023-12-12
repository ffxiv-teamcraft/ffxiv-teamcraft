import { Component, Input, TemplateRef } from '@angular/core';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-fullpage-message',
    templateUrl: './fullpage-message.component.html',
    styleUrls: ['./fullpage-message.component.less'],
    standalone: true,
    imports: [NgIf, NgTemplateOutlet, IfMobilePipe]
})
export class FullpageMessageComponent {
  @Input()
  height = 'calc(100vh - 90px)';

  @Input()
  fontSize = '4rem';

  @Input()
  subtitle: TemplateRef<any>;

  @Input()
  disableMobileBreakpoint = false;
}
