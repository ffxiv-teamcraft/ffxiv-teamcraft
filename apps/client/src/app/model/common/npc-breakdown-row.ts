import { Vector3 } from '../../core/tools/vector3';
import { ListRow } from '../../modules/list/model/list-row';

export interface NpcBreakdownRow {
  items: ListRow[];
  npcId: number;
  position?: Vector3 & { zoneid: number, map: number };
}
