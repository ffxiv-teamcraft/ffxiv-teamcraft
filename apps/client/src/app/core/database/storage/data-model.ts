import { environment } from '../../../../environments/environment';

export class DataModel {
  $key?: string;
  notFound?: boolean;
  version?: string = environment.version;
}
