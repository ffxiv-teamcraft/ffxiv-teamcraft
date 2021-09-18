import { Injectable } from '@angular/core';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { GearsetsComparison } from '../../model/gearset/gearsets-comparison';
import { StatsService } from './stats.service';
import { MateriaService } from './materia.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { Memoized } from '../../core/decorators/memoized';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EnvironmentService } from '../../core/environment.service';

@Injectable({
  providedIn: 'root'
})
export class GearsetComparatorService {

  constructor(private statsService: StatsService, private materiaService: MateriaService,
              private lazyData: LazyDataService, private env: EnvironmentService) {
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

  public compare(a: TeamcraftGearset, b: TeamcraftGearset, includeAllTools: boolean): GearsetsComparison {
    const aStats = this.statsService.getStats(a, this.env.maxLevel, 1);
    const bStats = this.statsService.getStats(b, this.env.maxLevel, 1);
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

    const aMaterias = this.materiaService.getTotalNeededMaterias(a, includeAllTools);
    const bMaterias = this.materiaService.getTotalNeededMaterias(b, includeAllTools);

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

    return {
      statsDifferences: statsDiff,
      materiasDifferences: materiasDiff,
      piecesDiff: piecesDiff,
      meldingChances: {
        a: this.getAvgMeldingChances(a),
        b: this.getAvgMeldingChances(b)
      }
    };
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
