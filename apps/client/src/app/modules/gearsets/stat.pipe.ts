import { Pipe, PipeTransform } from '@angular/core';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

@Pipe({
  name: 'stat'
})
export class StatPipe implements PipeTransform {

  constructor(private lazyData: LazyDataFacade, private materiaService: MateriaService) {
  }

  transform(equipmentPiece: EquipmentPiece, baseParamId: number, gearset: TeamcraftGearset): Observable<{ value: number, bonus: number, total: number }> {
    return this.getStatValue(equipmentPiece.itemId, baseParamId, equipmentPiece.hq).pipe(
      switchMap(value => {
        let bonus$ = of(0);
        if (equipmentPiece.materias.some(m => m > 0)) {
          bonus$ = this.materiaService.getTotalStat(value, equipmentPiece, baseParamId).pipe(map(bonus => bonus - value));
        }
        return combineLatest([
          this.lazyData.getEntry('itemSetBonuses'),
          bonus$
        ]).pipe(
          map(([itemSetBonuses, bonus]) => {
            const setBonuses = itemSetBonuses[equipmentPiece.itemId];
            if (setBonuses) {
              const totalMatchingPieces = Object.keys(gearset).filter(key => {
                return itemSetBonuses[gearset[key]?.itemId]?.itemSeriesId === setBonuses.itemSeriesId;
              }).length;
              bonus = setBonuses.bonuses.filter(b => b.baseParam === baseParamId && b.amountRequired <= totalMatchingPieces).reduce((total, b) => b.value + total, 0);
            }

            return {
              value: value,
              bonus: bonus,
              total: value + bonus
            };

          })
        );
      })
    );
  }

  @Memoized()
  private getStatValue(itemId: number, baseParamId: number, hq: boolean): Observable<number> {
    return this.lazyData.getRow('itemStats', itemId, []).pipe(
      map(stats => {
        const stat = stats.find(s => s.ID === baseParamId);
        if (!stat) {
          return 0;
        }
        if (hq && stat.HQ) {
          return stat.HQ;
        }
        return stat.NQ;
      })
    );
  }

}
