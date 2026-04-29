import { NgForOf } from '@angular/common';
import { Directive, inject } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[ngForTrackById]',
    standalone: true
})
export class NgForTrackByIdDirective<T extends {id: number | string}>{
  private readonly ngFor = inject<NgForOf<T>>(NgForOf, { host: true });

  constructor() {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
  }
}
