import { DeserializeAs } from '@kaiu/serializer';
import { GtData } from './gt-data';
import { GtFate } from './gt-fate';

export class FateData extends GtData {

  @DeserializeAs(GtFate)
  fate: GtFate;
}
