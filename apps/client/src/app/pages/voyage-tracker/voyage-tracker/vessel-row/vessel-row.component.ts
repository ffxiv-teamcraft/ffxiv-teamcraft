import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Vessel } from '../../../../modules/freecompany-workshops/model/vessel';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { FreecompanyWorkshopFacade } from '../../../../modules/freecompany-workshops/+state/freecompany-workshop.facade';
import { Submarine } from '../../../../modules/freecompany-workshops/model/submarine';
import { timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vessel-row',
  templateUrl: './vessel-row.component.html',
  styleUrls: ['./vessel-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselRowComponent extends TeamcraftComponent {
  @Input()
  maxRank: number;

  @Input()
  vessel: Submarine;

  remainingTime$ = timer(0, 1000).pipe(
    map(() => this.getRemainingTime()),
    takeUntil(this.onDestroy$),
  );

  constructor(private freecompanyWorkshopFacade: FreecompanyWorkshopFacade, public translate: TranslateService) {
    super();
  }

  isVesselBack(vessel: Vessel): boolean {
    if (!vessel) {
      return true;
    }
    return vessel.returnTime <= Date.now() / 1000;
  }

  isVesselCompleted(vessel: Vessel): boolean {
    if (!vessel) {
      return false;
    }
    return vessel.status === 2 && this.isVesselBack(vessel);
  }

  getRemainingTime(): number {
    return this.freecompanyWorkshopFacade.getRemainingTime(this.vessel.returnTime);
  }
}
