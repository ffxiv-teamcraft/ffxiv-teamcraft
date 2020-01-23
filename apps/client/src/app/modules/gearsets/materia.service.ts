import { Injectable } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/memoized';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {

  constructor(private lazyData: LazyDataService) {
  }

  @Memoized()
  getMateria(itemId: number): any {
    return this.lazyData.data.materias.find(m => m.itemId === itemId);
  };

  getMateriaBonus(equipmentPiece: EquipmentPiece, materiaId: number, index: number): { overcapped: boolean, value: number } {
    if (materiaId === 0) {
      return {
        overcapped: false,
        value: 0
      };
    }
    const materia = this.getMateria(materiaId);
    const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId];
    const stat: any = itemStats.find((s: any) => s.ID === materia.baseParamId);
    let statValue = 0;
    if (stat) {
      if (equipmentPiece.hq) {
        statValue = stat.HQ;
      } else {
        statValue = stat.NQ;
      }
    }

    // Compute maximum value for this stat
    const cap = this.getItemCapForStat(equipmentPiece.itemId, materia.baseParamId);

    // Apply all the other same stat materias of the stack
    equipmentPiece.materias.slice(0, index)
      .map(otherMateriaId => {
        return this.getMateria(otherMateriaId);
      })
      .filter(m => {
        return m && m.baseParamId === materia.baseParamId;
      })
      .forEach((otherMateria) => {
        statValue += otherMateria.value;
      });
    // If it caps right after adding the other materias of the same type, we can stop here
    if (statValue > cap) {
      statValue = cap;
      return {
        overcapped: true,
        value: 0
      };
    }

    // If melding this materia caps the item, return remaining amount to cap
    if (statValue + materia.value > cap) {
      return {
        overcapped: true,
        value: cap - statValue
      };
    }

    return {
      overcapped: false,
      value: materia.value
    };
  }

  getTotalStat(startingValue: number, equipmentPiece: EquipmentPiece, baseParamId: number): number {
    let result = startingValue;
    equipmentPiece.materias
      .map(materia => {
        return this.getMateria(materia);
      })
      .filter(m => {
        return m && m.baseParamId === baseParamId;
      })
      .forEach((otherMateria) => {
        result += otherMateria.value;
      });
    const cap = this.getItemCapForStat(equipmentPiece.itemId, baseParamId);
    return result > cap ? cap : result;
  }

  @Memoized()
  getItemCapForStat(itemId: number, baseParamId: number): number {
    const itemLevel = this.lazyData.data.itemLevel[this.lazyData.data.ilvls[itemId]];
    const baseParam = this.lazyData.data.baseParams[baseParamId];
    const meldingData = this.lazyData.data.itemMeldingData[itemId];
    const baseValue = itemLevel[baseParam.Name_en.replace(/\s/g, '')];
    const slotModifier = baseParam[meldingData.prop];
    const roleModifier = baseParam[`MeldParam${meldingData.modifier}`];
    return Math.floor(baseValue * slotModifier / roleModifier);
  }
}
