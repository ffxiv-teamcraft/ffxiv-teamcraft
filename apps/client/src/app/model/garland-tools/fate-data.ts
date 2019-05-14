import { DeserializeAs } from '@kaiu/serializer';
import { GtQuest } from './gt-quest';
import { GtData } from './gt-data';
import { GtMob } from './gt-mob';
import { GtFate } from './gt-fate';

export class FateData extends GtData {

  @DeserializeAs(GtFate)
  fate: GtFate;
}
