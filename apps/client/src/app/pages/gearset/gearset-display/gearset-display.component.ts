import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';

@Component({
  selector: 'app-gearset-display',
  templateUrl: './gearset-display.component.html',
  styleUrls: ['./gearset-display.component.less']
})
export class GearsetDisplayComponent extends TeamcraftComponent {

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$;

  public gearsetSlotProperties: (keyof TeamcraftGearset)[][] = [
    ['mainHand', 'offHand'],
    ['head', 'necklace'],
    ['chest', 'earRings'],
    ['gloves', 'bracelet'],
    ['belt', 'ring1'],
    ['legs', 'ring2'],
    ['feet', 'crystal']
  ];

  public stats$: Observable<{ id: number, value: number }[]> = this.gearsetsFacade.selectedGearsetStats;

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService) {
    super();
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('setId')),
        tap((setId: string) => this.gearsetsFacade.load(setId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(setId => {
        this.gearsetsFacade.select(setId);
      });
  }

}
