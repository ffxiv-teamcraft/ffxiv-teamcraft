import { DataModel } from '../../../../core/database/storage/data-model';

export class DbComment extends DataModel {
  resourceId: string;
  message: string;
  author: string;
  date: number;
  replies: DbComment[] = [];
  language?: string;
  deleted?: boolean;
  likes: {user: string}[] = [];
  dislikes: {user: string}[] = [];
}
