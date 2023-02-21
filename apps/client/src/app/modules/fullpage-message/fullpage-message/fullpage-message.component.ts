import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-fullpage-message',
  templateUrl: './fullpage-message.component.html',
  styleUrls: ['./fullpage-message.component.less']
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
