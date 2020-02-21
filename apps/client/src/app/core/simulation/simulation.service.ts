import { Injectable } from '@angular/core';
import { Buff, Craft, CraftingAction, CraftingActionsRegistry, Simulation } from '@ffxiv-teamcraft/simulator';
import { Buff as KRBuff, CraftingActionsRegistry as KRCraftingActionsRegistry, Simulation as KRSimulation } from '@ffxiv-teamcraft/simulator-kr';
import { Buff as CNBuff, CraftingActionsRegistry as CNCraftingActionsRegistry, Simulation as CNSimulation } from '@ffxiv-teamcraft/simulator-cn';
import { CrafterStats } from '@ffxiv-teamcraft/simulator/types/model/crafter-stats';
import { StepState } from '@ffxiv-teamcraft/simulator/types/model/step-state';
import { Region } from '../../modules/settings/region.enum';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  getSimulation(region: Region,
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
    switch (region) {
      case Region.Korea:
        return new KRSimulation(recipe, actions as any[], stats as any, hqIngredients, stepStates, forcedStartingQuality);
      case Region.China:
        return new CNSimulation(recipe, actions as any[], stats as any, hqIngredients, stepStates, forcedStartingQuality);
      default:
        return new Simulation(recipe, actions, stats, hqIngredients, stepStates, forcedStartingQuality);
    }
  }

  callRegistry<T>(region: Region, methodName: string, ...args: any[]): T {
    switch (region) {
      case Region.Korea:
        return KRCraftingActionsRegistry[methodName](...args);
      case Region.China:
        return CNCraftingActionsRegistry[methodName](...args);
      default:
        return CraftingActionsRegistry[methodName](...args);
    }
  }

  getAllActions(region: Region): any[] {
    switch (region) {
      case Region.Korea:
        return KRCraftingActionsRegistry.ALL_ACTIONS;
      case Region.China:
        return CNCraftingActionsRegistry.ALL_ACTIONS;
      default:
        return CraftingActionsRegistry.ALL_ACTIONS;
    }
  }

  getBuff(region: Region, id: number): string {
    switch (region) {
      case Region.Korea:
        return KRBuff[id];
      case Region.China:
        return CNBuff[id];
      default:
        return Buff[id];
    }
  }
}
