import { ExplorationType } from '../../../model/other/exploration-type';
import { I18nName } from '../../../model/common/i18n-name';

export interface VoyageSource {
  type: ExplorationType;
  name: I18nName;
}
