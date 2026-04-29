import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';


@Component({
    selector: 'app-simple-tab',
    templateUrl: './simple-tab.component.html',
    styleUrls: ['./simple-tab.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: []
})
export class SimpleTabComponent {
  private cd = inject(ChangeDetectorRef);


  @Input()
  title: string;

  private _active: boolean;

  get active(): boolean {
    return this._active;
  }

  @Input()
  set active(active: boolean) {
    this._active = active;
    this.cd.detectChanges();
  }
}
