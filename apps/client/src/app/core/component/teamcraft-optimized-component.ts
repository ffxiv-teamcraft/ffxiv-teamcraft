import { TeamcraftComponent } from './teamcraft-component';
import { AfterViewInit, ChangeDetectorRef } from '@angular/core';

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
