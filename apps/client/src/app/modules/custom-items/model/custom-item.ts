import { ListRow } from '../../list/model/list-row';
import { ForeignKey } from '../../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

export class CustomItem extends ListRow {
  @ForeignKey(TeamcraftUser)
  authorId: string;
  name: string;
  custom = true;
}
