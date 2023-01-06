import { MapData } from '../../map/map-data';
import { NavigationStep } from '../../map/navigation-step';
import { MapMarker } from '../../map/map-marker';
import { ListRow } from '../model/list-row';

export interface StepByStepDisplayData {
  path: {
    map: MapData
    steps: NavigationStep[],
    alarms?: { row: ListRow, marker: MapMarker }[]
  },
  additionalMarkers: MapMarker[]
}
