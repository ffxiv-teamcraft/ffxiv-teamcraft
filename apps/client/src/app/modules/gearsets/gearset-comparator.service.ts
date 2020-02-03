import { Injectable } from '@angular/core';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { GearsetsComparison } from '../../model/gearset/gearsets-comparison';
import { StatsService } from './stats.service';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';

@Injectable({
  providedIn: 'root'
})
export class GearsetComparatorService {

  constructor(private statsService: StatsService, private materiaService: MateriaService) {
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
    ]
      .filter(p => p);
  }

  public compare(a: TeamcraftGearset, b: TeamcraftGearset): GearsetsComparison {
    const aStats = this.statsService.getStats(a, 80, 1);
    const bStats = this.statsService.getStats(b, 80, 1);
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

    const aMaterias = this.materiaService.getTotalNeededMaterias(a);
    const bMaterias = this.materiaService.getTotalNeededMaterias(b);

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

    return {
      statsDifferences: statsDiff,
      materiasDifferences: materiasDiff,
      meldingChances: {
        a: this.getAvgMeldingChances(a),
        b: this.getAvgMeldingChances(b)
      }
    };
  }

  private getAvgMeldingChances(set: TeamcraftGearset): number {
    const array = this.toArray(set);
    const avgMeldingChances = array.reduce((acc, piece) => {
      const materias = piece.materias.filter(m => m > 0);
      acc.total += materias.reduce((macc, m, i) => {
        return macc + this.materiaService.getMeldingChances(piece, m, i);
      }, 0);
      acc.materias += materias.length;
      return acc;
    }, { total: 0, materias: 0 });
    return avgMeldingChances.total / avgMeldingChances.materias;
  }
}
