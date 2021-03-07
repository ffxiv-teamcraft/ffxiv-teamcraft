import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AirshipPartType } from '../../../../../modules/free-company-workshops/model/airship-part-type';
import { VesselPart } from '../../../../../modules/free-company-workshops/model/vessel-part';
import { SubmarinePartType } from '../../../../../modules/free-company-workshops/model/submarine-part-type';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { VesselStats } from '../../../../../modules/free-company-workshops/model/vessel-stats';
import { VesselType } from '../../../../../modules/free-company-workshops/model/vessel-type';

@Component({
  selector: 'app-vessel-build-column',
  templateUrl: './vessel-build-column.component.html',
  styleUrls: ['./vessel-build-column.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VesselBuildColumnComponent {
  @Input() name: string;
  @Input() type: VesselType;
  @Input() rank: number;
  @Input() parts: Record<AirshipPartType, VesselPart> | Record<SubmarinePartType, VesselPart>;

  get fullnameParts(): string[] {
    return Object.keys(this.parts)
      .map((slot) => this.freeCompanyWorkshopFacade.getVesselPartName(this.type, this.parts[slot].partId));
  }

  get vesselBuild(): { abbreviation: string, stats: VesselStats } {
    return this.freeCompanyWorkshopFacade.getVesselBuild(this.type, this.rank, this.parts);
  }

  get condition(): string {
    return Object.keys(this.parts).map((slot) => `${((this.parts[slot].condition || 0) / 300).toFixed(2)}%`).join(' - ');
  }

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade) {
  }
}
