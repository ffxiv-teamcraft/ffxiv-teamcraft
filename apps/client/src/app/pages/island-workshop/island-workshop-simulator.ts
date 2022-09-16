import { CraftworksObject } from './craftworks-object';
import { LazyData } from '../../lazy-data/lazy-data';

export class IslandWorkshopSimulator {

  static RANK_RATIO = [100, 100, 110, 120, 130];

  private maxGroove = 10;

  constructor(private objects: CraftworksObject[], private workshops: number[], private supply: LazyData['islandSupply'], landmarks: number) {
    this.maxGroove = [
      10,
      15,
      20,
      25,
      35
    ][landmarks] || 10;
  }

  public getScore(schedule: number[][]): number {
    if (schedule[0].filter(task => task === -1).length !== 2) {
      return 0;
    }
    const recipesByCompletionHour = schedule.reduce((acc, workshop, i) => {
      workshop.forEach((objId, workshopIndex) => {
        if (objId === -1) {
          // ObjId === -1 means rest day ! Two of these are needed per week.
          const restCompletionTime = acc.nextCompletionTime[i] + 24;
          acc.result[restCompletionTime] = [...(acc.result[restCompletionTime] || []), {
            object: null,
            workshopLevel: this.workshops[i],
            previous: workshop[workshopIndex - 1] || null,
            completionTime: restCompletionTime
          }];
          acc.nextCompletionTime[i] += 24;
          return acc;
        }
        const object = this.objects[objId];
        const completionTime = acc.nextCompletionTime[i] + object.craftworksEntry.craftingTime;
        acc.result[completionTime] = [...(acc.result[completionTime] || []), {
          object,
          workshopLevel: this.workshops[i],
          previous: workshop[workshopIndex - 1],
          completionTime
        }];
        acc.nextCompletionTime[i] += object.craftworksEntry.craftingTime;
      });
      return acc;
    }, {
      nextCompletionTime: schedule.map(() => 0),// One empty array per schedule
      result: []
    }).result
      .filter(row => row !== undefined);

    const today = new Date().getUTCDay();
    const todayInPattern = (today - 3) < 0 ? (6 - (today - 3)) : today - 3;

    return recipesByCompletionHour
      .reduce((acc, chromosomes, index) => {
        chromosomes.forEach(recipe => {
          const entry: CraftworksObject = recipe.object;
          if (!recipe.object) {
            return;
          }
          let efficiencyMultiplier = 1;
          // If not the first one, apply bonus if it can be applied
          if (index > 0) {
            const previousRecipes = recipesByCompletionHour[index - 1];
            const triggerGroove = previousRecipes.some(previous => previous.object?.craftworksEntry.id !== entry.id && previous.object?.craftworksEntry.themes.some(theme => entry.craftworksEntry.themes.includes(theme)));
            if (triggerGroove) {
              acc.groove = Math.min(acc.groove + 1, this.maxGroove);
              const previousObject: CraftworksObject = this.objects[recipe.previous];
              if (previousObject && previousObject.id !== entry.id && previousObject.craftworksEntry.themes.some(theme => entry.craftworksEntry.themes.includes(theme))) {
                efficiencyMultiplier = 2;
              }
            }
          }
          let supply = entry.patterns.map(p => {
            return p.pattern[(todayInPattern + Math.floor(recipe.completionTime / 24)) % 7][0];
          }).sort((a, b) => a - b)[0];// Take the lowest value to have pessimistic approach

          // If we don't have any supply data, assume worst case.
          if (supply === undefined) {
            supply = 4;
          }
          const entryScore = entry.craftworksEntry.value * efficiencyMultiplier * (this.supply[supply] / 100) * (entry.popularity.ratio / 100) * ((IslandWorkshopSimulator.RANK_RATIO[recipe.workshopLevel] || 100) / 100);
          acc.score += Math.floor(entryScore * (1 + acc.groove / 100));
        });
        return acc;
      }, {
        score: 0,
        groove: 0
      }).score;
  }
}
