import { DataModel } from '../../../../core/database/storage/data-model';

export class DbComment extends DataModel {
  parent?: string;

  resourceId: string;

  message: string;

  author: string;

  date: number;

  replies: DbComment[] = [];

  language?: string;

  deleted?: boolean;

  likes: string[] = [];

  dislikes: string[] = [];

  public get score(): number {
    return this.likes.length - this.dislikes.length;
  }
}
