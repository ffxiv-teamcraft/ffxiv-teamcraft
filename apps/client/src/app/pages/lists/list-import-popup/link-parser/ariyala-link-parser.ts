import { ExternalListLinkParser } from './external-list-link-parser';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { AriyalaMateriaOptions } from './ariyala-materia-options';
import { StaticData } from '../../../../lazy-data/static-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { LazyMateria } from '@ffxiv-teamcraft/data/model/lazy-materia';
import { AriyalaStatToBaseParamId } from './ariyala-stat-to-base-param-id';

export class AriyalaLinkParser implements ExternalListLinkParser {
  public static API_URL = 'https://us-central1-ffxivteamcraft.cloudfunctions.net/ariyala-api?identifier=';

  public static REGEXP = /https?:\/\/ffxiv\.ariyala\.com\/([A-Z0-9]+)/i;

  private materiaOptions: AriyalaMateriaOptions;

  constructor(private http: HttpClient, private lazyData: LazyDataFacade) {
  }

  canParse(url: string): boolean {
    return AriyalaLinkParser.REGEXP.test(url);
  }

  setMateriaOptions(materiaOptions: AriyalaMateriaOptions): void {
    this.materiaOptions = materiaOptions;
  }

  parse(url: string): Observable<string> {
    const identifier: string = url.match(AriyalaLinkParser.REGEXP)[1];
    const { estimateOvermeldMateria, groupTogether } = this.materiaOptions;

    return this.http.get<any>(`${AriyalaLinkParser.API_URL}${identifier}`).pipe(
      map(data => {
        let dataset = data.datasets[data.content];
        // for DoH/DoL
        if (dataset === undefined) {
          dataset = data.datasets[Object.keys(data.datasets)[0]];
        }

        const job = data.content;
        const gear = dataset.normal;
        gear.job = job;
        return gear;
      }),
      switchMap(gear => {
        // Retrieve number of overmeld slots from api, to properly calculate success rates
        if (estimateOvermeldMateria) {
          return forkJoin(Object.entries(gear.items).map(([k, itemId]) => {
            return this.lazyData.getRow('itemMeldingData', +itemId);
          })).pipe(
            map(itemData => {
              gear.itemMateriaSlots = itemData.filter(Boolean).map(id => id.slots);
              return gear;
            })
          );
        } else {
          return of(gear);
        }
      }),
      switchMap(gear => {
        return this.lazyData.getEntry('materias').pipe(
          map(lazyMaterias => {
            const entries: string[] = [];
            const materiaTotals: { [materiaId: number]: number } = {};

            Object.keys(gear.items).forEach((slot, itemIndex) => {
              const item = gear.items[slot];
              const isTool = slot.startsWith('mainhand') || slot.startsWith('offhand');

              let quantity = 1;
              if (slot === 'food') {
                quantity = 30;
              }
              entries.push(`${item},null,${quantity}`);

              const materias: string[] = gear.materiaData[`${slot}-${item}`];
              if (materias !== undefined) {
                materias.forEach((materia, i) => {
                  const materiaQuantity = estimateOvermeldMateria
                    ? this.calcMateriaQuantity(materia, i + 1, gear.itemMateriaSlots[itemIndex], gear.job, isTool)
                    : 1;
                  if (groupTogether) {
                    if (materia in materiaTotals) {
                      materiaTotals[materia] += materiaQuantity;
                    } else {
                      materiaTotals[materia] = materiaQuantity;
                    }
                  } else {
                    entries.push(`${this.getMateriaItemId(lazyMaterias, materia)},null,${Math.ceil(materiaQuantity)}`);
                  }
                });
              }
            });

            if (groupTogether) {
              Object.keys(materiaTotals).sort().forEach(materia => {
                const materiaId = this.getMateriaItemId(lazyMaterias, materia);
                const quantity = materiaTotals[materia];
                entries.push(`${materiaId},null,${Math.ceil(quantity)}`);
              });
            }

            return btoa(entries.join(';'));
          })
        );
      })
    );
  }

  private getMateriaItemId(lazyMaterias: LazyMateria[], ariyalaMateria: string): number {
    const [statAbbr, rank] = ariyalaMateria.split(':');
    return lazyMaterias.find(materia => {
      return materia.baseParamId === AriyalaStatToBaseParamId[statAbbr] && materia.tier === +rank + 1;
    })?.itemId;
  }

  getName(): string {
    return 'Ariyala';
  }

  private calcMateriaQuantity(materia: string, slot: number, materiaSlots: number, job: string, isTool: boolean): number {
    const grade = parseInt(materia.split(':')[1], 10) + 1;
    const overmeldSlot = slot - materiaSlots;
    const chance = overmeldSlot <= 0 ? 100 : StaticData.dohdolMeldingRates.hq[grade - 1][overmeldSlot - 1];
    const isGatherer = ['MIN', 'BTN', 'FSH'].indexOf(job) > -1;
    const isCrafter = ['CRP', 'BSM', 'ARM', 'GSM', 'LTW', 'WVR', 'ALC', 'CUL'].indexOf(job) > -1;
    let mul = 1;
    if (isTool && this.materiaOptions.multiplyToolMateria) {
      if (isGatherer) mul = 2;
      if (isCrafter) mul = 8;
    }

    // If there's no chance to meld, don't get any of this materia. To avoid Infinity
    if (chance === 0) {
      return 0;
    }
    return (1 / (chance / 100)) * mul;
  }
}

