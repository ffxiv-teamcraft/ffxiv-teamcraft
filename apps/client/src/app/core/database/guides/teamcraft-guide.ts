import {DataModel} from "../storage/data-model";

export class TeamcraftGuide extends DataModel {
  author: string;
  contributors: string[];
  title: string;
  navTitle: string;
  content: string;
  description: string;
  published: boolean;
  category: string;
  subCategory: string;

  updated: number;
  featured: boolean;
  publishDate?: number;

  banner?: string;
}
