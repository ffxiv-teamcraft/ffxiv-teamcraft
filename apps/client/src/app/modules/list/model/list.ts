import { ListRow } from './list-row';
import { ListTag } from './list-tag.enum';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { environment } from '../../../../environments/environment';
import { Team } from '../../../model/team/team';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { ListColor } from './list-color';
import firebase from 'firebase/compat/app';
import { SettingsService } from '../../settings/settings.service';

export class List extends DataWithPermissions {
  offline?: boolean;

  name: string;

  // For ordering purpose, lower index means higher priority on ordering.
  index = -1;

  hasCommission = false;

  finalItems: ListRow[] = [];

  items: ListRow[] = [];

  note = '';

  // noinspection JSUnusedGlobalSymbols
  createdAt: firebase.firestore.Timestamp;

  // Should we disable HQ suggestions for this list?
  disableHQSuggestions = false;

  version: string = environment.version;

  tags: ListTag[] = [];

  public: boolean;

  forks = 0;

  ephemeral: boolean;

  @ForeignKey(Team)
  teamId: string;

  // Used for the drag-and-drop feature.
  workshopId?: string;

  color: ListColor;

  archived = false;

  contributionStats = { entries: [], total: 0, ilvlTotal: 0 };

  ignoreRequirementsRegistry: Record<string, 1> = {};

  constructor(settings?: SettingsService) {
    super();
    if (!this.createdAt) {
      this.createdAt = firebase.firestore.Timestamp.fromDate(new Date());
    }

    if (settings) {
      this.everyone = settings.defaultPermissionLevel;
      this.disableHQSuggestions = settings.disableHQSuggestions;
    }
  }
}
