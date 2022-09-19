import { LazyData } from '../../../lazy-data/lazy-data';
import { WorkshopPlanning } from './workshop-planning';

export class IslandWorkshopSimulator {

  static RANK_RATIO = [100, 100, 110, 120, 130];

  private readonly maxGroove: number;

  private readonly workshopRankRatio: number;

  constructor(private supply: LazyData['islandSupply'], private workshops: number, landmarks: number, private workshopLevel: number) {
    this.maxGroove = [
      10, 15, 20, 25, 35
    ][landmarks] || 0;
    this.workshopRankRatio = (IslandWorkshopSimulator.RANK_RATIO[workshopLevel] || 100) / 100;
  }

  public getScore(planning: WorkshopPlanning[]): number {
    return planning.reduce((acc, day) => {
      if (day.rest || day.unknown) {
        return acc;
      }
      const dayResult = this.getScoreForDay(day, acc.groove);
      acc.score += dayResult.score;
      acc.groove = dayResult.groove;
      return acc;
    }, {
      score: 0,
      groove: 0
    }).score;
  }

  private getSupplyRatio(supply: number): number {
    return this.supply[supply] || this.supply[4];
  }

  public getScoreForDay(day: WorkshopPlanning, baseGroove = 0): { score: number, groove: number } {
    return day.planning.reduce((acc, object, i) => {
      const isEfficient = i > 0 && day.planning[i - 1].id !== object.id && day.planning[i - 1].craftworksEntry.themes.some(t => object.craftworksEntry.themes.includes(t));
      const score = this.workshops
        * object.craftworksEntry.value
        * (this.getSupplyRatio(object.supply) / 100)
        * (object.popularity.ratio / 100)
        * (1 + acc.groove / 100)
        * (isEfficient ? 2 : 1)
        * this.workshopRankRatio;
      if (isEfficient) {
        acc.groove = Math.min(this.maxGroove, acc.groove + 3);
      }
      acc.score += score;
      return acc;
    }, {
      score: 0,
      groove: baseGroove
    });
  }
}
