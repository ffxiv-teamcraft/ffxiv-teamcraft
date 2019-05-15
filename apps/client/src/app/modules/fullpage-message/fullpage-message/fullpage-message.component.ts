import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fullpage-message',
  templateUrl: './fullpage-message.component.html',
  styleUrls: ['./fullpage-message.component.less']
})
export class FullpageMessageComponent {
  @Input()
  height = 'calc(100vh - 64px)';

  @Input()
  fontSize = '4rem';
}
