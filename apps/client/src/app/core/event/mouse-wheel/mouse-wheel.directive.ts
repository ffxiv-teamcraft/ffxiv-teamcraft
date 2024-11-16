import { Directive, EventEmitter, HostListener, Output } from '@angular/core';


@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[mouseWheel]',
  standalone: true
})
export class MouseWheelDirective {
  @Output() mouseWheelUp = new EventEmitter();

  @Output() mouseWheelDown = new EventEmitter();

  #focused = false;

  @HostListener('focus')
  focused() {
    this.#focused = true;
  }

  @HostListener('blur')
  blurred() {
    this.#focused = false;
  }

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    if (this.#focused) {
      this.mouseWheelFunc(event);
    }
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any) {
    if (this.#focused) {
      this.mouseWheelFunc(event);
    }
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any) {
    if (this.#focused) {
      this.mouseWheelFunc(event);
    }
  }

  mouseWheelFunc(eventUi: any) {
    const event: any = window.event || eventUi; // old IE support
    const delta: number = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    if (delta > 0) {
      this.mouseWheelUp.emit(event);
    } else if (delta < 0) {
      this.mouseWheelDown.emit(event);
    }
    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if (event.preventDefault) {
      event.preventDefault();
    }
  }
}
