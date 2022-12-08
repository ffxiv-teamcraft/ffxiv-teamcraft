import { ListRow } from '../../model/list-row';
import { ItemSource } from '../../model/item-source';
import { DataType } from '../../data/data-type';
import { Vector2 } from '../../../../core/tools/vector2';

export interface ListStep {
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
