import { Pipe, PipeTransform } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';

@Pipe({
  name: 'stat'
})
export class StatPipe implements PipeTransform {

  constructor(private lazyData: LazyDataService, private materiaService: MateriaService) {
  }

  transform(equipmentPiece: EquipmentPiece, baseParamId: number, gearset: TeamcraftGearset): { value: number, bonus: number, total: number } {
    const value = this.getStatValue(equipmentPiece.itemId, baseParamId, equipmentPiece.hq);
    let bonus = 0;
    if (equipmentPiece.materias.some(m => m > 0)) {
      bonus = this.materiaService.getTotalStat(value, equipmentPiece, baseParamId) - value;
    }
    const setBonuses = this.lazyData.data.itemSetBonuses[equipmentPiece.itemId];
    if (setBonuses) {
      const totalMatchingPieces = Object.keys(gearset).filter(key => {
        return this.lazyData.data.itemSetBonuses[gearset[key]?.itemId]?.itemSeriesId === setBonuses.itemSeriesId;
      }).length;
      bonus = setBonuses.bonuses.filter(b => b.baseParam === baseParamId && b.amountRequired <= totalMatchingPieces).reduce((total, b) => b.value + total, 0);
    }
    return {
      value: value,
      bonus: bonus,
      total: value + bonus
    };
  }

  @Memoized()
  private getStatValue(itemId: number, baseParamId: number, hq: boolean): number {
    const stats = this.lazyData.data.itemStats[itemId] || [];
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
