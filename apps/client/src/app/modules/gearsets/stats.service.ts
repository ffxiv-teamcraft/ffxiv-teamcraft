import { Injectable } from '@angular/core';
import { BaseParam } from './base-param';
import { EquipmentPiece } from '../../model/gearset/equipment-piece';
import { TeamcraftGearset } from '../../model/gearset/teamcraft-gearset';
import { MateriaService } from './materia.service';
import { EnvironmentService } from '../../core/environment.service';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { expand, last, map, shareReplay, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from '../../core/rxjs/safe-combine-latest';
import { LazyItemStat } from '../../lazy-data/model/lazy-item-stat';
import { LazyItemSetBonus } from '../../lazy-data/model/lazy-item-set-bonus';
import { LazyMateria } from '../../lazy-data/model/lazy-materia';
import { Memoized } from '../../core/decorators/memoized';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  // Source: https://github.com/SapphireServer/Sapphire/blob/51d29df7ace88feaef1ef329ad3185ed4a5b4384/src/world/Math/CalcStats.cpp
  private static LEVEL_TABLE: number[][] = [
    // MAIN,SUB,DIV,HP,ELMT,THREAT
    [1, 1, 1, 1, 1, 1],
    [20, 56, 56, 0, 52, 2],
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
    [204, 342, 393, 1700, 270, 84],
    [205, 344, 444, 1700, 271, 99],
    [207, 345, 496, 1700, 273, 113],
    [209, 346, 548, 1700, 274, 128],
    [210, 347, 600, 1700, 275, 142],
    [212, 349, 651, 1700, 276, 157],
    [214, 350, 703, 1700, 278, 171],
    [215, 351, 755, 1700, 279, 186],
    [217, 352, 806, 1700, 280, 200],
    [218, 354, 858, 1700, 282, 215],
    [224, 355, 941, 1700, 283, 232],
    [228, 356, 1032, 1700, 284, 250],
    [236, 357, 1133, 1700, 286, 269],
    [244, 358, 1243, 1700, 287, 290],
    [252, 359, 1364, 1700, 288, 313],
    [260, 360, 1497, 1700, 290, 337],
    [268, 361, 1643, 1700, 292, 363],
    [276, 362, 1802, 1700, 293, 392],
    [284, 363, 1978, 1700, 294, 422],
    [292, 364, 2170, 1700, 295, 455],
    [296, 365, 2263, 1730, 466, 466],
    [300, 366, 2360, 1760, 295, 466],
    [305, 367, 2461, 1790, 295, 466],
    [310, 368, 2566, 1810, 295, 466],
    [315, 370, 2676, 1840, 295, 466],
    [320, 372, 2790, 1870, 295, 466],
    [325, 374, 2910, 1900, 295, 466],
    [330, 376, 3034, 1930, 295, 466],
    [340, 380, 3164, 2000, 295, 466],
    // Placeholder values for 6.0
    [345, 382, 1900, 2100, 569, 569],
    [350, 384, 1900, 2200, 569, 569],
    [355, 386, 1900, 2300, 569, 569],
    [360, 388, 1900, 2400, 569, 569],
    [365, 390, 1900, 2500, 569, 569],
    [370, 392, 1900, 2600, 569, 569],
    [375, 394, 1900, 2700, 569, 569],
    [380, 396, 1900, 2800, 569, 569],
    [385, 398, 1900, 2900, 569, 569],
    [390, 400, 1900, 3000, 569, 569]
    // MAIN,SUB,DIV,HP,ELMT,THREAT
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

  constructor(private lazyData: LazyDataFacade, private materiasService: MateriaService,
              private env: EnvironmentService) {
  }

  public getMaxValuesTable(job: number, equipmentPiece: EquipmentPiece): Observable<number[][]> {
    return combineLatest(this.getRelevantBaseStats(job)
      .map(baseParamId => {
        return this.getStartingValue(equipmentPiece, baseParamId).pipe(
          switchMap(startingValue => {
            return combineLatest([
              of(baseParamId),
              this.materiasService.getTotalStat(startingValue, equipmentPiece, baseParamId),
              this.materiasService.getItemCapForStat(equipmentPiece.itemId, baseParamId),
              of(startingValue)
            ]);
          })
        );
      })
    );
  }

  public getStartingValue(equipmentPiece: EquipmentPiece, baseParamId: number): Observable<number> {
    return this.lazyData.getRow('itemStats', equipmentPiece.itemId, []).pipe(
      map(itemStats => {
        const matchingStat: any = itemStats.find((stat: any) => stat.ID === baseParamId);
        if (matchingStat) {
          if (equipmentPiece.hq) {
            return matchingStat.HQ;
          } else {
            return matchingStat.NQ;
          }
        }
        return 0;
      })
    );
  }

  public getStats(set: TeamcraftGearset, level: number, tribe: number, food?: any): Observable<{ id: number, value: number }[]> {
    return safeCombineLatest(this.getRelevantBaseStats(set.job).map(stat => {
      return this.getBaseValue(stat, set.job, level, tribe).pipe(
        map(value => {
          return { id: stat, value };
        })
      );
    })).pipe(
      switchMap(statsSeed => {
        return safeCombineLatest(
          Object.keys(set)
            .filter(key => this.env.gameVersion < 6 || key !== 'belt')
            .map(key => set[key])
            .filter(value => value && value.itemId !== undefined)
            .map((value: EquipmentPiece) => {
              return combineLatest([this.lazyData.getRow('itemStats', value.itemId, []), this.lazyData.getRow('itemSetBonuses', value.itemId, null)]).pipe(
                map(([itemStats, bonuses]) => [value, itemStats, bonuses])
              );
            })
        ).pipe(
          switchMap((pieces: Array<[EquipmentPiece, LazyItemStat[], LazyItemSetBonus]>) => {
            return safeCombineLatest(pieces.map(([piece, ...rest]) => {
              return safeCombineLatest(
                piece.materias
                  .filter(materia => materia > 0)
                  .map((materia, index) => {
                    return combineLatest([this.materiasService.getMateria(materia), this.materiasService.getMateriaBonus(piece, materia, index)]);
                  })
              ).pipe(
                map(materias => {
                  return [piece, materias, ...rest];
                })
              );
            }));
          }),
          switchMap((pieces: Array<[EquipmentPiece, [LazyMateria, { overcapped: boolean, value: number }][], LazyItemStat[], LazyItemSetBonus]>) => {
            const statsToCompute: Record<number, Observable<number>> = {};
            pieces.forEach(([equipmentPiece, materias, itemStats, itemSetBonuses]) => {
              itemStats
                .filter((stat) => stat.ID !== undefined)
                .forEach(stat => {
                  if (!statsToCompute[stat.ID]) {
                    statsToCompute[stat.ID] = this.getBaseValue(stat.ID, set.job, level, tribe);
                  }
                });
              materias.filter(materia => materia).forEach(([materia, bonus]) => {
                if (!statsToCompute[materia.baseParamId]) {
                  statsToCompute[materia.baseParamId] = this.getBaseValue(materia.baseParamId, set.job, level, tribe);
                }
              });

              if (itemSetBonuses) {
                itemSetBonuses.bonuses.filter(bonus => bonus).forEach((bonus) => {
                  if (!statsToCompute[bonus.baseParam]) {
                    statsToCompute[bonus.baseParam] = this.getBaseValue(bonus.baseParam, set.job, level, tribe);
                  }
                });
              }
            });

            return safeCombineLatest(Object.entries(statsToCompute).map(([key, observable]) => {
              return observable.pipe(
                map(value => [key, value])
              );
            })).pipe(
              map(res => {
                const baseValues = res.reduce((acc, [key, value]) => {
                  return {
                    ...acc,
                    [key]: value
                  };
                }, {});
                return {
                  pieces,
                  baseValues
                };
              })
            );
          }),
          map(({ pieces, baseValues }) => {
            return pieces.reduce((acc, [equipmentPiece, materias, itemStats, itemSetBonuses]) => {
              if (itemSetBonuses) {
                acc.possibleSetBonuses.push(itemSetBonuses);
              }
              if (!itemStats) {
                return acc;
              }
              itemStats
                .filter((stat) => stat.ID !== undefined)
                .forEach((stat) => {
                  let statsRow = acc.stats.find(s => s.id === stat.ID);
                  if (statsRow === undefined) {
                    acc.stats.push({
                      id: stat.ID,
                      value: baseValues[stat.ID]
                    });
                    statsRow = acc.stats[acc.stats.length - 1];
                  }
                  if (equipmentPiece.hq) {
                    statsRow.value += stat.HQ;
                  } else {
                    statsRow.value += stat.NQ;
                  }
                });
              materias.forEach(([materia, bonus]) => {
                let statsRow = acc.stats.find(s => s.id === materia.baseParamId);
                if (statsRow === undefined) {
                  acc.stats.push({
                    id: materia.baseParamId,
                    value: baseValues[materia.baseParamId]
                  });
                  statsRow = acc.stats[acc.stats.length - 1];
                }
                statsRow.value += bonus.value;
              });
              return acc;
            }, {
              possibleSetBonuses: [],
              stats: statsSeed,
              baseValues
            });
          }),
          map(acc => {
            const stats = acc.stats;
            const baseValues = acc.baseValues;
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
            acc.possibleSetBonuses.forEach(possibleSetBonus => {
              const sameSetPieces = acc.possibleSetBonuses.filter(b => b.itemSeriesId === possibleSetBonus.itemSeriesId).length;
              possibleSetBonus.bonuses.forEach(bonus => {
                if (sameSetPieces >= bonus.amountRequired) {
                  let statsRow = stats.find(s => s.id === bonus.baseParam);
                  if (statsRow === undefined) {
                    stats.push({
                      id: bonus.baseParam,
                      value: baseValues[bonus.baseParamId]
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
          })
        );
      })
    );
  }

  @Memoized()
  public getBaseValue(baseParamId: number, job: number, level: number, tribe: number): Observable<number> {
    if (baseParamId === BaseParam.CP) {
      return of(180);
    }
    if (baseParamId === BaseParam.GP) {
      return of(400);
    }
    return combineLatest([
      this.getModifier(baseParamId, job),
      this.getTribeBonus(baseParamId, tribe)
    ]).pipe(
      map(([modifier, tribeBonus]) => {
        if (StatsService.MAIN_STATS.indexOf(baseParamId) > -1) {
          return Math.floor(StatsService.LEVEL_TABLE[level][0] * modifier)
            + tribeBonus;
        }
        if (StatsService.SUB_STATS.indexOf(baseParamId) > -1) {
          return Math.floor(StatsService.LEVEL_TABLE[level][1] * modifier)
            + tribeBonus;
        }
        return 0;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

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
      case 39:
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
      case 40:
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
      case 39:
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
      case 40:
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

  public getStatsDisplay(set: TeamcraftGearset, level: number, tribe: number, food?: any): Observable<{ baseParamIds: number[], name: string, value: number, next?: number, previous?: number, suffix?: string }[]> {
    return this.getAvgIlvl(set).pipe(
      switchMap(avgIlvl => {
        const display: { baseParamIds: number[], name: string, value: number, next?: number, previous?: number, suffix?: string }[] = [
          {
            baseParamIds: [0],
            name: 'Ilvl',
            value: avgIlvl
          }
        ];

        if (set.isCombatSet()) {
          return this.getStats(set, level, tribe, food).pipe(
            switchMap(stats => {
              return combineLatest([
                {
                  baseParamIds: [BaseParam.VITALITY],
                  name: 'HP'
                },
                {
                  baseParamIds: [BaseParam.DIRECT_HIT_RATE],
                  name: 'Direct_hit_chances',
                  suffix: '%'
                },
                {
                  baseParamIds: [BaseParam.CRITICAL_HIT],
                  name: 'Critical_hit_chances',
                  suffix: '%'
                },
                {
                  baseParamIds: [BaseParam.CRITICAL_HIT],
                  name: 'Critical_hit_multiplier',
                  suffix: '%'
                },
                {
                  baseParamIds: [BaseParam.DETERMINATION],
                  name: 'Determination_bonus',
                  suffix: '%'
                },
                {
                  baseParamIds: [BaseParam.SKILL_SPEED, BaseParam.SPELL_SPEED],
                  name: 'GCD',
                  suffix: 's'
                }
              ].map(stat => {
                return combineLatest([
                  this.getStatValue(stat.name, level, set.job, stats),
                  this.getNextBreakpoint(stat.name, level, set.job, stats),
                  this.getPreviousBreakpoint(stat.name, level, set.job, stats)
                ]).pipe(
                  map(([value, next, previous]) => {
                    return {
                      ...stat,
                      value,
                      next,
                      previous
                    };
                  })
                );
              })).pipe(
                map(statsDisplay => {
                  return [
                    ...display,
                    ...statsDisplay
                  ];
                })
              );
            })
          );
        }
        return of(display);
      })
    );
  }

  /**
   * Stats computing methods here, source: http://allaganstudies.akhmorning.com/guide/parameters/
   */

  public getAvgIlvl(set: TeamcraftGearset): Observable<number> {
    return this.lazyData.getEntry('ilvls').pipe(
      map(ilvls => {
        const withoutOffHand = ['mainHand', 'head', 'earRings', 'chest', 'necklace', 'gloves', 'bracelet', 'belt', 'ring1', 'legs', 'ring2', 'feet']
          .filter(key => set[key])
          .reduce((acc, row) => {
            return acc + ilvls[set[row].itemId];
          }, 0);

        if (set.offHand) {
          return Math.floor((withoutOffHand + ilvls[set.offHand.itemId]) / 12);
        }
        return Math.floor(withoutOffHand / 11);
      })
    );
  }

  private getNextBreakpoint(displayName: string, level: number, job: number, stats: { id: number, value: number }[]): Observable<number> {
    return this.getStatValue(displayName, level, job, stats).pipe(
      map(baseValue => ([baseValue, 0, 0])),
      expand(([baseValue, currentValue, currentBonus]) => {
        if (Math.abs(currentBonus) < 100 && currentValue <= baseValue) {
          currentBonus++;
          return this.getStatValue(displayName, level, job, stats, currentBonus).pipe(
            map(newValue => ([baseValue, newValue, currentBonus]))
          );
        }
        return EMPTY;
      }),
      last(),
      map(([, , bonus]) => bonus)
    );
  }

  private getPreviousBreakpoint(displayName: string, level: number, job: number, stats: { id: number, value: number }[]): Observable<number> {
    return this.getStatValue(displayName, level, job, stats).pipe(
      map(baseValue => ([baseValue, Infinity, 0])),
      expand(([baseValue, currentValue, currentBonus]) => {
        if (Math.abs(currentBonus) < 100 && currentValue >= baseValue) {
          currentBonus--;
          return this.getStatValue(displayName, level, job, stats, currentBonus).pipe(
            map(newValue => ([baseValue, newValue, currentBonus]))
          );
        }
        return EMPTY;
      }),
      last(),
      map(([, , bonus]) => bonus)
    );
  }

  private getModifier(baseParamId: number, job: number): Observable<number> {
    return this.lazyData.getRow('classJobsModifiers', job).pipe(
      map(modifiers => {
        switch (baseParamId) {
          case BaseParam.DEXTERITY:
            return modifiers.ModifierDexterity / 100;
          case BaseParam.HP:
            return modifiers.ModifierHitPoints / 100;
          case BaseParam.INTELLIGENCE:
            return modifiers.ModifierIntelligence / 100;
          case BaseParam.MP:
            return modifiers.ModifierManaPoints / 100;
          case BaseParam.MIND:
            return modifiers.ModifierMind / 100;
          case BaseParam.PIETY:
            return modifiers.ModifierPiety / 100;
          case BaseParam.STRENGTH:
            return modifiers.ModifierStrength / 100;
          case BaseParam.VITALITY:
            return modifiers.ModifierVitality / 100;
          default:
            return 1;
        }
      })
    );
  }

  private getTribeBonus(baseParamId: number, tribe: number): Observable<number> {
    return this.lazyData.getRow('tribes', tribe).pipe(
      map(tribeData => {
        const abbr = this.getStatAbbr(baseParamId);
        if (abbr === null) {
          return 0;
        }
        return +tribeData[abbr];
      })
    );
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

  private getStatValue(displayName: string, level: number, job: number, stats: { id: number, value: number }[], statBonus = 0): Observable<number> {
    switch (displayName) {
      case 'HP':
        return this.getMaxHp(job, level, (stats.find(stat => stat.id === BaseParam.VITALITY)?.value || 0) + statBonus);
      case 'Direct_hit_chances':
        return of(Math.floor(this.getDirectHitChances(level, (stats.find(stat => stat.id === BaseParam.DIRECT_HIT_RATE)?.value || 0) + statBonus)) / 10);
      case 'Critical_hit_chances':
        return of(Math.floor(this.getCriticalHitChances(level, (stats.find(stat => stat.id === BaseParam.CRITICAL_HIT)?.value || 0) + statBonus)) / 10);
      case 'Critical_hit_multiplier':
        return of(Math.floor(this.getCriticalMultiplier(level, (stats.find(stat => stat.id === BaseParam.CRITICAL_HIT)?.value || 0) + statBonus)) / 10);
      case 'Determination_bonus':
        return of(Math.floor(this.getDeterminationBonus(level, (stats.find(stat => stat.id === BaseParam.DETERMINATION)?.value || 0) + statBonus)) / 10);
      case 'GCD':
        return of(Math.floor(this.getGCD(level, (stats.find(stat => stat.id === BaseParam.SKILL_SPEED || stat.id === BaseParam.SPELL_SPEED)?.value || 0) + statBonus)) / 1000);
      default:
        return of(0);
    }
  }

  private getMaxHp(job: number, level: number, vitality: number): Observable<number> {
    if (level > this.env.maxLevel) {
      return of(0);
    }
    return this.lazyData.getRow('classJobsModifiers', job).pipe(
      map(modifiers => {
        const levelModHP = StatsService.LEVEL_TABLE[level][3];
        const mainBase = StatsService.LEVEL_TABLE[level][0];
        const jobMod = modifiers.ModifierHitPoints;
        const roleMod = modifiers.Role === 1 ? 34.6 : 24.3;
        return Math.floor((levelModHP * jobMod / 100)) + Math.floor((vitality - mainBase) * roleMod);
      })
    );
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
