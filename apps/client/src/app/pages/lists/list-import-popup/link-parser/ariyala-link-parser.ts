import { ExternalListLinkParser } from './external-list-link-parser';
import { Observable } from 'rxjs/Observable';
import { ExternalListData } from './external-list-data';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AriyalaMateria } from './aryiala-materia';

export class AriyalaLinkParser implements ExternalListLinkParser {
  private static API_URL = 'http://ffxiv.ariyala.com/store.app?identifier=';

  private static REGEXP = /http:\/\/ffxiv\.ariyala\.com\/([A-Z0-9]+)/i;

  // Source: garlandtools, given by Clorifex.
  private static MELDING_RATES = [
    // Sockets
    //2, 3,  4,  5     // Tier
    [45, 24, 14, 8],   // I
    [41, 22, 13, 8],   // II
    [35, 19, 11, 7],   // III
    [29, 16, 10, 6],   // IV
    [17, 10, 7, 5],   // V
    [17, 0, 0, 0]    // VI
  ];

  constructor(private http: HttpClient) {
  }

  canParse(url: string): boolean {
    return AriyalaLinkParser.REGEXP.test(url);
  }

  parse(url: string): Observable<ExternalListData[]> {
    const identifier: string = url.match(AriyalaLinkParser.REGEXP)[1];
    return this.http.get<any>(`${AriyalaLinkParser.API_URL}${identifier}`).pipe(
      map(data => {
        return data[data.content].normal;
      }),
      map(gear => {
        const entries: ExternalListData[] = [];
        Object.keys(gear.items).forEach(slot => {
          entries.push({ itemId: gear.items[slot], quantity: 1 });
          const materias: string[] = gear.materiaData[`${slot}-${gear.items[slot]}`];
          if (materias !== undefined) {
            entries.push(...materias.map(materia => {
              return {
                itemId: AriyalaMateria[materia],
                // TODO handle overmeld slots etc.
                quantity: 1
              };
            }));
          }
        });
        return entries;
      })
    );
  }

}
