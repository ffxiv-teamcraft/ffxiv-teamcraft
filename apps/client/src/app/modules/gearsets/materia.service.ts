import { Injectable } from '@angular/core';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { getItemSource } from '../list/model/list-row';
import { DataType } from '../list/data/data-type';
import { TradeSource } from '../list/model/trade-source';
import { GearsetProgression } from '../../model/gearset/gearset-progression';

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
    if (materia === undefined) {
      return {
        overcapped: false,
        value: 0
      };
    }
    const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId] || [];
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

  getTotalNeededMaterias(gearset: TeamcraftGearset, includeAllTools: boolean, progression?: GearsetProgression): { id: number, amount: number, scrip?: { id: number, amount: number } }[] {
    const materias = [];
    Object.keys(gearset)
      .filter(key => gearset[key] && gearset[key].itemId !== undefined)
      .forEach(key => {
        const piece: EquipmentPiece = gearset[key];
        piece.materias
          .filter((itemId) => itemId > 0)
          .forEach((itemId, index) => {
            if (progression && progression[key].materias[index]) {
              return;
            }
            let materiaRow = materias.find(m => m.id === itemId);
            const materia = this.getMateria(itemId);
            if (materiaRow === undefined) {
              materias.push({
                id: itemId,
                baseParamId: materia.baseParamId,
                tier: materia.tier,
                amount: 0,
                value: materia.value
              });
              materiaRow = materias[materias.length - 1];
            }
            let overmeldChances = this.lazyData.dohdolMeldingRates[piece.hq ? 'hq' : 'nq'][materia.tier - 1][index - piece.materiaSlots];
            if (index < piece.materiaSlots) {
              overmeldChances = 100;
            }
            if (overmeldChances === 0) {
              return;
            }
            let amount = Math.ceil(1 / (overmeldChances / 100));
            // If we're including all tools and it's a tool
            if (includeAllTools && ['mainHand', 'offHand'].indexOf(key) > -1) {
              // If DoH
              if (gearset.job < 16) {
                amount *= 8;
              } else if (gearset.job < 19) {
                if (key === 'mainHand') {
                  amount *= 3;
                } else {
                  // You can't meld FSH's offhand
                  amount *= 2;
                }
              }
            }
            materiaRow.amount += amount;
          });
      });
    return materias.sort((a, b) => {
      if (a.baseParamId === b.baseParamId) {
        return a.tier - b.tier;
      }
      return a.baseParamId - b.baseParamId;
    }).map(materia => {
      const extract = this.lazyData.getExtract(materia.id);
      const trades = getItemSource<TradeSource[]>(extract, DataType.TRADE_SOURCES);
      const scripIds = [
        17833,
        17834,
        25199,
        25200
      ];
      const scripTrade = {
        id: -1,
        amount: 0
      };
      trades.forEach(t => {
        t.trades.forEach(trade => {
          if (scripTrade.id > -1) {
            return;
          }
          const scripRow = trade.currencies.find(c => {
            return scripIds.includes(+c.id);
          });
          if (scripRow !== undefined) {
            scripTrade.id = +scripRow.id;
            scripTrade.amount = scripRow.amount;
          }
        });
      });
      if (scripTrade.id > -1) {
        materia.scrip = scripTrade;
      }
      return materia;
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
