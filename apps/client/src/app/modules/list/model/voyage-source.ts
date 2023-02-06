import { ExplorationType } from '../../../model/other/exploration-type';
import { I18nName } from '@ffxiv-teamcraft/types';

export interface VoyageSource {
  type: ExplorationType;
  name: I18nName;
}
