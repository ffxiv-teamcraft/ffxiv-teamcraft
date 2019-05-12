import { DeserializeAs } from '@kaiu/serializer';
import { GtNpc } from './gt-npc';
import { GtData } from './gt-data';

export class NpcData extends GtData {

  @DeserializeAs(GtNpc)
  npc: GtNpc;
}
