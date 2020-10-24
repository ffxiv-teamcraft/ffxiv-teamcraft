import { ListRow } from '../../modules/list/model/list-row';
import { List } from '../../modules/list/model/list';
import { SettingsService } from '../../modules/settings/settings.service';

export type FilterMethod = (row: ListRow, list: List, settings: SettingsService) => boolean;
