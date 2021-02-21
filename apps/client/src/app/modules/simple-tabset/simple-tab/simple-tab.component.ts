import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'app-simple-tab',
  templateUrl: './simple-tab.component.html',
  styleUrls: ['./simple-tab.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTabComponent {

  @Input()
  title: string;

  private _active: boolean;

  @Input()
  set active(active: boolean) {
    this._active = active;
    this.cd.detectChanges();
  }

  get active(): boolean {
    return this._active;
  }

  constructor(private cd: ChangeDetectorRef) {
  }
}
