import { Injectable } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';

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

  @Memoized()
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

  getMeldingChances(equipmentPiece: EquipmentPiece, materiaItemId: number, slot: number): number {
    const materia = this.getMateria(materiaItemId);
    const overmeldSlot = slot - equipmentPiece.materiaSlots;
    if (overmeldSlot < 0) {
      return 100;
    }
    return this.lazyData.dohdolMeldingRates[equipmentPiece.hq ? 'hq' : 'nq'][materia.tier - 1][overmeldSlot];
  }

  getTotalNeededMaterias(gearset: TeamcraftGearset): { id: number, amount: number }[] {
    const materias = [];
    Object.keys(gearset)
      .filter(key => gearset[key] && gearset[key].itemId !== undefined)
      .forEach(key => {
        const piece: EquipmentPiece = gearset[key];
        piece.materias
          .filter((itemId) => itemId > 0)
          .forEach((itemId, index) => {
            let materiaRow = materias.find(m => m.id === itemId);
            const materia = this.getMateria(itemId);
            if (materiaRow === undefined) {
              materias.push({
                id: itemId,
                baseParamId: materia.baseParamId,
                tier: materia.tier,
                amount: 0
              });
              materiaRow = materias[materias.length - 1];
            }
            if (index < piece.materiaSlots) {
              materiaRow.amount += 1;
              return;
            }
            const overmeldChances = this.lazyData.dohdolMeldingRates[piece.hq ? 'hq' : 'nq'][materia.tier - 1][index - piece.materiaSlots];
            if (overmeldChances === 0) {
              return;
            }
            materiaRow.amount += Math.ceil(1 / (overmeldChances / 100));
          });
      });
    return materias.sort((a, b) => {
      if (a.baseParamId === b.baseParamId) {
        return a.tier - b.tier;
      }
      return a.baseParamId - b.baseParamId;
    });
  }

  @Memoized()
  getItemCapForStat(itemId: number, baseParamId: number): number {
    const itemLevel = this.lazyData.data.itemLevel[this.lazyData.data.ilvls[itemId]];
    const baseParam = this.lazyData.data.baseParams[baseParamId];
    const meldingData = this.lazyData.data.itemMeldingData[itemId];
    const baseValue = itemLevel[baseParam.Name_en.replace(/\s/g, '')];
    const slotModifier = baseParam[meldingData.prop];
    const roleModifier = baseParam[`MeldParam${meldingData.modifier}`];
    return Math.round(baseValue * slotModifier / roleModifier);
  }
}
