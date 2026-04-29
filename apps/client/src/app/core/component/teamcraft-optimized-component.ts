import { TeamcraftComponent } from './teamcraft-component';
import { AfterViewInit, ChangeDetectorRef, Component, inject } from '@angular/core';

@Component({
  standalone: false,
  template: ''
})
export class TeamcraftOptimizedComponent extends TeamcraftComponent implements AfterViewInit {
  protected cd = inject(ChangeDetectorRef);


  constructor() {
    super();
    const cd = this.cd;

    cd.detach();
  }

  ngAfterViewInit(): void {
    this.cd.reattach();
    this.cd.markForCheck();
  }
}
