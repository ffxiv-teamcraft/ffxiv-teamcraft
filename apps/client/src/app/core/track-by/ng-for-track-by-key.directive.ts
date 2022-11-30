import { NgForOf } from '@angular/common';
import { Directive, Host } from '@angular/core';
import { DataModel } from '../database/storage/data-model';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngForTrackByKey]'
})
export class NgForTrackByKeyDirective<T extends DataModel>{
  constructor(@Host() private readonly ngFor: NgForOf<T>) {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.$key;
  }
}
