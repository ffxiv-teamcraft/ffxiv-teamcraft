import { Injectable } from '@angular/core';
import { BaseParam } from './base-param';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { MateriaService } from './materia.service';
import { EnvironmentService } from '../../core/environment.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  // Source: https://github.com/SapphireServer/Sapphire/blob/51d29df7ace88feaef1ef329ad3185ed4a5b4384/src/world/Math/CalcStats.cpp
  private static LEVEL_TABLE: number[][] = [
    // MAIN,SUB,DIV,HP,ELMT,THREAT
    [1, 1, 1, 1, 1, 1],
    [20, 56, 56, 0, 52, 2],
    [21, 57, 57, 0, 54, 2],
    [22, 60, 60, 0, 56, 3],
    [24, 62, 62, 0, 58, 3],
    [26, 65, 65, 0, 60, 3],
    [27, 68, 68, 0, 62, 3],
    [29, 70, 70, 0, 64, 4],
    [31, 73, 73, 0, 66, 4],
    [33, 76, 76, 0, 68, 4],
    [35, 78, 78, 0, 70, 5],
    [36, 82, 82, 0, 73, 5],
    [38, 85, 85, 0, 75, 5],
    [41, 89, 89, 0, 78, 6],
    [44, 93, 93, 0, 81, 6],
    [46, 96, 96, 0, 84, 7],
    [49, 100, 100, 0, 86, 7],
    [52, 104, 104, 0, 89, 8],
    [54, 109, 109, 0, 93, 9],
    [57, 113, 113, 0, 95, 9],
    [60, 116, 116, 0, 98, 10],
    [63, 122, 122, 0, 102, 10],
    [67, 127, 127, 0, 105, 11],
    [71, 133, 133, 0, 109, 12],
    [74, 138, 138, 0, 113, 13],
    [78, 144, 144, 0, 117, 14],
    [81, 150, 150, 0, 121, 15],
    [85, 155, 155, 0, 125, 16],
    [89, 162, 162, 0, 129, 17],
    [92, 168, 168, 0, 133, 18],
    [97, 173, 173, 0, 137, 19],
    [101, 181, 181, 0, 143, 20],
    [106, 188, 188, 0, 148, 22],
    [110, 194, 194, 0, 153, 23],
    [115, 202, 202, 0, 159, 25],
    [119, 209, 209, 0, 165, 27],
    [124, 215, 215, 0, 170, 29],
    [128, 223, 223, 0, 176, 31],
    [134, 229, 229, 0, 181, 33],
    [139, 236, 236, 0, 186, 35],
    [144, 244, 244, 0, 192, 38],
    [150, 253, 253, 0, 200, 40],
    [155, 263, 263, 0, 207, 43],
    [161, 272, 272, 0, 215, 46],
    [166, 283, 283, 0, 223, 49],
    [171, 292, 292, 0, 231, 52],
    [177, 302, 302, 0, 238, 55],
    [183, 311, 311, 0, 246, 58],
    [189, 322, 322, 0, 254, 62],
    [196, 331, 331, 0, 261, 66],
    [202, 341, 341, 1700, 269, 70],
    [204, 342, 393, 1774, 270, 84],
    [205, 344, 444, 1851, 271, 99],
    [207, 345, 496, 1931, 273, 113],
    [209, 346, 548, 2015, 274, 128],
    [210, 347, 600, 2102, 275, 142],
    [212, 349, 651, 2194, 276, 157],
    [214, 350, 703, 2289, 278, 171],
    [215, 351, 755, 2388, 279, 186],
    [217, 352, 806, 2492, 280, 200],
    [218, 354, 858, 2600, 282, 215],
    [224, 355, 941, 2700, 283, 232],
    [228, 356, 1032, 2800, 284, 250],
    [236, 357, 1133, 2900, 286, 269],
    [244, 358, 1243, 3000, 287, 290],
    [252, 359, 1364, 3100, 288, 313],
    [260, 360, 1497, 3200, 290, 337],
    [268, 361, 1643, 3300, 292, 363],
    [276, 362, 1802, 3400, 293, 392],
    [284, 363, 1978, 3500, 294, 422],
    [292, 364, 2170, 3600, 295, 455],
    [296, 365, 2263, 3600, 466, 466],
    [300, 366, 2360, 3600, 295, 466],
    [305, 367, 2461, 3600, 295, 466],
    [310, 368, 2566, 3600, 295, 466],
    [315, 370, 2676, 3600, 295, 466],
    [320, 372, 2790, 3600, 295, 466],
    [325, 374, 2910, 3600, 295, 466],
    [330, 376, 3034, 3600, 295, 466],
    [335, 378, 3164, 3600, 295, 466],
    [340, 380, 3300, 3600, 569, 569]
  ];

  private static SUB_STATS: BaseParam[] = [
    BaseParam.CRITICAL_HIT,
    BaseParam.DIRECT_HIT_RATE,
    BaseParam.SKILL_SPEED,
    BaseParam.SPELL_SPEED,
    BaseParam.TENACITY
  ];

  private static MAIN_STATS: BaseParam[] = [
    BaseParam.DETERMINATION,
    BaseParam.PIETY,
    BaseParam.VITALITY,
    BaseParam.STRENGTH,
    BaseParam.DEXTERITY,
    BaseParam.INTELLIGENCE,
    BaseParam.MIND
  ];

  constructor(private lazyData: LazyDataService, private materiasService: MateriaService,
              private env: EnvironmentService) {
  }

  public getMaxValuesTable(job: number, equipmentPiece: EquipmentPiece): number[][] {
    return this.getRelevantBaseStats(job)
      .map(baseParamId => {
        return [
          baseParamId,
          this.materiasService.getTotalStat(this.getStartingValue(equipmentPiece, baseParamId), equipmentPiece, baseParamId),
          this.materiasService.getItemCapForStat(equipmentPiece.itemId, baseParamId),
          this.getStartingValue(equipmentPiece, baseParamId)
        ];
      });
  }

  public getStartingValue(equipmentPiece: EquipmentPiece, baseParamId: number): number {
    const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId] || [];
    const matchingStat: any = itemStats.find((stat: any) => stat.ID === baseParamId);
    if (matchingStat) {
      if (equipmentPiece.hq) {
        return matchingStat.HQ;
      } else {
        return matchingStat.NQ;
      }
    }
    return 0;
  }

  public getStats(set: TeamcraftGearset, level: number, tribe: number, food?: any): { id: number, value: number }[] {
    const stats = this.getRelevantBaseStats(set.job)
      .map(stat => {
        return {
          id: stat,
          value: this.getBaseValue(stat, set.job, level, tribe)
        };
      });
    const possibleSetBonuses = [];
    Object.values(set)
      .filter(value => value && value.itemId !== undefined)
      .forEach((equipmentPiece: EquipmentPiece) => {
        const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId] || [];
        const itemSetBonuses = this.lazyData.data.itemSetBonuses[equipmentPiece.itemId];
        if (itemSetBonuses) {
          possibleSetBonuses.push(itemSetBonuses);
        }
        // If this item has no stats, return !
        if (!itemStats) {
          return;
        }
        itemStats
          .filter((stat: any) => stat.ID !== undefined)
          .forEach((stat: any) => {
            let statsRow = stats.find(s => s.id === stat.ID);
            if (statsRow === undefined) {
              stats.push({
                id: stat.ID,
                value: this.getBaseValue(stat.ID, set.job, level, tribe)
              });
              statsRow = stats[stats.length - 1];
            }
            if (equipmentPiece.hq) {
              statsRow.value += stat.HQ;
            } else {
              statsRow.value += stat.NQ;
            }
          });
        equipmentPiece.materias
          .filter(materia => materia > 0 && this.materiasService.getMateria(materia) !== undefined)
          .forEach((materiaId, index) => {
            const bonus = this.materiasService.getMateriaBonus(equipmentPiece, materiaId, index);
            const materia = this.materiasService.getMateria(materiaId);
            let statsRow = stats.find(s => s.id === materia.baseParamId);
            if (statsRow === undefined) {
              stats.push({
                id: materia.baseParamId,
                value: this.getBaseValue(materia.baseParamId, set.job, level, tribe)
              });
              statsRow = stats[stats.length - 1];
            }
            statsRow.value += bonus.value;
          });
      });
    if (food) {
      Object.values<any>(food.Bonuses).forEach(bonus => {
        let bonusValue: number;
        const stat = stats.find(s => s.id === bonus.ID);
        if (bonus.Relative) {
          const baseValue = stat ? stat.value : 0;
          const multiplier = (food.HQ ? bonus.ValueHQ : bonus.Value) / 100;
          const max = food.HQ ? bonus.MaxHQ : bonus.Max;
          bonusValue = Math.min(Math.floor(baseValue * multiplier), max);
        } else {
          bonusValue = food.HQ ? bonus.ValueHQ : bonus.Value;
        }
        if (stat) {
          stat.value += bonusValue;
        }
      });
    }

    // Process set bonuses
    possibleSetBonuses.forEach(possibleSetBonus => {
      const sameSetPieces = possibleSetBonuses.filter(b => b.itemSeriesId === possibleSetBonus.itemSeriesId).length;
      possibleSetBonus.bonuses.forEach(bonus => {
        if (sameSetPieces >= bonus.amountRequired) {
          let statsRow = stats.find(s => s.id === bonus.baseParam);
          if (statsRow === undefined) {
            stats.push({
              id: bonus.baseParam,
              value: this.getBaseValue(bonus.baseParamId, set.job, level, tribe)
            });
            statsRow = stats[stats.length - 1];
          }
          statsRow.value += bonus.value;
        }
      });
    });

    if (set.job >= 8 && set.job <= 18) {
      // Nobody cares about vitality for DoH/W and it lets us have more space if we take it out
      return stats.filter(s => s.id !== BaseParam.VITALITY);
    }
    return stats;
  }

  private getNextBreakpoint(displayName: string, level: number, job: number, stats: { id: number, value: number }[]): number {
    const baseValue = this.getStatValue(displayName, level, job, stats);
    let currentValue = 0;
    let currentBonus = 0;
    while (Math.abs(currentBonus) < 100 && currentValue <= baseValue) {
      currentBonus++;
      currentValue = this.getStatValue(displayName, level, job, stats, currentBonus);
    }
    return currentBonus;
  }


  private getPreviousBreakpoint(displayName: string, level: number, job: number, stats: { id: number, value: number }[]): number {
    const baseValue = this.getStatValue(displayName, level, job, stats);
    let currentValue = Infinity;
    let currentBonus = 0;
    while (Math.abs(currentBonus) < 500 && currentValue >= baseValue) {
      currentBonus--;
      currentValue = this.getStatValue(displayName, level, job, stats, currentBonus);
    }
    return currentBonus;
  }

  public getBaseValue(baseParamId: number, job: number, level: number, tribe: number) {
    if (StatsService.MAIN_STATS.indexOf(baseParamId) > -1) {
      return Math.floor(StatsService.LEVEL_TABLE[level][0] * this.getModifier(baseParamId, job))
        + this.getTribeBonus(baseParamId, tribe)
        + (this.getMainStat(job) === baseParamId ? this.getMainStatBonus(level) : 0);
    }
    if (StatsService.SUB_STATS.indexOf(baseParamId) > -1) {
      return Math.floor(StatsService.LEVEL_TABLE[level][1] * this.getModifier(baseParamId, job))
        + this.getTribeBonus(baseParamId, tribe)
        + (this.getMainStat(job) === baseParamId ? this.getMainStatBonus(level) : 0);
    }
    if (baseParamId === BaseParam.CP) {
      return 180;
    }
    if (baseParamId === BaseParam.GP) {
      return 400;
    }
    return 0;
  }

  private getModifier(baseParamId: number, job: number): number {
    switch (baseParamId) {
      case BaseParam.DEXTERITY:
        return this.lazyData.data.classJobsModifiers[job].ModifierDexterity / 100;
      case BaseParam.HP:
        return this.lazyData.data.classJobsModifiers[job].ModifierHitPoints / 100;
      case BaseParam.INTELLIGENCE:
        return this.lazyData.data.classJobsModifiers[job].ModifierIntelligence / 100;
      case BaseParam.MP:
        return this.lazyData.data.classJobsModifiers[job].ModifierManaPoints / 100;
      case BaseParam.MIND:
        return this.lazyData.data.classJobsModifiers[job].ModifierMind / 100;
      case BaseParam.PIETY:
        return this.lazyData.data.classJobsModifiers[job].ModifierPiety / 100;
      case BaseParam.STRENGTH:
        return this.lazyData.data.classJobsModifiers[job].ModifierStrength / 100;
      case BaseParam.VITALITY:
        return this.lazyData.data.classJobsModifiers[job].ModifierVitality / 100;
      default:
        return 1;
    }
  }

  public getRelevantBaseStats(job: number): number[] {
    switch (job) {
      // DoH
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        return [BaseParam.CRAFTSMANSHIP, BaseParam.CONTROL, BaseParam.CP];
      // DoL
      case 16:
      case 17:
      case 18:
        return [BaseParam.GATHERING, BaseParam.PERCEPTION, BaseParam.GP];
      // Tanks
      case 1:
      case 3:
      case 19:
      case 21:
      case 32:
      case 37:
        return [BaseParam.STRENGTH, BaseParam.DIRECT_HIT_RATE, BaseParam.CRITICAL_HIT, BaseParam.DETERMINATION, BaseParam.SKILL_SPEED, BaseParam.VITALITY, BaseParam.TENACITY];
      // STR-based DPS
      case 2:
      case 4:
      case 20:
      case 22:
      case 34:
        return [BaseParam.STRENGTH, BaseParam.DIRECT_HIT_RATE, BaseParam.CRITICAL_HIT, BaseParam.DETERMINATION, BaseParam.SKILL_SPEED, BaseParam.VITALITY];
      // DEX-based DPS
      case 5:
      case 23:
      case 29:
      case 30:
      case 31:
      case 38:
        return [BaseParam.DEXTERITY, BaseParam.DIRECT_HIT_RATE, BaseParam.CRITICAL_HIT, BaseParam.DETERMINATION, BaseParam.SKILL_SPEED, BaseParam.VITALITY];
      // Healers
      case 6:
      case 24:
      case 28:
      case 33:
        return [BaseParam.MIND, BaseParam.DIRECT_HIT_RATE, BaseParam.CRITICAL_HIT, BaseParam.DETERMINATION, BaseParam.SPELL_SPEED, BaseParam.PIETY, BaseParam.VITALITY];
      // Caster DPS
      case 7:
      case 25:
      case 26:
      case 27:
      case 35:
      case 36:
        return [BaseParam.INTELLIGENCE, BaseParam.DIRECT_HIT_RATE, BaseParam.CRITICAL_HIT, BaseParam.DETERMINATION, BaseParam.SPELL_SPEED, BaseParam.PIETY, BaseParam.VITALITY];
    }
    return [];
  }

  public getMainStat(job: number): BaseParam {
    switch (job) {
      // DoH
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        return BaseParam.CRAFTSMANSHIP;
      // DoL
      case 16:
      case 17:
      case 18:
        return BaseParam.GATHERING;
      // Tanks
      case 1:
      case 3:
      case 19:
      case 21:
      case 32:
      case 37:
        return BaseParam.VITALITY;
      // STR-based DPS
      case 2:
      case 4:
      case 20:
      case 22:
      case 34:
        return BaseParam.STRENGTH;
      // DEX-based DPS
      case 5:
      case 23:
      case 29:
      case 30:
      case 31:
      case 38:
        return BaseParam.DEXTERITY;
      // Healers
      case 6:
      case 24:
      case 28:
      case 33:
        return BaseParam.MIND;
      // Caster DPS
      case 7:
      case 25:
      case 26:
      case 27:
      case 35:
      case 36:
        return BaseParam.INTELLIGENCE;
    }
    return 0;
  }

  private getMainStatBonus(level: number): number {
    if (level >= 70) {
      return 48;
    }
    if (level >= 60) {
      // Probably not accurate, seems like it's one value per extension
      return 48;
    }
    if (level >= 50) {
      // Probably not accurate, seems like it's one value per extension
      return 48;
    }
    // Probably not accurate, seems like it's one value per extension
    return 8;
  }

  private getTribeBonus(baseParamId: number, tribe: number): number {
    const abbr = this.getStatAbbr(baseParamId);
    if (abbr === null) {
      return 0;
    }
    return +this.lazyData.data.tribes[tribe][abbr];
  }

  private getStatAbbr(baseParamId: number): string | null {
    switch (baseParamId) {
      case BaseParam.HP:
        return 'Hp';
      case BaseParam.INTELLIGENCE:
        return 'INT';
      case BaseParam.MIND:
        return 'MND';
      case BaseParam.MP:
        return 'Mp';
      case BaseParam.PIETY:
        return 'PIE';
      case BaseParam.STRENGTH:
        return 'STR';
      case BaseParam.VITALITY:
        return 'VIT';
      case BaseParam.DEXTERITY:
        return 'DEX';
    }
    return null;
  }

  public getStatsDisplay(set: TeamcraftGearset, level: number, tribe: number, food?: any): { baseParamIds: number[], name: string, value: number, next?: number, previous?: number, suffix?: string }[] {
    const display: { baseParamIds: number[], name: string, value: number, next?: number, previous?: number, suffix?: string }[] = [
      {
        baseParamIds: [0],
        name: 'Ilvl',
        value: this.getAvgIlvl(set)
      }
    ];

    if (set.isCombatSet()) {
      const stats = this.getStats(set, level, tribe, food);
      display.push(...[
        {
          baseParamIds: [BaseParam.VITALITY],
          name: 'HP',
          value: this.getStatValue('HP', level, set.job, stats),
          next: this.getNextBreakpoint('HP', level, set.job, stats),
          previous: this.getPreviousBreakpoint('HP', level, set.job, stats)
        },
        {
          baseParamIds: [BaseParam.DIRECT_HIT_RATE],
          name: 'Direct_hit_chances',
          value: this.getStatValue('Direct_hit_chances', level, set.job, stats),
          next: this.getNextBreakpoint('Direct_hit_chances', level, set.job, stats),
          previous: this.getPreviousBreakpoint('Direct_hit_chances', level, set.job, stats),
          suffix: '%'
        },
        {
          baseParamIds: [BaseParam.CRITICAL_HIT],
          name: 'Critical_hit_chances',
          value: this.getStatValue('Critical_hit_chances', level, set.job, stats),
          next: this.getNextBreakpoint('Critical_hit_chances', level, set.job, stats),
          previous: this.getPreviousBreakpoint('Critical_hit_chances', level, set.job, stats),
          suffix: '%'
        },
        {
          baseParamIds: [BaseParam.CRITICAL_HIT],
          name: 'Critical_hit_multiplier',
          value: this.getStatValue('Critical_hit_multiplier', level, set.job, stats),
          next: this.getNextBreakpoint('Critical_hit_multiplier', level, set.job, stats),
          previous: this.getPreviousBreakpoint('Critical_hit_multiplier', level, set.job, stats),
          suffix: '%'
        },
        {
          baseParamIds: [BaseParam.DETERMINATION],
          name: 'Determination_bonus',
          value: this.getStatValue('Determination_bonus', level, set.job, stats),
          next: this.getNextBreakpoint('Determination_bonus', level, set.job, stats),
          previous: this.getPreviousBreakpoint('Determination_bonus', level, set.job, stats),
          suffix: '%'
        },
        {
          baseParamIds: [BaseParam.SKILL_SPEED, BaseParam.SPELL_SPEED],
          name: 'GCD',
          value: this.getStatValue('GCD', level, set.job, stats),
          next: this.getNextBreakpoint('GCD', level, set.job, stats),
          previous: this.getPreviousBreakpoint('GCD', level, set.job, stats),
          suffix: 's'
        }
      ]);
    }
    return display;
  }

  /**
   * Stats computing methods here, source: http://allaganstudies.akhmorning.com/guide/parameters/
   */

  public getAvgIlvl(set: TeamcraftGearset): number {
    const withoutOffHand = ['mainHand', 'head', 'earRings', 'chest', 'necklace', 'gloves', 'bracelet', 'belt', 'ring1', 'legs', 'ring2', 'feet']
      .filter(key => set[key])
      .reduce((acc, row) => {
        return acc + this.lazyData.data.ilvls[set[row].itemId];
      }, 0);

    if (set.offHand) {
      return Math.floor((withoutOffHand + this.lazyData.data.ilvls[set.offHand.itemId]) / 13);
    }
    return Math.floor(withoutOffHand / 12);
  }

  private getStatValue(displayName: string, level: number, job: number, stats: { id: number, value: number }[], statBonus = 0): number {
    switch (displayName) {
      case 'HP':
        return this.getMaxHp(job, level, stats.find(stat => stat.id === BaseParam.VITALITY).value + statBonus);
      case 'Direct_hit_chances':
        return Math.floor(this.getDirectHitChances(level, stats.find(stat => stat.id === BaseParam.DIRECT_HIT_RATE).value + statBonus)) / 10;
      case 'Critical_hit_chances':
        return Math.floor(this.getCriticalHitChances(level, stats.find(stat => stat.id === BaseParam.CRITICAL_HIT).value + statBonus)) / 10;
      case 'Critical_hit_multiplier':
        return Math.floor(this.getCriticalMultiplier(level, stats.find(stat => stat.id === BaseParam.CRITICAL_HIT).value + statBonus)) / 10;
      case 'Determination_bonus':
        return Math.floor(this.getDeterminationBonus(level, stats.find(stat => stat.id === BaseParam.DETERMINATION).value + statBonus)) / 10;
      case 'GCD':
        return Math.floor(this.getGCD(level, stats.find(stat => stat.id === BaseParam.SKILL_SPEED || stat.id === BaseParam.SPELL_SPEED).value + statBonus)) / 1000;
      default:
        return 0;
    }
  }

  private getMaxHp(job: number, level: number, vitality: number): number {
    if (level > this.env.maxLevel) {
      return 0;
    }
    const levelModHP = StatsService.LEVEL_TABLE[level][3];
    const levelModMain = StatsService.LEVEL_TABLE[level][0];
    const jobMod = this.lazyData.data.classJobsModifiers[job].ModifierHitPoints;
    return Math.floor(levelModHP * (jobMod / 100)) + Math.floor((vitality - levelModMain) * 20.5);
  }

  private getDirectHitChances(level: number, directHit: number): number {
    const levelModSub = StatsService.LEVEL_TABLE[level][1];
    const levelModDiv = StatsService.LEVEL_TABLE[level][2];
    return 550 * (directHit - levelModSub) / levelModDiv;
  }

  private getCriticalHitChances(level: number, critical: number): number {
    const levelModSub = StatsService.LEVEL_TABLE[level][1];
    const levelModDiv = StatsService.LEVEL_TABLE[level][2];
    return 200 * (critical - levelModSub) / levelModDiv + 50;
  }

  private getGCD(level: number, speed: number): number {
    const levelModSub = StatsService.LEVEL_TABLE[level][1];
    const levelModDiv = StatsService.LEVEL_TABLE[level][2];
    return (1000 - Math.floor(130 * (speed - levelModSub) / levelModDiv)) * 2.5;
  }

  private getCriticalMultiplier(level: number, critical: number): number {
    const levelModSub = StatsService.LEVEL_TABLE[level][1];
    const levelModDiv = StatsService.LEVEL_TABLE[level][2];
    return 200 * (critical - levelModSub) / levelModDiv + 1400;
  }

  private getDeterminationBonus(level: number, determination: number): number {
    const levelModMain = StatsService.LEVEL_TABLE[level][0];
    const levelModDiv = StatsService.LEVEL_TABLE[level][2];
    return 130 * (determination - levelModMain) / levelModDiv + 1000;
  }
}
