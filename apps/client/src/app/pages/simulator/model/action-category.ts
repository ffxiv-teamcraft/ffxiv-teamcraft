import { CraftingAction } from "@ffxiv-teamcraft/simulator";

export interface ActionCategory {
  titleKey: string;
  actions: CraftingAction[];
}