import { DataModel } from '../storage/data-model';

export abstract class Relationship<F, T> extends DataModel {
  from: F;

  to: T;
}
