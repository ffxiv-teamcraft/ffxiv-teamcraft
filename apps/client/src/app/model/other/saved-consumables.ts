import { Consumable } from '../../pages/simulator/model/consumable';
import { DeserializeAs } from '@kaiu/serializer';

export class SavedConsumables {

  @DeserializeAs(Consumable)
  food: Consumable;

  @DeserializeAs(Consumable)
  medicine: Consumable;
}
