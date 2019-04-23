import { NavigationStep } from './navigation-step';
import { MapData } from './map-data';

export interface WorldNavigationStep {
  map: MapData;
  steps: NavigationStep[];
}
