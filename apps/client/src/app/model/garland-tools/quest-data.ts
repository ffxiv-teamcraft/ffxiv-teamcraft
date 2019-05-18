import { DeserializeAs } from '@kaiu/serializer';
import { GtQuest } from './gt-quest';
import { GtData } from './gt-data';

export class QuestData extends GtData {

  @DeserializeAs(GtQuest)
  quest: GtQuest;
}
