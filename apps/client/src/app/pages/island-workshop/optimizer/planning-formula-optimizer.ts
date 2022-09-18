import { LazyData } from '../../../lazy-data/lazy-data';
import { CraftworksObject } from '../craftworks-object';
import { WorkshopPlanning } from './workshop-planning';
import { IslandWorkshopSimulator } from './island-workshop-simulator';


export class PlanningFormulaOptimizer {

  private objectsUsage: Record<number, number> = {};

  private simulator = new IslandWorkshopSimulator(this.supply, this.workshops, this.landmarks, this.workshopLevel);

  constructor(private objects: CraftworksObject[], private workshops: number, private landmarks: number, private workshopLevel: number, private supply: LazyData['islandSupply']) {
  }

  public run(): { planning: WorkshopPlanning[], score: number } {
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
      const strongPeaks = this.getBestItems(i);

      // If there's some unknown peaks for this day, consider it as not ready to optimize
      if (strongPeaks.some(obj => obj.patterns.length > 1)) {
        day.unknown = true;
        return day;
      }

      // Okay, if we're here, we know what'll peak and how, so we want to build an optimized value route now
      // First of all, find what to spam for big scoring
      const bestItem = this.getBestItems(i).sort((a, b) => {
        return this.getBoostedValuePerHour(b) - this.getBoostedValuePerHour(a);
      })[0];
      let [bestComboItem, alternativeComboItem] = this.getProjectedSupplyObjects(i).filter(obj => {
        return obj.id !== bestItem.id && obj.craftworksEntry.themes.some(t => bestItem.craftworksEntry.themes.includes(t));
      }).sort((a, b) => {
        return a.craftworksEntry.craftingTime - b.craftworksEntry.craftingTime;
      });
      if (!bestComboItem) {
        // If we have no combo available (which is possible at lower ranks), just grab a random item with good value
        [bestComboItem, alternativeComboItem] = this.getProjectedSupplyObjects(i).sort((a, b) => {
          if (a.craftworksEntry.craftingTime === b.craftworksEntry.craftingTime) {
            return b.popularity.id - a.popularity.id;
          }
          return a.craftworksEntry.craftingTime - b.craftworksEntry.craftingTime;
        });
      }
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
        this.objectsUsage[item.id] = (this.objectsUsage[item.id] || 0) + this.workshops;
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
    }
  }

  private getBoostedValuePerHour(object: CraftworksObject): number {
    return (object.craftworksEntry.value / object.craftworksEntry.craftingTime)
      * (this.supply[object.supply] / 100) * (object.popularity.ratio / 100);
  }

  private getBestItems(dayIndex: number): CraftworksObject[] {
    const bestPeaks = this.getProjectedSupplyObjects(dayIndex)
      .filter((obj, i, array) => array.filter(e => e.craftworksEntry.themes.some(t => obj.craftworksEntry.themes.includes(t))))
      .sort((a, b) => {
        return (this.supply[b.supply] * b.popularity.ratio) - (this.supply[a.supply] * a.popularity.ratio);
      });
    const bestPeak = bestPeaks[0];
    return bestPeaks.filter(obj => {
      return obj.supply === bestPeak.supply && obj.popularity.id === bestPeak.popularity.id;
    });
  }

  private getProjectedSupplyObjects(dayIndex: number): CraftworksObject[] {
    // Always return worst case scenario
    return this.objects.map(object => {
      object.supply = object.patterns.map(p => {
        return p.pattern[dayIndex][0] + Math.floor((this.objectsUsage[object.id] || 0) / 8);
      }).sort((a, b) => a - b)[0];
      return object;
    });
  }

}
