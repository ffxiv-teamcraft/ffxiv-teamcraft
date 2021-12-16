import { DataModel } from '../../core/database/storage/data-model';
import { ForeignKey } from '../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { CommentTargetType } from './comment-target-type';

export class ResourceComment extends DataModel {
  @ForeignKey(TeamcraftUser)
  authorId: string;

  content: string;

  date: string;

  /**
   * Type of the target.
   */
  targetType: CommentTargetType;

  /**
   * Id of the target.
   */
  targetId: string;

  /**
   * Used for comment position precision, for like
   * saying on which item this comment is placed.
   */
  targetDetails = 'none';
}
