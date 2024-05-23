import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';


@Component({
    selector: 'app-simple-tab',
    templateUrl: './simple-tab.component.html',
    styleUrls: ['./simple-tab.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: []
})
export class SimpleTabComponent {

  @Input()
  title: string;

  constructor(private cd: ChangeDetectorRef) {
  }

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
