import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vessel } from '../../../../../modules/free-company-workshops/model/vessel';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { observeInput } from '../../../../../core/rxjs/observe-input';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { VesselType } from '../../../../../modules/free-company-workshops/model/vessel-type';

@Component({
  selector: 'app-vessel-voyage-column',
  templateUrl: './vessel-voyage-column.component.html',
  styleUrls: ['./vessel-voyage-column.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselVoyageColumnComponent {
  @Input() vessel: Vessel;

  VesselType = VesselType;

  destinationNames$ = observeInput(this, 'vessel').pipe(
    switchMap(vessel => {
      if (!vessel) {
        return of(null);
      }
      return this.freeCompanyWorkshopFacade.toDestinationNames(this.vessel.vesselType, this.vessel.destinations);
    })
  );

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade) {
  }
}
