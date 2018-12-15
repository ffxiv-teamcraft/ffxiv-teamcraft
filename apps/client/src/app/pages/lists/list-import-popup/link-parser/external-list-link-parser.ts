import { Observable } from 'rxjs';

export interface ExternalListLinkParser {

  getName(): string;

  canParse(url: string): boolean;

  parse(url: string): Observable<string>;
}
