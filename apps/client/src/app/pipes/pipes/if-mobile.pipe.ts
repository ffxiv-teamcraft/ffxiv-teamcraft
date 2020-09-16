import { Pipe, PipeTransform } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Pipe({
  name: 'ifMobile',
  pure: false
})
export class IfMobilePipe implements PipeTransform {

  constructor(private media: MediaObserver) {
  }

  transform<T, R>(nonMobileValue: T, mobileValue: R, forceMobile = false): T | R {
    return (forceMobile || this.media.isActive('xs') || this.media.isActive('sm')) ? mobileValue : nonMobileValue;
  }

}
