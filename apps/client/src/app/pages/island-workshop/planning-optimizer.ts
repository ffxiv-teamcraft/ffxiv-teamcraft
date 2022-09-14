import { CraftworksObject } from './craftworks-object';
import { addDays } from 'date-fns';
import { LazyData } from '../../lazy-data/lazy-data';
import { uniqBy } from 'lodash';
import { PlanningOptimizerConfig } from './planning-optimizer-config';
import { IslandWorkshopSimulator } from './island-workshop-simulator';

type Genome = number[][];

export class PlanningOptimizer {

  private static POPULATION_SIZE = 500;

  private static GENERATIONS = 200;

  private static MUTATION_FACTOR = 5;

  private static WEEKLY_RESET_DAY = 2;

  private static RESET_HOUR = 8;

  private readonly remainingHoursBeforeReset: number;

  private readonly objects: Array<CraftworksObject & { index: number }>;

  private population: Genome[] = [];

  private simulator: IslandWorkshopSimulator;

  constructor(objects: CraftworksObject[],
              private supply: LazyData['islandSupply'],
              private config: PlanningOptimizerConfig) {
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
    this.objects = objects.map((obj, index) => ({ ...obj, index }));
    this.population = new Array(PlanningOptimizer.POPULATION_SIZE)
      .fill(null)
      .map(() => this.createGenome());
    this.simulator = new IslandWorkshopSimulator(this.objects, this.config.workshops, this.supply, this.config.landmarks);
  }

  public run(): { score: number, planning: CraftworksObject[][] }[] {
    if (this.remainingHoursBeforeReset < 4) {
      return [];
    }
    for (let i = 0; i < PlanningOptimizer.GENERATIONS; i++) {
      this.population = this.newGeneration();
      // if (i % 100 === 0) {
      //   this.printDebugScore(i);
      // }
    }
    return uniqBy(this.population, e => JSON.stringify(e))
      .map(individual => {
        return {
          individual,
          score: this.getRealScore(individual)
        };
      }).sort((a, b) => {
        return b.score - a.score;
      })
      .slice(0, 5)
      .map(({ individual, score }) => {
        return {
          score: score,
          planning: individual.map(workshop => {
            return workshop.map(chromosome => {
              return this.objects[chromosome];
            });
          })
        };
      });
  }

  private printDebugScore(iteration: number): void {
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
    console.group(`ITERATION #${iteration}`);
    console.log(`AVG SCORE: ${scored.reduce((acc, e) => acc + e.score, 0) / this.population.length}`);
    console.log(`BEST: ${scored[0].score}`);
    console.groupEnd();
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

    return [
      firstParent.map((workshop, i) => {
        return this.makeChild(workshop, secondParent[i]);
      }),
      secondParent.map((workshop, i) => {
        return this.makeChild(workshop, firstParent[i]);
      })
    ];
  }

  private makeChild(firstParent: number[], secondParent: number[]): number[] {
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
    this.config.workshops.forEach((ws, i) => {
      genome[i] = [];
      while (matches.length > 0) {
        const randomObject = matches[Math.floor(Math.random() * matches.length)];
        genome[i].push(randomObject.index);
        remainingHours -= randomObject.craftworksEntry.craftingTime;
        matches = this.objects.filter(o => o.craftworksEntry.craftingTime <= remainingHours);
      }
    });
    return genome;
  }

  private fitness(genome: Genome): number {
    return this.getRealScore(genome);
  }

  private getRealScore(genome: Genome): number {
    return this.simulator.getScore(genome);
  }

  private mutate(genome: number[]): number[] {
    const clone = JSON.parse(JSON.stringify(genome));
    const mutationWorkshop = Math.floor(Math.random() * clone.length);
    const mutationIndex = Math.floor(Math.random() * clone[mutationWorkshop].length);
    const mutated = clone[mutationWorkshop][mutationIndex];
    const possibleMutations = this.objects.filter(o => o.craftworksEntry.craftingTime === this.objects[mutated].craftworksEntry.craftingTime);
    clone[mutationWorkshop][mutationIndex] = possibleMutations[Math.floor(Math.random() * possibleMutations.length)].index;
    return clone;
  }
}
