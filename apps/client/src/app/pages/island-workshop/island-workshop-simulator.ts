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
    const recipesByCompletionHour = schedule.reduce((acc, workshop, i) => {
      workshop.forEach((objId, workshopIndex) => {
        const object = this.objects[objId];
        const completionTime = acc.nextCompletionTime[i] + object.craftworksEntry.craftingTime;
        acc.result[completionTime] = [...(acc.result[completionTime] || []), {
          object,
          workshopLevel: this.workshops[i],
          previous: workshop[workshopIndex - 1] || null
        }];
        acc.nextCompletionTime[i] += object.craftworksEntry.craftingTime;
      });
      return acc;
    }, {
      nextCompletionTime: schedule.map(() => 0),// One empty array per schedule
      result: []
    }).result
      .filter(row => row !== undefined);

    return recipesByCompletionHour
      .reduce((acc, chromosomes, index) => {
        chromosomes.forEach(recipe => {
          const entry = recipe.object;
          let efficiencyMultiplier = 1;
          // If not the first one, apply bonus if it can be applied
          if (index > 0) {
            const previousRecipes = recipesByCompletionHour[index - 1];
            const triggerGroove = previousRecipes.some(previous => previous.object.craftworksEntry.id !== entry.craftworksEntry.id && previous.object.craftworksEntry.themes.some(theme => entry.craftworksEntry.themes.includes(theme)));
            if (triggerGroove) {
              acc.groove = Math.min(acc.groove + 1, this.maxGroove);
              if (recipe.previous.craftworksEntry.id !== entry.craftworksEntry.id && recipe.previous.craftworksEntry.themes.some(theme => entry.craftworksEntry.themes.includes(theme))) {
                efficiencyMultiplier = 2;
              }
            }
          }
          const entryScore = entry.craftworksEntry.value * efficiencyMultiplier * (this.supply[entry.supply] / 100) * (entry.popularity.ratio / 100) * ((IslandWorkshopSimulator.RANK_RATIO[recipe.workshopLevel] || 100) / 100);
          acc.score += Math.floor(entryScore * (1 + acc.groove / 100));
        });
        return acc;
      }, {
        score: 0,
        groove: 0
      }).score;
  }
}
