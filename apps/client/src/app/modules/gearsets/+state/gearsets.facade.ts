import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { GearsetsPartialState } from './gearsets.reducer';
import { gearsetsQuery } from './gearsets.selectors';
import { CreateGearset, DeleteGearset, ImportGearset, LoadGearset, LoadGearsets, SelectGearset, UpdateGearset } from './gearsets.actions';
import { map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { Observable } from 'rxjs';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { StatsService } from '../stats.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MateriaService } from '../materia.service';
import { Memoized } from '../../../core/decorators/memoized';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { HttpClient } from '@angular/common/http';
import { AriyalaMateria } from '../../../pages/lists/list-import-popup/link-parser/aryiala-materia';
import * as jobAbbrs from '../../../core/data/sources/job-abbr.json';

@Injectable({
  providedIn: 'root'
})
export class GearsetsFacade {
  loaded$ = this.store.pipe(select(gearsetsQuery.getLoaded));

  allGearsets$ = this.store.pipe(select(gearsetsQuery.getAllGearsets));

  selectedGearset$ = this.store.pipe(
    select(gearsetsQuery.getSelectedGearset)
  );

  myGearsets$ = this.allGearsets$.pipe(
    switchMap((gearsets: TeamcraftGearset[]) => {
      return this.authFacade.userId$.pipe(
        map(userId => {
          return gearsets.filter(gearset => {
            return gearset.authorId === userId;
          });
        })
      );
    })
  );


  public selectedGearsetStats: Observable<{ id: number, value: number }[]> = this.selectedGearset$.pipe(
    map(set => {
      const stats = this.statsService.getRelevantBaseStats(set.job)
        .map(stat => {
          return {
            id: stat,
            value: this.statsService.getBaseValue(stat, set.job, set.level)
          };
        });
      Object.values(set)
        .filter(value => value && value.itemId !== undefined)
        .forEach((equipmentPiece: EquipmentPiece) => {
          const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId];
          // If this item has no stats, return !
          if (!itemStats) {
            return;
          }
          itemStats
            .filter((stat: any) => stat.ID !== undefined)
            .forEach((stat: any) => {
              let statsRow = stats.find(s => s.id === stat.ID);
              if (statsRow === undefined) {
                stats.push({
                  id: stat.ID,
                  value: this.statsService.getBaseValue(stat.ID, set.job, set.level)
                });
                statsRow = stats[stats.length - 1];
              }
              if (equipmentPiece.hq) {
                statsRow.value += stat.HQ;
              } else {
                statsRow.value += stat.NQ;
              }
            });
          equipmentPiece.materias
            .filter(materia => materia > 0)
            .forEach((materiaId, index) => {
              const bonus = this.materiasService.getMateriaBonus(equipmentPiece, materiaId, index);
              const materia = this.materiasService.getMateria(materiaId);
              let statsRow = stats.find(s => s.id === materia.baseParamId);
              if (statsRow === undefined) {
                stats.push({
                  id: materia.baseParamId,
                  value: this.statsService.getBaseValue(materia.baseParamId, set.job, set.level)
                });
                statsRow = stats[stats.length - 1];
              }
              statsRow.value += bonus.value;
            });
        });
      return stats;
    })
  );

  constructor(private store: Store<GearsetsPartialState>, private authFacade: AuthFacade,
              private statsService: StatsService, private lazyData: LazyDataService,
              private materiasService: MateriaService, private http: HttpClient) {
  }

  loadAll(): void {
    this.store.dispatch(new LoadGearsets());
  }

  load(key: string): void {
    this.store.dispatch(new LoadGearset(key));
  }

  update(key: string, gearset: TeamcraftGearset): void {
    this.store.dispatch(new UpdateGearset(key, gearset));
  }

  delete(key: string): void {
    this.store.dispatch(new DeleteGearset(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectGearset(key));
  }

  createGearset(gearset?: TeamcraftGearset): void {
    this.store.dispatch(new CreateGearset(gearset));
  }

  importGearset(): void {
    this.store.dispatch(new ImportGearset());
  }


  /**
   * Checks if a slot can be equipped, considering chest and legs pieces (for combined items like big armors and such)
   *
   * @param slotName Ingame slot name (the one used in EquipSlotcategory sheet)
   * @param chestPieceId item id for chest slot
   * @param legsPieceId item id for legs slot
   */
  @Memoized()
  canEquipSlot(slotName: string, chestPieceId: number, legsPieceId: number): boolean {
    let matchesBody = true;
    let matchesLegs = true;
    // Some items are full body
    if (['Head', 'Hands', 'Legs', 'Feet'].indexOf(slotName) > -1 && chestPieceId) {
      const equipSlotCategory = this.lazyData.data.equipSlotCategories[this.lazyData.data.itemEquipSlotCategory[chestPieceId]];
      matchesBody = +equipSlotCategory[slotName] > -1;
    }
    // This is for legs + feet items
    if (slotName === 'Feet' && legsPieceId) {
      const equipSlotCategory = this.lazyData.data.equipSlotCategories[this.lazyData.data.itemEquipSlotCategory[legsPieceId]];
      matchesLegs = +equipSlotCategory[slotName] > -1;
    }
    return matchesBody && matchesLegs;
  }

  fromAriyalaLink(url: string): Observable<TeamcraftGearset> {
    const identifier: string = url.match(AriyalaLinkParser.REGEXP)[1];
    return this.http.get<any>(`${AriyalaLinkParser.API_URL}${identifier}`).pipe(
      map(data => {
        let dataset = data.datasets[data.content];
        // for DoH/DoL
        if (dataset === undefined) {
          dataset = data.datasets[Object.keys(data.datasets)[0]];
        }
        const gearset = new TeamcraftGearset();
        gearset.job = +Object.keys(jobAbbrs).find(k => jobAbbrs[k].en === data.content);
        gearset.name = url;
        gearset.mainHand = this.getEquipmentPiece(dataset, 'mainhand');
        gearset.offHand = this.getEquipmentPiece(dataset, 'offhand');
        gearset.head = this.getEquipmentPiece(dataset, 'head');
        gearset.chest = this.getEquipmentPiece(dataset, 'chest');
        gearset.gloves = this.getEquipmentPiece(dataset, 'hands');
        gearset.belt = this.getEquipmentPiece(dataset, 'waist');
        gearset.legs = this.getEquipmentPiece(dataset, 'legs');
        gearset.feet = this.getEquipmentPiece(dataset, 'feet');
        gearset.earRings = this.getEquipmentPiece(dataset, 'ears');
        gearset.necklace = this.getEquipmentPiece(dataset, 'neck');
        gearset.bracelet = this.getEquipmentPiece(dataset, 'wrist');
        gearset.ring1 = this.getEquipmentPiece(dataset, 'ringLeft');
        gearset.ring2 = this.getEquipmentPiece(dataset, 'ringRight');
        gearset.crystal = this.getEquipmentPiece(dataset, 'soulCrystal');
        return gearset;
      })
    );
  }

  private getEquipmentPiece(dataset: any, ariyalaName: string): EquipmentPiece | null {
    const itemId = dataset.normal.items[ariyalaName];
    if (itemId === undefined) {
      return null;
    }
    const itemMeldingData = this.lazyData.data.itemMeldingData[itemId];
    const materias = (dataset.normal.materiaData[`${ariyalaName}-${itemId}`] || []).map(row => AriyalaMateria[row]) as number[];
    while (materias.length < itemMeldingData.slots) {
      materias.push(0);
    }
    if (itemMeldingData.overmeld) {
      while (materias.length < 5) {
        materias.push(0);
      }
    }
    return {
      itemId: itemId,
      materias: materias,
      materiaSlots: itemMeldingData.slots,
      canOvermeld: itemMeldingData.overmeld,
      baseParamModifier: itemMeldingData.modifier,
      hq: itemMeldingData.canBeHq
    };
  }
}
