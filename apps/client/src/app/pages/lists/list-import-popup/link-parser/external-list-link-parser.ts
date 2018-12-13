import { ExternalListData } from './external-list-data';
import { Observable } from 'rxjs/Observable';

export interface ExternalListLinkParser {

  canParse(url: string): boolean;

  parse(url: string): Observable<ExternalListData[]>;
}
