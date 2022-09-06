import { CraftworksObject } from './craftworks-object';
import { addDays, subDays } from 'date-fns';
import { LazyData } from '../../lazy-data/lazy-data';
import { uniqBy } from 'lodash';

type Genome = number[];

export class PlanningOptimizer {

  private static POPULATION_SIZE = 200;

  private static GENERATIONS = 200;

  private static MUTATION_FACTOR = 1;

  private static WEEKLY_RESET_DAY = 2;

  private static RESET_HOUR = 8;

  private readonly remainingHoursBeforeReset: number;

  private readonly objects: Array<CraftworksObject & { index: number }>;

  private population: Genome[] = [];

  constructor(objects: CraftworksObject[], private supply: LazyData['islandSupply'], private weekly = false, private readonly maxBonus = 10) {
    if (weekly) {
      let nextWeeklyReset = new Date();
      nextWeeklyReset.setUTCSeconds(0);
      nextWeeklyReset.setUTCMinutes(0);
      nextWeeklyReset.setUTCMilliseconds(0);
      if (nextWeeklyReset.getUTCDay() === PlanningOptimizer.WEEKLY_RESET_DAY && nextWeeklyReset.getUTCHours() < PlanningOptimizer.RESET_HOUR) {
        nextWeeklyReset = addDays(nextWeeklyReset, 7);
      } else {
        while (nextWeeklyReset.getUTCDay() !== PlanningOptimizer.WEEKLY_RESET_DAY) {
          nextWeeklyReset = addDays(nextWeeklyReset, 1);
        }
      }
      nextWeeklyReset = addDays(nextWeeklyReset, 7);
      this.remainingHoursBeforeReset = Math.floor((nextWeeklyReset.getTime() - Date.now()) / 3600000);
    } else {
      let reset = new Date();
      reset.setUTCSeconds(0);
      reset.setUTCMinutes(0);
      reset.setUTCMilliseconds(0);
      if (reset.getUTCHours() < PlanningOptimizer.RESET_HOUR) {
        // This means the reset was yesterday
        reset = subDays(reset, 1);
      }
      reset.setUTCHours(PlanningOptimizer.RESET_HOUR);
      const nextDailyReset = addDays(reset, 1).getTime();
      this.remainingHoursBeforeReset = Math.floor((nextDailyReset - Date.now()) / 3600000);
    }
    this.objects = objects.map((obj, index) => ({ ...obj, index }));
    this.population = new Array(PlanningOptimizer.POPULATION_SIZE)
      .fill(null)
      .map(() => this.createGenome());
  }

  public run(): { score: number, planning: CraftworksObject[] }[] {
    for (let i = 0; i < PlanningOptimizer.GENERATIONS; i++) {
      this.population = this.newGeneration();
    }
    return uniqBy(this.population, e => JSON.stringify(e))
      .map(individual => {
        return {
          individual,
          score: this.fitness(individual)
        };
      }).sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, 5)
      .map(({ individual }) => {
        return {
          score: this.getRealScore(individual),
          planning: individual.map(chromosome => {
            return this.objects[chromosome];
          })
        };
      });
  }

  private printDebugScore(): void {
    const scored = this.population
      .map(individual => {
        return {
          individual,
          score: this.fitness(individual)
        };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
    console.log(`AVG SCORE: ${scored.reduce((acc, e) => acc + e.score, 0) / this.population.length}`);
    console.log(`BEST: ${scored[0].score}`);
  }

  private newGeneration(): Genome[] {
    // Give a score to each indivisual
    const scoredPopulation = this.population
      .map(individual => {
        return {
          individual,
          score: this.fitness(individual)
        };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
    // First, pick the best ones as a base population for next iteration, at 50% of total population.
    const newPopulation = scoredPopulation.slice(0, Math.floor(PlanningOptimizer.POPULATION_SIZE / 2)).map(i => i.individual);
    // Compute total score and apply cumulative weight to each individual
    const cumulativeWeights = scoredPopulation.reduce((acc, entry) => {
      const newWeight = acc.score + entry.score;
      return {
        population: [
          ...acc.population,
          {
            ...entry,
            score: newWeight
          }
        ],
        score: newWeight
      };
    }, { score: 0, population: [] });
    const totalScore = cumulativeWeights.score;
    const weightedPopulation = cumulativeWeights.population;
    while (newPopulation.length < PlanningOptimizer.POPULATION_SIZE) {
      // Select two random parents and create two children from them
      newPopulation.push(...this.reproduction([this.pickRandom(weightedPopulation, totalScore), this.pickRandom(weightedPopulation, totalScore)]));
    }
    return newPopulation;
  }

  private reproduction(parents: [Genome, Genome]): [Genome, Genome] {
    const [firstParent, secondParent] = parents;
    return [this.makeChild(firstParent, secondParent), this.makeChild(secondParent, firstParent)];
  }

  private makeChild(firstParent: Genome, secondParent: Genome): Genome {
    // Split at length - 1 to have at least one chromosome from second parent
    const splitIndex = Math.floor(Math.random() * firstParent.length - 1);
    const child = firstParent.slice(0, splitIndex);
    let totalTime = 0;
    while (totalTime < this.remainingHoursBeforeReset && this.remainingHoursBeforeReset - totalTime > 4) {
      totalTime = child.reduce((acc, taskIndex) => {
        return acc + this.objects[taskIndex].craftworksEntry.craftingTime;
      }, 0);
      const possibleParentChromosome = secondParent.filter((chromosome) => this.objects[chromosome].craftworksEntry.craftingTime <= (this.remainingHoursBeforeReset - totalTime) && child[child.length - 1] !== chromosome);
      if (possibleParentChromosome.length === 0) {
        const possibleGlobalTasks = this.objects.filter(o => o.craftworksEntry.craftingTime <= (this.remainingHoursBeforeReset - totalTime));
        if (possibleGlobalTasks.length > 0) {
          child.push(possibleGlobalTasks[Math.floor(possibleGlobalTasks.length * Math.random())].index);
        }
        return child;
      }
      child.push(possibleParentChromosome[Math.floor(Math.random() * possibleParentChromosome.length)]);
    }
    if ((Math.random() * 100) <= PlanningOptimizer.MUTATION_FACTOR) {
      return this.mutate(child);
    }
    return child;
  }

  private pickRandom(weightedPopulation: { individual: Genome, score: number }[], totalScore: number): Genome {
    const randomSelection = Math.floor(Math.random() * totalScore);
    let pickedIndex = 0;
    while (weightedPopulation[pickedIndex].score < randomSelection) {
      pickedIndex++;
    }
    return weightedPopulation[pickedIndex].individual;
  }

  private createGenome(): Genome {
    let remainingHours = this.remainingHoursBeforeReset;
    let matches = this.objects.filter(o => o.craftworksEntry.craftingTime <= remainingHours);
    const genome = [];
    while (matches.length > 0) {
      const randomObject = matches[Math.floor(Math.random() * matches.length)];
      genome.push(randomObject.index);
      remainingHours -= randomObject.craftworksEntry.craftingTime;
      matches = this.objects.filter(o => o.craftworksEntry.craftingTime <= remainingHours);
    }
    return genome;
  }

  private fitness(genome: Genome): number {
   return this.getRealScore(genome, 100);
  }

  private getRealScore(genome: Genome, bonusWeight = 1):number{
    return genome.reduce((acc, chromosome, index) => {
      if (acc.totalTime > this.remainingHoursBeforeReset) {
        return {
          ...acc,
          score: 0,
          bonus: 0
        };
      }
      // Grab craftworks object from the chromosome value
      const entry = this.objects[chromosome];
      // If not the first one, apply bonus if it can be applied
      if (index > 0) {
        const previous = this.objects[genome[index - 1]];
        if (previous.craftworksEntry.themes.some(theme => entry.craftworksEntry.themes.includes(theme))) {
          acc.bonus = Math.min(acc.bonus + bonusWeight, this.maxBonus * bonusWeight);
        }
      }
      const entryScore = entry.craftworksEntry.value * (this.supply[entry.supply] / 100) * (entry.popularity.ratio / 100);
      acc.score += Math.floor(entryScore * (1 + acc.bonus / 100));
      return acc;
    }, { score: 0, bonus: 0, totalTime: 0 }).score;
  }

  private mutate(genome: Genome): Genome {
    const clone = [...genome];
    const mutationIndex = Math.floor(Math.random() * clone.length);
    const mutated = clone[mutationIndex];
    const possibleMutations = this.objects.filter(o => o.craftworksEntry.craftingTime === this.objects[mutated].craftworksEntry.craftingTime);
    clone[mutationIndex] = possibleMutations[Math.floor(Math.random() * possibleMutations.length)].index;
    return clone;
  }
}
