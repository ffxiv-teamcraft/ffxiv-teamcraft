import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Vessel } from '../../../../../modules/free-company-workshops/model/vessel';
import { FreeCompanyWorkshopFacade } from '../../../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { observeInput } from '../../../../../core/rxjs/observe-input';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { VesselType } from '../../../../../modules/free-company-workshops/model/vessel-type';
import { DomSanitizer } from '@angular/platform-browser';
import { NzPipesModule } from 'ng-zorro-antd/pipes';
import { LazyRowPipe } from '../../../../../pipes/pipes/lazy-row.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

@Component({
    selector: 'app-vessel-voyage-column',
    templateUrl: './vessel-voyage-column.component.html',
    styleUrls: ['./vessel-voyage-column.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzPopoverModule, NzBreadCrumbModule, NgFor, NgIf, NzButtonModule, NzIconModule, AsyncPipe, TranslateModule, LazyRowPipe, NzPipesModule]
})
export class VesselVoyageColumnComponent {
  @Input() vessel: Vessel;

  VesselType = VesselType;

  destinationNames$ = observeInput(this, 'vessel').pipe(
    switchMap(vessel => {
      if (!vessel) {
        return of(null);
      }
      return this.freeCompanyWorkshopFacade.toDestinationNames(this.vessel.vesselType, this.vessel.destinations).pipe(
        map(names => names.map(name => this.sanitizer.bypassSecurityTrustHtml(name)))
      );
    })
  );

  constructor(private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade, private sanitizer: DomSanitizer) {
  }
}
