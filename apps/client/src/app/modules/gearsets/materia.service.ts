import { Injectable } from '@angular/core';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { getItemSource } from '../list/model/list-row';
import { DataType } from '../list/data/data-type';
import { TradeSource } from '../list/model/trade-source';
import { GearsetProgression } from '../../model/gearset/gearset-progression';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { LazyMateria } from '../../lazy-data/model/lazy-materia';
import { combineLatest, Observable, of } from 'rxjs';
import { StaticData } from '../../lazy-data/static-data';
import { LazyItemStat } from '../../lazy-data/model/lazy-item-stat';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { LazyData } from '../../lazy-data/lazy-data';
import { SettingsService } from '../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {

  constructor(private lazyData: LazyDataFacade, private settings: SettingsService) {
  }

  @Memoized()
  getMateria(itemId: number): Observable<LazyMateria> {
    return this.lazyData.getEntry('materias').pipe(
      map(materias => {
        return materias.find(m => m.itemId === itemId);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  };

  getMateriaItemIdFromPacketMateria(packetMateria: number, tier: number, materias: LazyData['materias']): number {
    return materias.find(m => m.id === packetMateria && m.tier === tier + 1)?.itemId;
  }

  getMateriaBonus(equipmentPiece: EquipmentPiece, materiaId: number, index: number): Observable<{ overcapped: boolean, value: number }> {
    return combineLatest([
      this.getMateria(materiaId),
      this.lazyData.getRow('itemStats', equipmentPiece.itemId, [])
    ]).pipe(
      switchMap(([materia, itemStats]) => {
        return this.getItemCapForStat(equipmentPiece.itemId, materia.baseParamId).pipe(
          map(cap => [materia, itemStats, cap])
        );
      }),
      switchMap(([materia, itemStats, cap]: [LazyMateria, LazyItemStat[], number]) => {
        if (materiaId === 0) {
          return of({
            overcapped: false,
            value: 0
          });
        }
        if (materia === undefined) {
          return of({
            overcapped: false,
            value: 0
          });
        }
        const stat = itemStats.find((s: any) => s.ID === materia.baseParamId);
        let statValue = 0;
        if (stat) {
          if (equipmentPiece.hq) {
            statValue = stat.HQ;
          } else {
            statValue = stat.NQ;
          }
        }

        // Compute maximum value for this stat

        // Apply all the other same stat materias of the stack
        return safeCombineLatest(equipmentPiece.materias.slice(0, index).map(otherMateriaId => {
          return this.getMateria(otherMateriaId);
        })).pipe(
          map(otherMaterias => {
            const finalValue = otherMaterias
              .filter(m => {
                return m && m.baseParamId === materia.baseParamId;
              })
              .reduce((acc, otherMateria) => {
                return acc + otherMateria.value;
              }, statValue);
            // If it caps right after adding the other materias of the same type, we can stop here
            if (finalValue > cap) {
              return {
                overcapped: true,
                value: 0
              };
            }

            // If melding this materia caps the item, return remaining amount to cap
            if (finalValue + materia.value > cap) {
              return {
                overcapped: true,
                value: cap - finalValue
              };
            }

            return {
              overcapped: false,
              value: materia.value
            };
          })
        );
      })
    );

  }

  @Memoized()
  getTotalStat(startingValue: number, equipmentPiece: EquipmentPiece, baseParamId: number): Observable<number> {
    return safeCombineLatest(equipmentPiece.materias
      .map(materia => {
        return this.getMateria(materia);
      })
    ).pipe(
      map(materias => {
        return materias
          .filter(m => {
            return m && m.baseParamId === baseParamId;
          })
          .reduce((acc, otherMateria) => {
            return acc + otherMateria.value;
          }, startingValue);
      }),
      switchMap(result => {
        return this.getItemCapForStat(equipmentPiece.itemId, baseParamId).pipe(
          map(cap => result > cap ? cap : result)
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getMeldingChances(equipmentPiece: EquipmentPiece, materiaItemId: number, slot: number): Observable<number> {
    return this.getMateria(materiaItemId).pipe(
      map(materia => {
        const overmeldSlot = slot - equipmentPiece.materiaSlots;
        if (overmeldSlot < 0) {
          return 100;
        }
        return StaticData.dohdolMeldingRates[equipmentPiece.hq ? 'hq' : 'nq'][materia.tier - 1][overmeldSlot];
      })
    );
  }

  getTotalNeededMaterias(gearset: TeamcraftGearset, includeAllTools: boolean, progression?: GearsetProgression): Observable<{ id: number, slots: number, amount: number, scrip?: { id: number, amount: number } }[]> {
    const materiasObsArray$ = Object.keys(gearset)
      .filter(key => gearset[key] && gearset[key].itemId !== undefined)
      .map(key => {
        const piece: EquipmentPiece = gearset[key];
        return safeCombineLatest(piece.materias
          .filter(itemId => itemId > 0)
          .map((itemId, index) => {
            if (progression && progression[key].materias[index]) {
              return of(null);
            }
            return this.getMateria(itemId);
          })
        ).pipe(
          map((materias: Array<LazyMateria | null>) => ({ slot: key, piece, materias }))
        );
      });

    return combineLatest([
      safeCombineLatest(materiasObsArray$),
      this.lazyData.getEntry('extracts'),
      this.settings.watchSetting<number>('materias:confidence', 0.5)
    ]).pipe(
      map(([pieces, extracts, confidence]) => {
        return pieces.reduce((acc, { slot, piece, materias }) => {
          materias.forEach((materia, index) => {
            if (materia === null) {
              return;
            }
            let materiaRow = acc.find(m => m.id === materia.itemId);
            if (materiaRow === undefined) {
              acc.push({
                id: materia.itemId,
                baseParamId: materia.baseParamId,
                tier: materia.tier,
                slots: 0,
                amount: 0,
                value: materia.value
              });
              materiaRow = acc[acc.length - 1];
            }
            let overmeldChances = StaticData.dohdolMeldingRates[piece.hq ? 'hq' : 'nq'][materia.tier - 1][index - piece.materiaSlots];
            if (index < piece.materiaSlots) {
              overmeldChances = 100;
            }
            if (overmeldChances === 0) {
              return;
            }
            let amount = Math.max(Math.ceil(Math.log(1 - this.settings.materiaConfidenceRate) / Math.log(1 - (overmeldChances / 100))), 1);
            let slots = 1;
            // If we're including all tools and it's a tool
            if (includeAllTools && ['mainHand', 'offHand'].indexOf(slot) > -1) {
              // If DoH
              if (gearset.job < 16) {
                amount *= 8;
                slots *= 8;
              } else if (gearset.job < 19) {
                if (slot === 'mainHand') {
                  amount *= 3;
                  slots *= 3;
                } else {
                  // You can't meld FSH's offhand
                  amount *= 2;
                  slots *= 2;
                }
              }
            }
            materiaRow.amount += amount;
            materiaRow.slots += slots;
          });
          return acc;
        }, []).sort((a, b) => {
          if (a.baseParamId === b.baseParamId) {
            return a.tier - b.tier;
          }
          return a.baseParamId - b.baseParamId;
        }).map(materia => {
          const extract = extracts[materia.id];
          const trades = getItemSource<TradeSource[]>(extract, DataType.TRADE_SOURCES);
          const scripIds = [
            25199,
            25200,
            33913,
            33914
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
      })
    );
  }

  @Memoized()
  getItemCapForStat(itemId: number, baseParamId: number): Observable<number> {
    return combineLatest([
      this.lazyData.getEntry('itemLevel'),
      this.lazyData.getEntry('ilvls'),
      this.lazyData.getEntry('baseParams'),
      this.lazyData.getEntry('itemMeldingData')
    ]).pipe(
      map(([lazyItemLevel, ilvls, baseParams, itemMeldingData]) => {
        const itemLevel = lazyItemLevel[ilvls[itemId]];
        const baseParam = baseParams[baseParamId];
        const meldingData = itemMeldingData[itemId];
        if (!meldingData) {
          return 0;
        }
        const baseValue = itemLevel[baseParam.Name_en.replace(/\s/g, '')];
        const slotModifier = baseParam[meldingData.prop];
        const roleModifier = baseParam[`MeldParam${meldingData.modifier}`];
        return Math.round(baseValue * slotModifier / (roleModifier * 10));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
