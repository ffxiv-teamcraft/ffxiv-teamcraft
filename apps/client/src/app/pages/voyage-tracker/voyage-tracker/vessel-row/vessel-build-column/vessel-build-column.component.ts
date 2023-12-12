import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AirshipPartType } from '../../../../../modules/free-company-workshops/model/airship-part-type';
import { VesselPart } from '../../../../../modules/free-company-workshops/model/vessel-part';
import { SubmarinePartType } from '../../../../../modules/free-company-workshops/model/submarine-part-type';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { VesselType } from '../../../../../modules/free-company-workshops/model/vessel-type';
import { observeInput } from '../../../../../core/rxjs/observe-input';
import { combineLatest } from 'rxjs';
import { safeCombineLatest } from '../../../../../core/rxjs/safe-combine-latest';
import { map, switchMap } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NgIf, NgClass, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-vessel-build-column',
    templateUrl: './vessel-build-column.component.html',
    styleUrls: ['./vessel-build-column.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzPopoverModule, NgClass, ExtendedModule, FlexModule, NgFor, AsyncPipe, TranslateModule]
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

  conditionClass$ = this.parts$.pipe(
    map(parts => {
      const worstCondition = Math.min(...Object.keys(parts).map((slot) => (parts[slot].condition || 0) / 300));
      return {'good': worstCondition > 50,
              'caution': worstCondition <= 50 && worstCondition > 25,
              'warn': worstCondition <= 25 && worstCondition > 0,
              'broken': worstCondition <= 0}
    })
  )

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
