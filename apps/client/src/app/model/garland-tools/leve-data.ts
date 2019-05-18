import { DeserializeAs } from '@kaiu/serializer';
import { GtLeve } from './gt-leve';
import { GtData } from './gt-data';

export class LeveData extends GtData {

  @DeserializeAs(GtLeve)
  quest: GtLeve;
}
