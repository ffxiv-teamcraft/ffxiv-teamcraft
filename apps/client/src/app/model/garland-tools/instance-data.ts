import { DeserializeAs } from '@kaiu/serializer';
import { GtInstance } from './gt-instance';
import { GtData } from './gt-data';

export class InstanceData extends GtData {

  @DeserializeAs(GtInstance)
  instance: GtInstance;
}
