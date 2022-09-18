import { LazyData } from '../../../lazy-data/lazy-data';
import { CraftworksObject } from '../craftworks-object';
import { WorkshopPlanning } from './workshop-planning';
import { IslandWorkshopSimulator } from './island-workshop-simulator';


export class PlanningFormulaOptimizer {

  private simulator = new IslandWorkshopSimulator(this.supply, this.workshops, this.landmarks, this.workshopLevel);

  constructor(private objects: CraftworksObject[], private workshops: number, private landmarks: number, private workshopLevel: number, private supply: LazyData['islandSupply']) {
  }

  public run(): { planning: WorkshopPlanning[], score: number } {
    const objectsUsage: Record<number, number> = {};
    const planning = new Array(7).fill(null).map((_, i) => {
      const day = {
        rest: false,
        unknown: false,
        score: 0,
        groove: 0,
        planning: []
      };
      if (i <= 1) {
        // First of all, D1 and D2 are rest days to make things easier
        day.rest = true;
        return day;
      }
      // For the other days, check if there's any strong peak
      // Compute projected supply
      const projectedSupplyObjects = this.getProjectedSupplyObjects(i, objectsUsage);

      const unknownDay = projectedSupplyObjects.some(object => {
        return object.isPeaking && object.patterns.length > 1;
      });

      // If there's some unknown peaks for this day, consider it as not ready to optimize
      if (unknownDay) {
        day.unknown = true;
        return day;
      }

      // Okay, if we're here, we know what'll peak and how, so we want to build an optimized value route now
      let [best, combo, alternative] = this.findBestAndComboObjects(projectedSupplyObjects, objectsUsage);

      let totalTime = 0;
      // If we have crafting time <= 6, we want to start with combo item to trigger bonus, else start with best item to craft 3 instead of 2 (including bonus)
      let lastWasBestItem = best.isPeaking;
      let projectedTime = lastWasBestItem ? combo.craftworksEntry.craftingTime : best.craftworksEntry.craftingTime;
      while (totalTime + projectedTime <= 24) {
        const item = lastWasBestItem ? combo : best;
        const alternativeCombo = lastWasBestItem ? alternative : null;
        day.planning.push({ ...JSON.parse(JSON.stringify(item)), alternative: alternativeCombo });
        projectedTime = lastWasBestItem ? best.craftworksEntry.craftingTime : combo.craftworksEntry.craftingTime;
        lastWasBestItem = !lastWasBestItem;
        totalTime += item.craftworksEntry.craftingTime;
        objectsUsage[item.id] = (objectsUsage[item.id] || 0) + this.workshops * (totalTime === 0 ? 1 : 2);
        if (alternativeCombo) {
          objectsUsage[alternativeCombo.id] = (objectsUsage[alternativeCombo.id] || 0) + this.workshops * (totalTime === 0 ? 1 : 2);
        }
        [best, combo, alternative] = this.findBestAndComboObjects(projectedSupplyObjects, objectsUsage);
      }
      const result = this.simulator.getScoreForDay(day);
      day.score += result.score;
      day.groove = result.groove;
      return day;
    });

    const score = this.simulator.getScore(planning);
    return {
      planning,
      score
    };
  }

  private findBestAndComboObjects(projectedSupplyObjects: CraftworksObject[], objectsUsage: Record<number, number>): [CraftworksObject, CraftworksObject, CraftworksObject] {
    const best = this.getBestItems(projectedSupplyObjects, objectsUsage).sort((a, b) => {
      return this.getBoostedValuePerHour(b, objectsUsage[b.id]) - this.getBoostedValuePerHour(a, objectsUsage[a.id]);
    })[0];
    const comboCandidates = projectedSupplyObjects.filter(obj => {
      return obj.id !== best.id
        && obj.craftworksEntry.themes.some(t => best.craftworksEntry.themes.includes(t))
        && obj.craftworksEntry.craftingTime + best.craftworksEntry.craftingTime <= 12;
    });
    let [combo] = comboCandidates.sort((a, b) => {
      return this.getBoostedValuePerHour(b, objectsUsage[b.id]) - this.getBoostedValuePerHour(a, objectsUsage[a.id]);
    });
    if (!combo) {
      // If we have no combo available (which is possible at lower ranks), just grab a random item with good value
      [combo] = projectedSupplyObjects
        .sort((a, b) => {
          return this.getBoostedValuePerHour(b, objectsUsage[b.id]) - this.getBoostedValuePerHour(a, objectsUsage[a.id]);
        });
    }
    const alternative = comboCandidates
      .filter(obj => obj.craftworksEntry.craftingTime === combo.craftworksEntry.craftingTime && obj.id !== combo.id)
      .sort((a, b) => this.getBoostedValuePerHour(b, objectsUsage[b.id]) - this.getBoostedValuePerHour(a, objectsUsage[a.id]))[0];

    return [
      best,
      combo,
      alternative
    ];
  }

  private getBoostedValuePerHour(object: CraftworksObject, usage: number | undefined): number {
    const usageOffset = Math.floor((usage || 0) / 8);
    const supplyMultiplier = (this.supply[object.supply + usageOffset] || 60) / 100;
    // If this item didn't peak yet, reduce its value for the optimizer
    const prePeakMultiplier = object.hasPeaked ? 1 : 0.5;
    return (object.craftworksEntry.value / object.craftworksEntry.craftingTime)
      * (supplyMultiplier) * (object.popularity.ratio / 100) * prePeakMultiplier;
  }

  private getBestItems(projectedSupplyObjects: CraftworksObject[], objectsUsage: Record<number, number>): CraftworksObject[] {
    const bestPeaks = projectedSupplyObjects
      .filter((obj, i, array) => array.filter(e => e.craftworksEntry.themes.some(t => obj.craftworksEntry.themes.includes(t))))
      .sort((a, b) => {
        return this.getBoostedValuePerHour(b, objectsUsage[b.id]) - this.getBoostedValuePerHour(a, objectsUsage[a.id]);
      });
    const bestPeak = bestPeaks[0];
    return bestPeaks.filter(obj => {
      return obj.supply === bestPeak.supply && obj.popularity.id === bestPeak.popularity.id;
    });
  }

  private getProjectedSupplyObjects(dayIndex: number, objectsUsage: Record<number, number>): CraftworksObject[] {
    // Always return worst case scenario
    return this.objects
      .filter(obj => objectsUsage[obj.id] === undefined)
      .map(object => {
        object.supply = object.patterns.map(p => {
          return p.pattern[dayIndex][0];
        }).sort((a, b) => a - b)[0] + Math.floor((objectsUsage[object.id] || 0) / 8);
        object.hasPeaked = object.patterns.every(p => p.pattern.every(day => day[0] >= object.supply));
        object.isPeaking = object.patterns[0] && this.findLastIndex(object.patterns[0].pattern, ([supply]) => supply === object.supply) === dayIndex;
        return object;
      });
  }

  private findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
      if (predicate(array[l], l, array))
        return l;
    }
    return -1;
  }

}
