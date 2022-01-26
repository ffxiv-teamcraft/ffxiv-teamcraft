import { TeamcraftComponent } from './teamcraft-component';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  template: ''
})
export class TeamcraftOptimizedComponent extends TeamcraftComponent implements AfterViewInit {

  constructor(protected cd: ChangeDetectorRef) {
    super();
    cd.detach();
  }

  ngAfterViewInit(): void {
    this.cd.reattach();
    this.cd.markForCheck();
  }
}
