import { NgForOf } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { DataModel } from '../database/storage/data-model';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[ngForTrackByKey]',
    standalone: true
})
export class NgForTrackByKeyDirective<T extends DataModel>{
  private readonly ngFor = inject<NgForOf<T>>(NgForOf, { host: true });

  constructor() {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.$key;
  }
}
