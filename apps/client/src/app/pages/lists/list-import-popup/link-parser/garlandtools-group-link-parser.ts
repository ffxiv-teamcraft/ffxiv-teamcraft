import { ExternalListLinkParser } from './external-list-link-parser';
import { Observable, of } from 'rxjs';

export class GarlandtoolsGroupLinkParser implements ExternalListLinkParser {

  canParse(url: string): boolean {
    return url.indexOf('garlandtools.org/db/#group/') > -1;
  }

  parse(url: string): Observable<string> {
    return of(btoa(decodeURIComponent(url)
      .split('{')
      .pop()
      .split('}')[0]
      .split('|')
      .filter(entry => entry.startsWith('item/'))
      .map(entry => {
        const entryData = entry.split('^')[0].split('+');
        const quantity = entryData[1] ? entryData[1].split('^')[0] : 1;
        let res = `${entryData[0].split('/')[1]},null,${quantity}`;
        if (entry.split('^').length > 1) {
          entry.split('^')
            .filter((_, i) => i > 0)
            .forEach(materia => {
              res += `;${materia},null,1`;
            });
        }
        return res;
      }).join(';')));
  }

  getName(): string {
    return 'Garlandtools';
  }

}
