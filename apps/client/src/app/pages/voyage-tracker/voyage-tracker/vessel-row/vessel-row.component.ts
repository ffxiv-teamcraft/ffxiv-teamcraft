import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vessel } from '../../../../modules/free-company-workshops/model/vessel';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../../../modules/settings/settings.service';
import { FreeCompanyWorkshopFacade } from '../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { Submarine } from '../../../../modules/free-company-workshops/model/submarine';
import { timer } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Airship } from '../../../../modules/free-company-workshops/model/airship';
import { TimerPipe } from '../../../../core/eorzea/timer.pipe';
import { VesselVoyageColumnComponent } from './vessel-voyage-column/vessel-voyage-column.component';
import { VesselBuildColumnComponent } from './vessel-build-column/vessel-build-column.component';
import { VesselRankColumnComponent } from './vessel-rank-column/vessel-rank-column.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, AsyncPipe, DatePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';


@Component({
    selector: 'app-vessel-row',
    templateUrl: './vessel-row.component.html',
    styleUrls: ['./vessel-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzIconModule, VesselRankColumnComponent, VesselBuildColumnComponent, VesselVoyageColumnComponent, AsyncPipe, DatePipe, TranslateModule, TimerPipe]
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

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade, public translate: TranslateService, public settings: SettingsService) {
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
