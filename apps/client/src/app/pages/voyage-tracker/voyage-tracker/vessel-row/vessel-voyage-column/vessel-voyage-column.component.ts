import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vessel } from '../../../../../modules/free-company-workshops/model/vessel';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';

@Component({
  selector: 'app-vessel-voyage-column',
  templateUrl: './vessel-voyage-column.component.html',
  styleUrls: ['./vessel-voyage-column.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselVoyageColumnComponent {
  @Input() vessel: Vessel;

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade) {
  }

  toDestinationNames(): string[] {
    if (!this.vessel) {
      return null;
    }
    return this.freeCompanyWorkshopFacade.toDestinationNames(this.vessel.vesselType, this.vessel.destinations);
  }
}
