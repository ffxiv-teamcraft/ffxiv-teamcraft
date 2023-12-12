import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { VesselType } from '../../../../modules/free-company-workshops/model/vessel-type';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Submarine } from '../../../../modules/free-company-workshops/model/submarine';
import { Airship } from '../../../../modules/free-company-workshops/model/airship';
import { VesselRowComponent } from '../vessel-row/vessel-row.component';
import { NgTemplateOutlet, NgFor, NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-vessel-list',
    templateUrl: './vessel-list.component.html',
    styleUrls: ['./vessel-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgTemplateOutlet, NgFor, NgIf, VesselRowComponent, TranslateModule]
})
export class VesselListComponent {
  @Input() airships: Airship[];

  @Input() submarines: Submarine[];

  @Input() airshipMaxRank: number;

  @Input() submarineMaxRank: number;

  constructor(public translate: TranslateService) {
  }

  get isAirshipsEmpty(): boolean {
    return this.airships?.filter((vessel) => vessel?.rank > 0).length === 0;
  }

  get isSubmarinesEmpty(): boolean {
    return this.submarines?.filter((vessel) => vessel?.rank > 0).length === 0;
  }

  get vesselTypeEnum(): typeof VesselType {
    return VesselType;
  }

  getNoVesselMessageByVesselType(vesselType: VesselType): string {
    return vesselType === VesselType.AIRSHIP ? this.translate.instant('VOYAGE_TRACKER.No_airship') : this.translate.instant('VOYAGE_TRACKER.No_submersible');
  }
}
