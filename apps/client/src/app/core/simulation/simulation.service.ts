import { Injectable } from '@angular/core';
import { Buff, Craft, CraftingAction, CraftingActionsRegistry, Simulation } from '@ffxiv-teamcraft/simulator';
import { Buff as KRBuff, CraftingActionsRegistry as KRCraftingActionsRegistry, Simulation as KRSimulation } from '@ffxiv-teamcraft/simulator-kr';
import { Buff as CNBuff, CraftingActionsRegistry as CNCraftingActionsRegistry, Simulation as CNSimulation } from '@ffxiv-teamcraft/simulator-cn';
import { CrafterStats } from '@ffxiv-teamcraft/simulator/types/model/crafter-stats';
import { StepState } from '@ffxiv-teamcraft/simulator/types/model/step-state';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  getSimulation(locale: string,
                recipe: Craft,
                actions: CraftingAction[],
                stats: CrafterStats,
                hqIngredients?: {
                  id: number;
                  amount: number;
                }[],
                stepStates?: {
                  [index: number]: StepState;
                },
                forcedStartingQuality?: number): Simulation | KRSimulation | CNSimulation {
    switch (locale) {
      case 'ko':
        return new KRSimulation(recipe, actions as any[], stats as any, hqIngredients, stepStates, forcedStartingQuality);
      case 'zh':
        return new CNSimulation(recipe, actions as any[], stats as any, hqIngredients, stepStates, forcedStartingQuality);
      default:
        return new Simulation(recipe, actions, stats, hqIngredients, stepStates, forcedStartingQuality);
    }
  }

  callRegistry<T>(locale: string, methodName: string, ...args: any[]): T {
    switch (locale) {
      case 'ko':
        return KRCraftingActionsRegistry[methodName](...args);
      case 'zh':
        return CNCraftingActionsRegistry[methodName](...args);
      default:
        return CraftingActionsRegistry[methodName](...args);
    }
  }

  getAllActions(locale: string): any[] {
    switch (locale) {
      case 'ko':
        return KRCraftingActionsRegistry.ALL_ACTIONS;
      case 'zh':
        return CNCraftingActionsRegistry.ALL_ACTIONS;
      default:
        return CraftingActionsRegistry.ALL_ACTIONS;
    }
  }

  getBuff(locale: string, id: number): string {
    switch (locale) {
      case 'ko':
        return KRBuff[id];
      case 'zh':
        return CNBuff[id];
      default:
        return Buff[id];
    }
  }
}
