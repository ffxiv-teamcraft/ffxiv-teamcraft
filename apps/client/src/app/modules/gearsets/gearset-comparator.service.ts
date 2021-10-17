import { Injectable } from '@angular/core';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { GearsetsComparison } from '../../model/gearset/gearsets-comparison';
import { StatsService } from './stats.service';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { environment } from 'apps/client/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GearsetComparatorService {

  constructor(private statsService: StatsService, private materiaService: MateriaService,
              private lazyData: LazyDataService) {
  }

  toArray(gearset: TeamcraftGearset): EquipmentPiece[] {
    return [
      gearset.mainHand,
      gearset.offHand,
      gearset.head,
      gearset.chest,
      gearset.gloves,
      gearset.belt,
      gearset.legs,
      gearset.feet,
      gearset.necklace,
      gearset.earRings,
      gearset.bracelet,
      gearset.ring1,
      gearset.ring2,
      gearset.crystal
    ].filter(p => p);
  }

  getSlotArray(): string[] {
    return [
      'mainHand',
      'offHand',
      'head',
      'chest',
      'gloves',
      'belt',
      'legs',
      'feet',
      'necklace',
      'earRings',
      'bracelet',
      'ring1',
      'ring2',
      'crystal'
    ];
  }

  public compare(a: TeamcraftGearset, b: TeamcraftGearset, includeAllTools: boolean): Observable<GearsetsComparison> {
    return combineLatest([
      this.statsService.getStats(a, environment.maxLevel, 1),
      this.statsService.getStats(b, environment.maxLevel, 1),
      this.materiaService.getTotalNeededMaterias(a, includeAllTools),
      this.materiaService.getTotalNeededMaterias(b, includeAllTools)
    ]).pipe(
      switchMap(([aStats, bStats, aMaterias, bMaterias]) => {
        if (this.statsService.getMainStat(a.job) !== this.statsService.getMainStat(b.job)) {
          throw new Error('Can only compare two sets with same main stat');
        }
        const statsDiff = aStats.map(aStat => {
          const bStat = bStats.find(s => s.id === aStat.id);
          return {
            id: aStat.id,
            values: {
              a: aStat.value,
              b: bStat.value
            }
          };
        });
        const materiasDiff = aMaterias.map(aMateria => {
          const bMateria = bMaterias.find(s => s.id === aMateria.id);
          return {
            id: aMateria.id,
            amounts: {
              a: aMateria.amount,
              b: bMateria ? bMateria.amount : 0
            }
          };
        });

        materiasDiff.push(...bMaterias
          .filter(materia => !aMaterias.some(m => m.id === materia.id))
          .map(bMateria => {
            return {
              id: bMateria.id,
              amounts: {
                a: 0,
                b: bMateria.amount
              }
            };
          }));

        const piecesDiff = this.getSlotArray().map((slot: string) => {
          let isDifferent = (a[slot] && a[slot].itemId) !== (b[slot] && b[slot].itemId);
          if (!a.isCombatSet()) {
            isDifferent = isDifferent && this.lazyData.data.ilvls[a[slot] && a[slot].itemId] !== this.lazyData.data.ilvls[b[slot] && b[slot].itemId];
          }
          if (isDifferent || (a[slot] && a[slot].hq) !== (b[slot] && b[slot].hq)) {
            const aItemStats = a[slot] ? this.lazyData.data.itemStats[a[slot].itemId] || [] : [];
            const bItemStats = b[slot] ? this.lazyData.data.itemStats[b[slot].itemId] || [] : [];
            const itemsStatsDiff = aItemStats.map(as => {
              const bs = bItemStats.find(s => s.ID === as.ID);

              const diff: any = {
                id: as.ID,
                a: a[slot].hq ? as.HQ : as.NQ,
                b: 0
              };
              if (bs) {
                diff.b = b[slot].hq ? bs.HQ : bs.NQ;
              }
              return diff;
            });

            itemsStatsDiff.push(...bItemStats
              .filter(s => !itemsStatsDiff.some(entry => entry.id === s.ID))
              .map(bs => {
                const as = aItemStats.find(s => s.ID === bs.ID);
                const diff: any = {
                  id: bs.ID,
                  a: 0,
                  b: b[slot].hq ? bs.HQ : bs.NQ
                };
                if (as) {
                  diff.a = a[slot].hq ? as.HQ : as.NQ;
                }
                return diff;
              }));

            return {
              slotName: this.getSlotName(slot as keyof TeamcraftGearset),
              a: a[slot],
              b: b[slot],
              stats: itemsStatsDiff
            };
          }
          return null;
        }).filter(diff => diff !== null);

        return combineLatest([
          this.getAvgMeldingChances(a),
          this.getAvgMeldingChances(b)
        ]).pipe(
          map(([aMelding, bMelding]) => {
            return {
              statsDifferences: statsDiff,
              materiasDifferences: materiasDiff,
              piecesDiff: piecesDiff,
              meldingChances: {
                a: aMelding,
                b: bMelding
              }
            };
          })
        );

      })
    );
  }


  @Memoized()
  private getSlotName(propertyName: keyof TeamcraftGearset): string {
    switch (propertyName) {
      case 'chest':
        return 'Body';
      case 'earRings':
        return 'Ears';
      case 'feet':
        return 'Feet';
      case 'ring1':
        return 'FingerL';
      case 'ring2':
        return 'FingerR';
      case 'gloves':
        return 'Gloves';
      case 'head':
        return 'Head';
      case 'legs':
        return 'Legs';
      case 'mainHand':
        return 'MainHand';
      case 'necklace':
        return 'Neck';
      case 'offHand':
        return 'OffHand';
      case 'crystal':
        return 'SoulCrystal';
      case 'belt':
        return 'Waist';
      case 'bracelet':
        return 'Wrists';
    }
  }

  private getAvgMeldingChances(set: TeamcraftGearset): Observable<number> {
    return safeCombineLatest(this.toArray(set).map(piece => {
      return safeCombineLatest(piece.materias.filter(m => m > 0).map((m, i) => this.materiaService.getMeldingChances(piece, m, i)));
    })).pipe(
      map(chances => {
        const avgMeldingChances = chances.reduce((acc, array) => {
          acc.total += array.reduce((macc, materiaChances) => {
            return macc + materiaChances;
          }, 0);
          acc.materias += array.length;
          return acc;
        }, { total: 0, materias: 0 });
        return avgMeldingChances.total / avgMeldingChances.materias;
      })
    );

  }
}
