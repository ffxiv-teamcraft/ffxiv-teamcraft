import { ExternalListLinkParser } from './external-list-link-parser';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AriyalaMateriaOptions } from './ariyala-materia-options';
import { StaticData } from '../../../../lazy-data/static-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../../core/rxjs/with-lazy-data';
import { LazyMateria } from '../../../../lazy-data/model/lazy-materia';
import { LazyItemMeldingData } from '../../../../lazy-data/model/lazy-item-melding-data';

export class EtroLinkParser implements ExternalListLinkParser {
  public static API_URL = 'https://etro.gg/api/gearsets/';

  public static REGEXP = /https?:\/\/etro\.gg\/gearset\/([A-Z0-9\-]+)/i;

  // https://etro.gg/gearset/39d3f51b-8960-4857-81bc-7b9eda6eda38

  private materiaOptions: AriyalaMateriaOptions;

  slotKeys = [
    'weapon',
    'head',
    'body',
    'hands',
    'legs',
    'feet',
    'offHand',
    'ears',
    'neck',
    'wrists',
    'fingerL',
    'fingerR'
  ];

  constructor(private http: HttpClient, private lazyData: LazyDataFacade) {
  }

  setMateriaOptions(materiaOptions: AriyalaMateriaOptions): void {
    this.materiaOptions = materiaOptions;
  }

  canParse(url: string): boolean {
    return EtroLinkParser.REGEXP.test(url);
  }

  parse(url: string): Observable<string> {
    const identifier: string = url.match(EtroLinkParser.REGEXP)[1];
    const { estimateOvermeldMateria, groupTogether } = this.materiaOptions;

    return this.http.get<any>(`${EtroLinkParser.API_URL}${identifier}`).pipe(
      withLazyData(this.lazyData, 'materias', 'itemMeldingData'),
      map(([gear, lazyMaterias, meldingData]) => {
        const entries: string[] = [];
        const materiaTotals: { [materiaId: number]: number } = {};

        this.slotKeys.forEach(slot => {
          const isTool = slot === 'offHand' || slot === 'weapon';
          const item: number = gear[slot];
          if (!item) {
            return;
          }
          let quantity = 1;
          if (slot === 'food') {
            quantity = 30;
          }
          entries.push(`${item},null,${quantity}`);
          const materias: number[] = Object.values<number>(gear.materia[item] || {});
          if (materias !== undefined) {
            materias.forEach((materia, i) => {
              const materiaQuantity = estimateOvermeldMateria
                ? this.calcMateriaQuantity(materia, i + 1, gear.job, isTool, item, lazyMaterias, meldingData)
                : 1;
              if (groupTogether) {
                if (materia in materiaTotals) {
                  materiaTotals[materia] += materiaQuantity;
                } else {
                  materiaTotals[materia] = materiaQuantity;
                }
              } else {
                entries.push(`${materia},null,${Math.ceil(materiaQuantity)}`);
              }
            });
          }
        });

        if (groupTogether) {
          Object.keys(materiaTotals).sort().forEach(materiaId => {
            const quantity = materiaTotals[materiaId];
            entries.push(`${materiaId},null,${Math.ceil(quantity)}`);
          });
        }

        return btoa(entries.join(';'));
      })
    );
  }

  getName(): string {
    return 'Etro';
  }

  private calcMateriaQuantity(materia: number, slot: number, job: number, isTool: boolean, itemId: number, materias: LazyMateria[], meldingData: Record<number, LazyItemMeldingData>): number {
    const materiaEntry = materias.find(m => m.itemId === materia);
    const grade = materiaEntry.tier;
    const itemSlots = meldingData[itemId]?.slots || 0;
    const overmeldSlot = slot - itemSlots;
    const chance = overmeldSlot <= 0 ? 100 : StaticData.dohdolMeldingRates.hq[grade - 1][overmeldSlot - 1];
    const isGatherer = job >= 16 && job <= 18;
    const isCrafter = job >= 8 && job <= 15;
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

