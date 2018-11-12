import { NavigationObjective } from './navigation-objective';

export interface NavigationStep extends NavigationObjective {
  isTeleport: boolean;
}
