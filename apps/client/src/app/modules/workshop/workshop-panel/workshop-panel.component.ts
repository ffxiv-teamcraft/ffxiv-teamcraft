import { Component, Input } from '@angular/core';
import { Workshop } from '../../../model/other/workshop';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { WorkshopsFacade } from '../+state/workshops.facade';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';

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

  permissionLevel$: Observable<PermissionLevel> = combineLatest(this.authFacade.userId$, this.workshop$).pipe(
    map(([userId, workshop]) => workshop.getPermissionLevel(userId)),
    distinctUntilChanged(),
    shareReplay(1),
  );

  constructor(private workshopsFacade: WorkshopsFacade, private authFacade: AuthFacade) {
  }

  deleteWorkshop(): void {
    this.workshopsFacade.deleteWorkshop(this._workshop.$key);
  }
}
