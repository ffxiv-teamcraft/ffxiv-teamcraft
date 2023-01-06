import { MapData } from '../../map/map-data';
import { NavigationStep } from '../../map/navigation-step';
import { MapMarker } from '../../map/map-marker';

export interface StepByStepDisplayData {
  path: {
    map: MapData
    steps: NavigationStep[]
  },
  additionalMarkers: MapMarker[]
}
