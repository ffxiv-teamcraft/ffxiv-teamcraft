import { NgForOf } from '@angular/common';
import { Directive, Host } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngForTrackById]'
})
export class NgForTrackByIdDirective<T extends {id: number | string}>{
  constructor(@Host() private readonly ngFor: NgForOf<T>) {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
  }
}
