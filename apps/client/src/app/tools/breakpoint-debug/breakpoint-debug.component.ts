import { Component } from '@angular/core';


@Component({
  selector: 'app-breakpoint-debug',
  standalone: true,
  imports: [],
  templateUrl: './breakpoint-debug.component.html',
  styleUrls: ['./breakpoint-debug.component.less']
})
export class BreakpointDebugComponent {

  get current(): string {
    const width = window.innerWidth;
    if (width >= 1600) {
      return 'XXl';
    }
    if (width >= 1200) {
      return 'Xl';
    }
    if (width >= 992) {
      return 'Lg';
    }
    if (width >= 768) {
      return 'Md';
    }
    if (width >= 576) {
      return 'Sm';
    }
    return 'Xs';
  }
}
