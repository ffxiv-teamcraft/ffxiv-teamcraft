import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Vessel } from '../../../../../modules/freecompany-workshops/model/vessel';
import { FreecompanyWorkshopFacade } from '../../../../../modules/freecompany-workshops/+state/freecompany-workshop.facade';

@Component({
  selector: 'app-vessel-voyage-column',
  templateUrl: './vessel-voyage-column.component.html',
  styleUrls: ['./vessel-voyage-column.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselVoyageColumnComponent {
  @Input() vessel: Vessel;

  constructor(private freecompanyWorkshopFacade: FreecompanyWorkshopFacade) { }

  toDestinationNames(): string[] {
    if (!this.vessel) {
      return null;
    }
    return this.freecompanyWorkshopFacade.toDestinationNames(this.vessel.vesselType, this.vessel.destinations);
  }
}
