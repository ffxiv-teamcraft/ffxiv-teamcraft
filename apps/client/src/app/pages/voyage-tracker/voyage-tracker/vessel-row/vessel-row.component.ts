import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vessel } from '../../../../modules/free-company-workshops/model/vessel';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { FreeCompanyWorkshopFacade } from '../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { Submarine } from '../../../../modules/free-company-workshops/model/submarine';
import { timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Airship } from '../../../../modules/free-company-workshops/model/airship';

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
  vessel: Airship | Submarine;

  remainingTime$ = timer(0, 1000).pipe(
    map(() => this.freeCompanyWorkshopFacade.getRemainingTime(this.vessel.returnTime)),
    takeUntil(this.onDestroy$)
  );

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade, public translate: TranslateService) {
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
}
