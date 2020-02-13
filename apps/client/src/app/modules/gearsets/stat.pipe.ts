import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';

@Pipe({
  name: 'stat'
})
export class StatPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService, private materiaService: MateriaService) {
  }

  transform(equipmentPiece: EquipmentPiece, baseParamId: number): { value: number, bonus: number, total: number } {
    const value = this.getStatValue(equipmentPiece.itemId, baseParamId, equipmentPiece.hq);
    if (equipmentPiece.materias.some(m => m > 0)) {
      const totalStat = this.materiaService.getTotalStat(value, equipmentPiece, baseParamId);
      return {
        value: value,
        bonus: totalStat - value,
        total: totalStat
      };
    }
    return {
      value: value,
      bonus: 0,
      total: value
    };
  }

  @Memoized()
  private getStatValue(itemId: number, baseParamId: number, hq: boolean): number {
    const stats = this.lazyData.data.itemStats[itemId];
    if (!stats) {
      return 0;
    }
    const stat = stats.find(s => s.ID === baseParamId);
    if (!stat) {
      return 0;
    }
    if (hq && stat.HQ) {
      return stat.HQ;
    }
    return stat.NQ;
  }

}
