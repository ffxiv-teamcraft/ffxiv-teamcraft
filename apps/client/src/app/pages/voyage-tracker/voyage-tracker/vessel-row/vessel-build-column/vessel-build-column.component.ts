import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AirshipPartType } from '../../../../../modules/free-company-workshops/model/airship-part-type';
import { VesselPart } from '../../../../../modules/free-company-workshops/model/vessel-part';
import { SubmarinePartType } from '../../../../../modules/free-company-workshops/model/submarine-part-type';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { VesselType } from '../../../../../modules/free-company-workshops/model/vessel-type';
import { observeInput } from '../../../../../core/rxjs/observe-input';
import { combineLatest } from 'rxjs';
import { safeCombineLatest } from '../../../../../core/rxjs/safe-combine-latest';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-vessel-build-column',
  templateUrl: './vessel-build-column.component.html',
  styleUrls: ['./vessel-build-column.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselBuildColumnComponent {
  @Input() name: string;
  name$ = observeInput(this, 'name');
  @Input() type: VesselType;
  type$ = observeInput(this, 'type');
  @Input() rank: number;
  rank$ = observeInput(this, 'rank');
  @Input() parts: Record<AirshipPartType, VesselPart> | Record<SubmarinePartType, VesselPart>;
  parts$ = observeInput(this, 'parts');

  fullNameParts$ = combineLatest([
    this.parts$,
    this.type$
  ]).pipe(
    switchMap(([parts, type]) => {
      return safeCombineLatest(Object.keys(parts)
        .map((slot) => this.freeCompanyWorkshopFacade.getVesselPartName(type, parts[slot].partId)));
    })
  );

  vesselBuild$ = combineLatest([
    this.type$,
    this.rank$,
    this.parts$
  ]).pipe(
    switchMap(([type, rank, parts]) => {
      return this.freeCompanyWorkshopFacade.getVesselBuild(type, rank, parts);
    })
  );

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade) {
  }

  get condition(): string {
    return Object.keys(this.parts).map((slot) => `${((this.parts[slot].condition || 0) / 300).toFixed(2)}%`).join(' - ');
  }
}
