import { DeserializeAs } from '@kaiu/serializer';
import { GtQuest } from './gt-quest';
import { GtData } from './gt-data';
import { GtMob } from './gt-mob';

export class MobData extends GtData {

  @DeserializeAs(GtMob)
  mob: GtMob;
}
