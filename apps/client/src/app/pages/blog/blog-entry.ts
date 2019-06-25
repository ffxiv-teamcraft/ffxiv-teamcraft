import { DataModel } from '../../core/database/storage/data-model';

export class BlogEntry extends DataModel {
  public author: string;

  public date: string = new Date().toISOString();

  public content: string;

  public title: string;

  public slug: string;

  public description: string;

}
