import { ExternalListLinkParser } from './external-list-link-parser';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AriyalaMateria } from './aryiala-materia';

export class AriyalaLinkParser implements ExternalListLinkParser {
  private static API_URL = 'https://us-central1-ffxivteamcraft.cloudfunctions.net/ariyala-api?identifier=';

  private static REGEXP = /https?:\/\/ffxiv\.ariyala\.com\/([A-Z0-9]+)/i;

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

  parse(url: string): Observable<string> {
    const identifier: string = url.match(AriyalaLinkParser.REGEXP)[1];
    return this.http.get<any>(`${AriyalaLinkParser.API_URL}${identifier}`).pipe(
      map(data => {
        let dataset = data.datasets[data.content];
        // for DoH/DoL
        if (dataset === undefined) {
          dataset = data.datasets[Object.keys(data.datasets)[0]];
        }
        return dataset.normal;
      }),
      map(gear => {
        const entries: string[] = [];
        Object.keys(gear.items).forEach(slot => {
          let quantity = 1;
          if (slot.indexOf('ring') > -1) {
            quantity = 2;
          }
          if (slot === 'food') {
            quantity = 30;
          }
          entries.push(`${gear.items[slot]},null,${quantity}`);
          const materias: string[] = gear.materiaData[`${slot}-${gear.items[slot]}`];
          if (materias !== undefined) {
            entries.push(...materias.map(materia => {
              return `${AriyalaMateria[materia]},null,${1}`;
            }));
          }
        });
        return btoa(entries.join(';'));
      })
    );
  }

  getName(): string {
    return 'Ariyala';
  }

}
