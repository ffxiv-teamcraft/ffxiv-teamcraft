import { ListRow } from '../../model/list-row';
import { DataType, ItemSource } from '@ffxiv-teamcraft/types';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { NavigationObjective } from '../../../map/navigation-objective';

export interface ListStep extends Partial<NavigationObjective> {
  uniqId: string;
  row: ListRow;
  sources: ItemSource[];
  coords?: Vector2;
  icon?: string;
}

export type MapListStep = {
  [type in DataType]?: ListStep[];
} & {
  mapId: number;
  sources: DataType[];
  other: ListStep[];
  isHousingMap: boolean;
  complete: boolean;
  itemsCount: number;
  progress: number;
  totalTodo: number;
  totalDone: number;
};
