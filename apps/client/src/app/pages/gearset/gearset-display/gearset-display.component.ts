import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { TranslateService } from '@ngx-translate/core';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { environment } from '../../../../environments/environment';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';

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
      const stats = this.statsService.getRelevantBaseStats(set.job)
        .map(stat => {
          return {
            id: stat,
            value: this.statsService.getBaseValue(stat, set.job, level, tribe)
          };
        });
      Object.values(set)
        .filter(value => value && value.itemId !== undefined)
        .forEach((equipmentPiece: EquipmentPiece) => {
          const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId];
          // If this item has no stats, return !
          if (!itemStats) {
            return;
          }
          itemStats
            .filter((stat: any) => stat.ID !== undefined)
            .forEach((stat: any) => {
              let statsRow = stats.find(s => s.id === stat.ID);
              if (statsRow === undefined) {
                stats.push({
                  id: stat.ID,
                  value: this.statsService.getBaseValue(stat.ID, set.job, level, tribe)
                });
                statsRow = stats[stats.length - 1];
              }
              if (equipmentPiece.hq) {
                statsRow.value += stat.HQ;
              } else {
                statsRow.value += stat.NQ;
              }
            });
          equipmentPiece.materias
            .filter(materia => materia > 0)
            .forEach((materiaId, index) => {
              const bonus = this.materiasService.getMateriaBonus(equipmentPiece, materiaId, index);
              const materia = this.materiasService.getMateria(materiaId);
              let statsRow = stats.find(s => s.id === materia.baseParamId);
              if (statsRow === undefined) {
                stats.push({
                  id: materia.baseParamId,
                  value: this.statsService.getBaseValue(materia.baseParamId, set.job, level, tribe)
                });
                statsRow = stats[stats.length - 1];
              }
              statsRow.value += bonus.value;
            });
        });
      return stats;
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = environment.maxLevel;

  constructor(private gearsetsFacade: GearsetsFacade, private activatedRoute: ActivatedRoute,
              public translate: TranslateService, private statsService: StatsService,
              private materiasService: MateriaService, private lazyData: LazyDataService) {
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
