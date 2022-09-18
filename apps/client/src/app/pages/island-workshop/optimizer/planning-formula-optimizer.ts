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
        // First of all, first day is always rest day
        day.rest = true;
        return day;
      }
      // For the other days, check if there's any strong peak
      // Compute projected supply
      const strongPeaks = this.getBestItems(i, objectsUsage);

      // If there's some unknown peaks for this day, consider it as not ready to optimize
      if (strongPeaks.some(obj => obj.patterns.length > 1)) {
        day.unknown = true;
        return day;
      }

      // Okay, if we're here, we know what'll peak and how, so we want to build an optimized value route now
      // First of all, find what to spam for big scoring
      const bestItem = this.getBestItems(i, objectsUsage).sort((a, b) => {
        return this.getBoostedValuePerHour(b) - this.getBoostedValuePerHour(a);
      })[0];
      const projectedSupplyObjects = this.getProjectedSupplyObjects(i, objectsUsage);
      let [bestComboItem] = projectedSupplyObjects.filter(obj => {
        return obj.id !== bestItem.id
          && obj.craftworksEntry.themes.some(t => bestItem.craftworksEntry.themes.includes(t));
      }).sort((a, b) => {
        return a.craftworksEntry.craftingTime - b.craftworksEntry.craftingTime;
      });
      if (!bestComboItem) {
        // If we have no combo available (which is possible at lower ranks), just grab a random item with good value
        [bestComboItem] = projectedSupplyObjects
          .sort((a, b) => {
            if (a.craftworksEntry.craftingTime === b.craftworksEntry.craftingTime) {
              return b.popularity.id - a.popularity.id;
            }
            return a.craftworksEntry.craftingTime - b.craftworksEntry.craftingTime;
          });
      }
      const alternativeComboItem = projectedSupplyObjects
        .filter(obj => obj.craftworksEntry.craftingTime === bestComboItem.craftworksEntry.craftingTime)
        .sort((a, b) => this.getBoostedValuePerHour(b) - this.getBoostedValuePerHour(a))[0];

      let totalTime = 0;
      // If we have crafting time <= 6, we want to start with combo item to trigger bonus, else start with best item to craft 3 instead of 2 (including bonus)
      let lastWasBestItem = bestComboItem.craftworksEntry.craftingTime + bestItem.craftworksEntry.craftingTime <= 12;
      let projectedTime = bestComboItem.craftworksEntry.craftingTime;
      while (totalTime + projectedTime <= 24) {
        const item = lastWasBestItem ? bestComboItem : bestItem;
        const alternative = lastWasBestItem ? alternativeComboItem : null;
        day.planning.push({ ...JSON.parse(JSON.stringify(item)), alternative });
        projectedTime = lastWasBestItem ? bestItem.craftworksEntry.craftingTime : bestComboItem.craftworksEntry.craftingTime;
        lastWasBestItem = !lastWasBestItem;
        totalTime += item.craftworksEntry.craftingTime;
        objectsUsage[item.id] = (objectsUsage[item.id] || 0) + this.workshops * (totalTime === 0 ? 1 : 2);
        if (alternative) {
          objectsUsage[alternative.id] = (objectsUsage[alternative.id] || 0) + this.workshops * (totalTime === 0 ? 1 : 2);
        }
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

  private getBoostedValuePerHour(object: CraftworksObject): number {
    return (object.craftworksEntry.value / object.craftworksEntry.craftingTime)
      * (this.supply[object.supply] / 100) * (object.popularity.ratio / 100);
  }

  private getBestItems(dayIndex: number, objectsUsage: Record<number, number>): CraftworksObject[] {
    const bestPeaks = this.getProjectedSupplyObjects(dayIndex, objectsUsage)
      .filter((obj, i, array) => array.filter(e => e.craftworksEntry.themes.some(t => obj.craftworksEntry.themes.includes(t))))
      .sort((a, b) => {
        return this.getBoostedValuePerHour(b) - this.getBoostedValuePerHour(a);
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
        return object;
      });
  }

}
