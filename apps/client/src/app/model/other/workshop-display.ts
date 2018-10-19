import { Workshop } from './workshop';
import { List } from '../../modules/list/model/list';

export interface WorkshopDisplay {
  workshop: Workshop;
  lists: List[];
}
