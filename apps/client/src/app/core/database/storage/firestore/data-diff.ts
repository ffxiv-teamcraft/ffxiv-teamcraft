import { DiffType } from './diff-type';

export class DataDiff {
  type: DiffType;
  $key: string;
  data?: any;
}
