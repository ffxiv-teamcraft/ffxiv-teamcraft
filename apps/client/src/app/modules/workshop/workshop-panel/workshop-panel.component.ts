import { Component, Input } from '@angular/core';
import { Workshop } from '../../../model/other/workshop';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-workshop-panel',
  templateUrl: './workshop-panel.component.html',
  styleUrls: ['./workshop-panel.component.less']
})
export class WorkshopPanelComponent {

  @Input()
  public set workshop(l: Workshop) {
    this._workshop = l;
    this.workshop$.next(l);
  }

  public _workshop: Workshop;

  private workshop$: ReplaySubject<Workshop> = new ReplaySubject<Workshop>();
}
