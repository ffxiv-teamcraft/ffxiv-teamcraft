import { Vector3 } from '../../core/tools/vector3';
import { ListRow } from '../../modules/list/model/list-row';
import { I18nName } from '@ffxiv-teamcraft/types';

export interface NpcBreakdownRow {
  items: ListRow[];
  npcId: number;
  npcName?: string;
  position?: Vector3 & { zoneid: number, map: number };
}
