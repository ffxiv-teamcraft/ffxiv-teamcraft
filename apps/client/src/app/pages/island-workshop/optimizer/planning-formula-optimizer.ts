import { LazyData } from '../../../lazy-data/lazy-data';
import { CraftworksObject } from '../craftworks-object';
import { WorkshopPlanning } from './workshop-planning';
import { IslandWorkshopSimulator } from './island-workshop-simulator';
import { WorkshopStatusData } from '../workshop-status-data';
import { WorkshopPattern } from '../workshop-patterns';
import { findPatterns } from './find-pattern';


export class PlanningFormulaOptimizer {

  private simulator = new IslandWorkshopSimulator(this.supply, this.workshops, this.landmarks, this.workshopLevel);

  constructor(private objects: CraftworksObject[], private history: WorkshopStatusData[], private workshops: number, private landmarks: number, private workshopLevel: number, private supply: LazyData['islandSupply'],
              private secondRestDay: number, private currentDayIndex: number) {
  }

  public run(): { planning: WorkshopPlanning[], score: number } {
    const objectsUsage: Record<number, number> = {};
    let groove = 0;
    const planning = new Array(7).fill(null).map((_, i) => {
      const day = {
        rest: false,
        unknown: false,
        score: 0,
        groove: 0,
        planning: []
      };
      if (i === 0 || i === this.secondRestDay) {
        // First of all, D1 and D2 are rest days to make things easier
        day.rest = true;
        return day;
      }
      // For the other days, check if there's any strong peak
      // Compute projected supply
      const projectedSupplyObjects = this.getProjectedSupplyObjects(this.history, i, objectsUsage);

      const unknownDay = [1, 2, 3, 7, 7, 7, 7][this.currentDayIndex] < i;

      // If there's some unknown peaks for this day, consider it as not ready to optimize
      if (unknownDay) {
        day.unknown = true;
        return day;
      }

      // Okay, if we're here, we know what'll peak and how, so we want to build an optimized value route now
      let [best, combo] = this.findBestAndComboObjects(projectedSupplyObjects, objectsUsage);

      let totalTime = 0;
      let useComboItem = combo.craftworksEntry.craftingTime + best.craftworksEntry.craftingTime <= 12;
      let projectedTime = useComboItem ? combo.craftworksEntry.craftingTime : best.craftworksEntry.craftingTime;
      while (totalTime + projectedTime <= 24) {
        const item = JSON.parse(JSON.stringify(useComboItem ? combo : best));
        day.planning.push(item);
        useComboItem = !useComboItem;
        totalTime += item.craftworksEntry.craftingTime;
        objectsUsage[item.id] = (objectsUsage[item.id] || 0) + this.workshops * (totalTime === 0 ? 1 : 2);
        [best, combo] = this.findBestAndComboObjects(projectedSupplyObjects, objectsUsage);
        projectedTime = useComboItem ? combo.craftworksEntry.craftingTime + best.craftworksEntry.craftingTime : best.craftworksEntry.craftingTime;
      }
      if (totalTime < 24) {
        const bestFirstItem = projectedSupplyObjects.filter(obj => {
          return obj.craftworksEntry.craftingTime <= (24 - totalTime)
            && obj.craftworksEntry.themes.some(t => day.planning[0].craftworksEntry.themes.includes(t))
            && obj.id !== day.planning[0].id;
        }).sort((a, b) => {
          return this.getBoostedValue(b, objectsUsage[b.id]) - this.getBoostedValue(a, objectsUsage[a.id]);
        })[0];
        if (bestFirstItem) {
          day.planning.unshift(bestFirstItem);
        }
      }
      const result = this.simulator.getScoreForDay(day, groove);
      day.score = result.score;
      groove = result.groove;
      day.groove = groove;
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
      return this.getBoostedValue(b, objectsUsage[b.id]) - this.getBoostedValue(a, objectsUsage[a.id]);
    })[0];
    const comboCandidates = projectedSupplyObjects.filter(obj => {
      return obj.id !== best.id
        && obj.craftworksEntry.themes.some(t => best.craftworksEntry.themes.includes(t))
        && obj.craftworksEntry.craftingTime + best.craftworksEntry.craftingTime <= 12;
    });
    let [combo] = comboCandidates.sort((a, b) => {
      return this.getBoostedValue(b, 0) - this.getBoostedValue(a, 0);
    });
    if (!combo) {
      // If we have no combo available (which is possible at lower ranks), just grab a random item with good value
      [combo] = projectedSupplyObjects
        .filter(obj => obj.id !== best.id && obj.craftworksEntry.craftingTime + best.craftworksEntry.craftingTime <= 12)
        .sort((a, b) => {
          return this.getBoostedValue(b, 0) - this.getBoostedValue(a, 0);
        });

      if (!combo) {
        // If we STILL have no combo available (which CAN happen but means you're optimizing in a shitty way anyways)
        // Just grab the best item to use and that's it.
        [combo] = projectedSupplyObjects
          .filter(obj => obj.id !== best.id)
          .sort((a, b) => {
            return this.getBoostedValue(b, 0) - this.getBoostedValue(a, 0);
          });
      }
    }
    const alternative = comboCandidates
      .filter(obj => obj.craftworksEntry.craftingTime === combo.craftworksEntry.craftingTime && obj.id !== combo.id && (!objectsUsage[obj.id] || !objectsUsage[combo.id]))
      .sort((a, b) => this.getBoostedValue(b, 0) - this.getBoostedValue(a, 0))[0];

    return [
      best,
      combo,
      alternative
    ];
  }

  private getBoostedValue(object: CraftworksObject, usage: number | undefined, forCombo = false): number {
    const usageOffset = Math.floor((usage || 0) / 8);
    const supplyMultiplier = (this.supply[object.supply + usageOffset] || 60) / 100;
    // If this item didn't peak yet, reduce its value for the optimizer
    let prePeakMultiplier: number;
    if (forCombo) {
      prePeakMultiplier = object.hasPeaked ? 1.2 : 1;
    } else {
      prePeakMultiplier = object.isPeaking ? 2 : 1;
    }
    return (object.craftworksEntry.value / object.craftworksEntry.craftingTime)
      * (supplyMultiplier) * (object.popularity.ratio / 100) * prePeakMultiplier;
  }

  private getBestItems(projectedSupplyObjects: CraftworksObject[], objectsUsage: Record<number, number>): CraftworksObject[] {
    let items = projectedSupplyObjects
      .filter((obj, i, array) => array.filter(e => e.craftworksEntry.themes.some(t => obj.craftworksEntry.themes.includes(t))) && obj.patterns.length === 1);

    if (items.length === 0) {
      items = projectedSupplyObjects
        .filter((obj, i, array) => array.filter(e => e.craftworksEntry.themes.some(t => obj.craftworksEntry.themes.includes(t))));
    }

    return items.sort((a, b) => {
      return this.getBoostedValue(b, objectsUsage[b.id]) - this.getBoostedValue(a, objectsUsage[a.id]);
    });
  }

  private getProjectedSupplyObjects(history: WorkshopStatusData[], dayIndex: number, objectsUsage: Record<number, number>): CraftworksObject[] {
    // Always return worst case scenario
    return this.objects
      .filter(obj => objectsUsage[obj.id] === undefined)
      .map(object => {
        object.patterns = this.findPatternsForDay(history, object, dayIndex);
        object.supply = object.patterns.map(p => {
          return p.pattern[dayIndex][0];
        }).sort((a, b) => a - b)[0];
        object.hasPeaked = object.patterns.length === 1 && object.patterns[0].index < dayIndex;
        object.isPeaking = object.patterns.length === 1 && object.patterns[0].index === dayIndex;
        return object;
      });
  }

  private findPatternsForDay(history: WorkshopStatusData[], item: CraftworksObject, dayIndex: number): { index: number, pattern: WorkshopPattern, strong: boolean, day: number }[] {
    const itemHistory = history
      .slice(0, dayIndex)
      .map(day => {
        return [day.objects[item.id].supply, day.objects[item.id].demand];
      });
    return findPatterns(itemHistory);
  }
}
