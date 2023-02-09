import { Injectable } from '@angular/core';
import * as Simulator from '@ffxiv-teamcraft/simulator';
import { Region } from '@ffxiv-teamcraft/types';
import { getSimulator } from './simulation';

export type ActionResult = Simulator.ActionResult;
export type ActionType = Simulator.ActionType;
export type Craft = Simulator.Craft;
export type CraftingJob = Simulator.CraftingJob;
export type CrafterLevels = Simulator.CrafterLevels;
export type CrafterStats = Simulator.CrafterStats;
export type CraftingAction = Simulator.CraftingAction;
export type EffectiveBuff = Simulator.EffectiveBuff;
export type GearSet = Simulator.GearSet;
export type Simulation = Simulator.Simulation;
export type SimulationReliabilityReport = Simulator.SimulationReliabilityReport;
export type SimulationResult = Simulator.SimulationResult;
export type StepState = Simulator.StepState;

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  getSimulator(region: Region): typeof Simulator {
    return getSimulator(region);
  }
}
