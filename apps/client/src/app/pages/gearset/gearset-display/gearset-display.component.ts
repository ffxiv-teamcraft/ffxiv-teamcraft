import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { NzModalService } from 'ng-zorro-antd';
import { GearsetComparatorPopupComponent } from '../../../modules/gearsets/gearset-comparator-popup/gearset-comparator-popup.component';

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


  public level$ = new BehaviorSubject<number>(80);

  public tribe$ = new BehaviorSubject<number>(1);

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$]).pipe(
    map(([set, level, tribe]) => {
      return this.statsService.getStats(set, level, tribe);
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = environment.maxLevel;

  permissionLevel$: Observable<PermissionLevel> = this.gearsetsFacade.selectedGearsetPermissionLevel$;

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService, private statsService: StatsService,
              private dialog: NzModalService) {
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

  compare(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.COMPARISON.Compare_popup_title', { setName: gearset.name }),
      nzContent: GearsetComparatorPopupComponent,
      nzComponentParams: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

}
