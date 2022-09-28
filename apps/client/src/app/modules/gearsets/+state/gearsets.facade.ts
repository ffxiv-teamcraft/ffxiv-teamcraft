import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { GearsetsPartialState } from './gearsets.reducer';
import { gearsetsQuery } from './gearsets.selectors';
import {
  CreateGearset,
  DeleteGearset,
  ImportAriyalaGearset,
  ImportEtroGearset,
  ImportFromPcap,
  ImportLodestoneGearset,
  LoadGearset,
  LoadGearsetProgression,
  LoadGearsets,
  PureUpdateGearset,
  SaveGearsetProgression,
  SelectGearset,
  SyncFromPcap,
  UpdateGearset,
  UpdateGearsetIndexes
} from './gearsets.actions';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable, of } from 'rxjs';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { StatsService } from '../stats.service';
import { MateriaService } from '../materia.service';
import { Memoized } from '../../../core/decorators/memoized';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { HttpClient } from '@angular/common/http';
import { XivapiService } from '@xivapi/angular-client';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { LazyData } from '../../../lazy-data/lazy-data';
import { LazyMateria } from '../../../lazy-data/model/lazy-materia';
import { AriyalaStatToBaseParamId } from '../../../pages/lists/list-import-popup/link-parser/ariyala-stat-to-base-param-id';
import { EtroLinkParser } from '../../../pages/lists/list-import-popup/link-parser/etro-link-parser';
import { PermissionsController } from '../../../core/database/permissions-controller';

@Injectable({
  providedIn: 'root'
})
export class GearsetsFacade {
  loaded$ = this.store.pipe(select(gearsetsQuery.getLoaded));

  allGearsets$ = this.store.pipe(select(gearsetsQuery.getAllGearsets));

  selectedGearset$ = this.store.pipe(
    select(gearsetsQuery.getSelectedGearset),
    filter(gearset => gearset !== undefined)
  );

  selectedGearsetProgression$ = this.store.pipe(
    select(gearsetsQuery.getSelectedGearsetProgression),
    filter(progression => progression !== undefined)
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

  public readonly tribesMenu = [
    { race: 1, tribes: [1, 2] },
    { race: 2, tribes: [3, 4] },
    { race: 3, tribes: [5, 6] },
    { race: 4, tribes: [7, 8] },
    { race: 5, tribes: [9, 10] },
    { race: 6, tribes: [11, 12] },
    { race: 7, tribes: [13, 14] },
    { race: 8, tribes: [15, 16] }
  ];

  selectedGearsetPermissionLevel$: Observable<PermissionLevel> = combineLatest([this.selectedGearset$, this.authFacade.userId$])
    .pipe(
      map(([gearset, userId]) => {
        return !gearset.notFound && PermissionsController.getPermissionLevel(gearset, userId);
      })
    );

  constructor(private store: Store<GearsetsPartialState>, private authFacade: AuthFacade,
              private statsService: StatsService, private lazyData: LazyDataFacade,
              private materiasService: MateriaService, private http: HttpClient,
              private xivapi: XivapiService) {
  }

  toArray(gearset: TeamcraftGearset): { piece: EquipmentPiece, slot: string }[] {
    return [
      { piece: gearset.mainHand, slot: 'mainHand' },
      { piece: gearset.offHand, slot: 'offHand' },
      { piece: gearset.head, slot: 'head' },
      { piece: gearset.chest, slot: 'chest' },
      { piece: gearset.gloves, slot: 'gloves' },
      { piece: gearset.belt, slot: 'belt' },
      { piece: gearset.legs, slot: 'legs' },
      { piece: gearset.feet, slot: 'feet' },
      { piece: gearset.necklace, slot: 'necklace' },
      { piece: gearset.earRings, slot: 'earRings' },
      { piece: gearset.bracelet, slot: 'bracelet' },
      { piece: gearset.ring1, slot: 'ring1' },
      { piece: gearset.ring2, slot: 'ring2' }
    ].filter(p => !!p.piece);
  }

  loadAll(): void {
    this.store.dispatch(new LoadGearsets());
  }

  load(key: string): void {
    this.store.dispatch(new LoadGearset(key));
  }

  clone(gearset: TeamcraftGearset): void {
    const clone = new TeamcraftGearset();
    Object.assign(clone, gearset);
    delete clone.$key;
    delete clone.authorId;
    this.createGearset(clone);
  }

  update(key: string, gearset: TeamcraftGearset, isReadonly = false): void {
    this.store.dispatch(new UpdateGearset(key, gearset, isReadonly));
  }

  pureUpdate(key: string, gearset: Partial<TeamcraftGearset>): void {
    this.store.dispatch(new PureUpdateGearset(key, gearset));
  }

  delete(key: string): void {
    this.store.dispatch(new DeleteGearset(key));
  }

  select(key: string): void {
    this.store.dispatch(new SelectGearset(key));
  }

  createGearset(gearset?: TeamcraftGearset, preventNavigation = false): void {
    this.store.dispatch(new CreateGearset(gearset, preventNavigation));
  }

  importAriyalaGearset(): void {
    this.store.dispatch(new ImportAriyalaGearset());
  }

  importEtroGearset(): void {
    this.store.dispatch(new ImportEtroGearset());
  }

  importFromPcap(): void {
    this.store.dispatch(new ImportFromPcap());
  }

  syncFromPcap(): void {
    this.store.dispatch(new SyncFromPcap());
  }

  importLodestoneGearset(): void {
    this.store.dispatch(new ImportLodestoneGearset());
  }

  saveIndexes(sets: TeamcraftGearset[]): void {
    this.store.dispatch(new UpdateGearsetIndexes(sets));
  }

  loadProgression(gearsetKey: string): void {
    this.store.dispatch(new LoadGearsetProgression(gearsetKey));
  }

  saveProgression(gearsetKey: string, progression: GearsetProgression): void {
    this.store.dispatch(new SaveGearsetProgression(gearsetKey, progression));
  }


  /**
   * Checks if a slot can be equipped, considering chest and legs pieces (for combined items like big armors and such)
   *
   * @param slotName Ingame slot name (the one used in EquipSlotcategory sheet)
   * @param chestPieceId item id for chest slot
   * @param legsPieceId item id for legs slot
   */
  @Memoized()
  canEquipSlot(slotName: string, chestPieceId: number, legsPieceId: number): Observable<boolean> {
    return of([true, true]).pipe(
      switchMap(([, matchesLegs]) => {
        if (['Head', 'Hands', 'Legs', 'Feet'].indexOf(slotName) > -1 && chestPieceId) {
          return this.lazyData.getRow('itemEquipSlotCategory', chestPieceId)
            .pipe(
              switchMap(chestPieceCategory => {
                return this.lazyData.getRow('equipSlotCategories', chestPieceCategory);
              }),
              map(equipSlotCategory => [+equipSlotCategory[slotName] > -1, matchesLegs])
            );
        }
        return of([true, true]);
      }),
      switchMap(([matchesBody]) => {
        if (slotName === 'Feet' && legsPieceId) {
          return this.lazyData.getRow('itemEquipSlotCategory', legsPieceId)
            .pipe(
              switchMap(legsPieceCategory => {
                return this.lazyData.getRow('equipSlotCategories', legsPieceCategory);
              }),
              map(equipSlotCategory => [matchesBody, +equipSlotCategory[slotName] > -1])
            );
        }
        return of([matchesBody, true]);
      }),
      map(([matchesBody, matchesLegs]) => matchesBody && matchesLegs),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  fromAriyalaLink(url: string): Observable<TeamcraftGearset> {
    const identifier: string = url.match(AriyalaLinkParser.REGEXP)[1];
    return this.http.get<any>(`${AriyalaLinkParser.API_URL}${identifier}`).pipe(
      withLazyData(this.lazyData, 'jobAbbr', 'jobName', 'foods', 'itemMeldingData', 'hqFlags', 'materias'),
      map(([data, jobAbbr, jobName, foods, itemMeldingData, hqFlags, lazyMaterias]) => {
        let dataset = data.datasets[data.content];
        // for DoH/DoL
        if (dataset === undefined) {
          dataset = data.datasets[Object.keys(data.datasets)[0]];
        }
        const gearset = new TeamcraftGearset();
        gearset.job = +Object.keys(jobAbbr).find(k => jobAbbr[k].en.toLowerCase() === data.content.toLowerCase()) || +Object.keys(jobName).find(k => jobName[k].en.toLowerCase() === data.content.toLowerCase());
        gearset.name = url;
        gearset.mainHand = this.getAriyalaEquipmentPiece(dataset, 'mainhand', itemMeldingData, hqFlags, lazyMaterias);
        gearset.offHand = this.getAriyalaEquipmentPiece(dataset, 'offhand', itemMeldingData, hqFlags, lazyMaterias);
        gearset.head = this.getAriyalaEquipmentPiece(dataset, 'head', itemMeldingData, hqFlags, lazyMaterias);
        gearset.chest = this.getAriyalaEquipmentPiece(dataset, 'chest', itemMeldingData, hqFlags, lazyMaterias);
        gearset.gloves = this.getAriyalaEquipmentPiece(dataset, 'hands', itemMeldingData, hqFlags, lazyMaterias);
        gearset.legs = this.getAriyalaEquipmentPiece(dataset, 'legs', itemMeldingData, hqFlags, lazyMaterias);
        gearset.feet = this.getAriyalaEquipmentPiece(dataset, 'feet', itemMeldingData, hqFlags, lazyMaterias);
        gearset.earRings = this.getAriyalaEquipmentPiece(dataset, 'ears', itemMeldingData, hqFlags, lazyMaterias);
        gearset.necklace = this.getAriyalaEquipmentPiece(dataset, 'neck', itemMeldingData, hqFlags, lazyMaterias);
        gearset.bracelet = this.getAriyalaEquipmentPiece(dataset, 'wrist', itemMeldingData, hqFlags, lazyMaterias);
        gearset.ring1 = this.getAriyalaEquipmentPiece(dataset, 'ringLeft', itemMeldingData, hqFlags, lazyMaterias);
        gearset.ring2 = this.getAriyalaEquipmentPiece(dataset, 'ringRight', itemMeldingData, hqFlags, lazyMaterias);
        gearset.crystal = this.getAriyalaEquipmentPiece(dataset, 'soulCrystal', itemMeldingData, hqFlags, lazyMaterias);
        if (dataset.normal.items.food) {
          gearset.food = foods.find(food => food.ID === dataset.normal.items.food);
          if (gearset.food) {
            gearset.food.HQ = true;
          }
        }
        return gearset;
      }),
      catchError((e) => {
        console.error(e);
        return of(null);
      })
    );
  }

  fromEtroLink(url: string): Observable<TeamcraftGearset> {
    const identifier: string = url.match(EtroLinkParser.REGEXP)[1];
    return this.http.get<any>(`${EtroLinkParser.API_URL}${identifier}`).pipe(
      withLazyData(this.lazyData, 'foods', 'itemMeldingData', 'hqFlags'),
      map(([data, foods, itemMeldingData, hqFlags]) => {
        const gearset = new TeamcraftGearset();
        gearset.job = data.job;
        gearset.name = url;
        gearset.mainHand = this.getEtroEquipmentPiece(data, 'weapon', itemMeldingData, hqFlags);
        gearset.offHand = this.getEtroEquipmentPiece(data, 'offHand', itemMeldingData, hqFlags);
        gearset.head = this.getEtroEquipmentPiece(data, 'head', itemMeldingData, hqFlags);
        gearset.chest = this.getEtroEquipmentPiece(data, 'body', itemMeldingData, hqFlags);
        gearset.gloves = this.getEtroEquipmentPiece(data, 'hands', itemMeldingData, hqFlags);
        gearset.legs = this.getEtroEquipmentPiece(data, 'legs', itemMeldingData, hqFlags);
        gearset.feet = this.getEtroEquipmentPiece(data, 'feet', itemMeldingData, hqFlags);
        gearset.earRings = this.getEtroEquipmentPiece(data, 'ears', itemMeldingData, hqFlags);
        gearset.necklace = this.getEtroEquipmentPiece(data, 'neck', itemMeldingData, hqFlags);
        gearset.bracelet = this.getEtroEquipmentPiece(data, 'wrists', itemMeldingData, hqFlags);
        gearset.ring1 = this.getEtroEquipmentPiece(data, 'fingerL', itemMeldingData, hqFlags);
        gearset.ring2 = this.getEtroEquipmentPiece(data, 'fingerR', itemMeldingData, hqFlags);
        if (data.food) {
          gearset.food = foods.find(food => food.ID === data.food);
          if (gearset.food) {
            gearset.food.HQ = true;
          }
        }
        return gearset;
      }),
      catchError((e) => {
        console.error(e);
        return of(null);
      })
    );
  }

  private getMateriaItemId(lazyMaterias: LazyMateria[], ariyalaMateria: string): number {
    const [statAbbr, rank] = ariyalaMateria.split(':');
    return lazyMaterias.find(materia => {
      return materia.baseParamId === AriyalaStatToBaseParamId[statAbbr] && materia.tier === +rank + 1;
    })?.itemId;
  }

  fromLodestone(lodestoneId: number): Observable<TeamcraftGearset> {
    return this.xivapi.getCharacter(
      lodestoneId,
      {
        extraQueryParams: {
          data: 'cj'
        }
      }
    ).pipe(
      withLazyData(this.lazyData, 'itemMeldingData', 'hqFlags'),
      map(([data, itemMeldingData, hqFlags]) => {
        const lodestoneGear = data.Character.GearSet.Gear;
        const gearset = new TeamcraftGearset();
        gearset.job = data.Character.ActiveClassJob.JobID;
        gearset.name = data.Character.Name;
        gearset.mainHand = this.getLodestoneEquipmentPiece(lodestoneGear, 'MainHand', itemMeldingData, hqFlags);
        gearset.offHand = this.getLodestoneEquipmentPiece(lodestoneGear, 'OffHand', itemMeldingData, hqFlags);
        gearset.head = this.getLodestoneEquipmentPiece(lodestoneGear, 'Head', itemMeldingData, hqFlags);
        gearset.chest = this.getLodestoneEquipmentPiece(lodestoneGear, 'Body', itemMeldingData, hqFlags);
        gearset.gloves = this.getLodestoneEquipmentPiece(lodestoneGear, 'Hands', itemMeldingData, hqFlags);
        gearset.belt = this.getLodestoneEquipmentPiece(lodestoneGear, 'Waist', itemMeldingData, hqFlags);
        gearset.legs = this.getLodestoneEquipmentPiece(lodestoneGear, 'Legs', itemMeldingData, hqFlags);
        gearset.feet = this.getLodestoneEquipmentPiece(lodestoneGear, 'Feet', itemMeldingData, hqFlags);
        gearset.earRings = this.getLodestoneEquipmentPiece(lodestoneGear, 'Earrings', itemMeldingData, hqFlags);
        gearset.necklace = this.getLodestoneEquipmentPiece(lodestoneGear, 'Necklace', itemMeldingData, hqFlags);
        gearset.bracelet = this.getLodestoneEquipmentPiece(lodestoneGear, 'Bracelets', itemMeldingData, hqFlags);
        gearset.ring1 = this.getLodestoneEquipmentPiece(lodestoneGear, 'Ring1', itemMeldingData, hqFlags);
        gearset.ring2 = this.getLodestoneEquipmentPiece(lodestoneGear, 'Ring2', itemMeldingData, hqFlags);
        gearset.crystal = this.getLodestoneEquipmentPiece(lodestoneGear, 'SoulCrystal', itemMeldingData, hqFlags);
        return gearset;
      })
    );
  }

  public applyEquipSlotChanges(gearset: TeamcraftGearset, itemId: number): Observable<TeamcraftGearset> {
    return combineLatest([
      this.lazyData.getEntry('equipSlotCategories'),
      this.lazyData.getEntry('itemEquipSlotCategory')
    ]).pipe(
      map(([equipSlotCategories, itemEquipSlotCategory]) => {
        const equipSlotCategory = equipSlotCategories[itemEquipSlotCategory[itemId]];
        if (!equipSlotCategory) {
          return gearset;
        }
        Object.keys(equipSlotCategory)
          .filter(key => +equipSlotCategory[key] === -1)
          .forEach(key => {
            delete gearset[this.getPropertyNameFromCategoryName(key)];
          });
        return gearset;
      })
    );
  }

  public getPropertyName(slot: number): string {
    return [
      'mainHand',
      'offHand',
      'head',
      'chest',
      'gloves',
      'belt',
      'legs',
      'feet',
      'earRings',
      'necklace',
      'bracelet',
      'ring2',
      'ring1',
      'crystal'
    ][slot];
  }

  @Memoized()
  public getPropertyNameFromCategoryName(slotName: string): keyof TeamcraftGearset {
    switch (slotName) {
      case 'Body':
        return 'chest';
      case 'Ears':
        return 'earRings';
      case 'Feet':
        return 'feet';
      case 'FingerL':
        return 'ring1';
      case 'FingerR':
        return 'ring2';
      case 'Gloves':
        return 'gloves';
      case 'Head':
        return 'head';
      case 'Legs':
        return 'legs';
      case 'MainHand':
        return 'mainHand';
      case 'Neck':
        return 'necklace';
      case 'OffHand':
        return 'offHand';
      case 'SoulCrystal':
        return 'crystal';
      case 'Waist':
        return 'belt';
      case 'Wrists':
        return 'bracelet';
    }
  }

  private getEtroEquipmentPiece(gearset: any, etroSlotName: string, lazyItemMeldingData: LazyData['itemMeldingData'], hqFlags: LazyData['hqFlags']): EquipmentPiece | null {
    const itemId = gearset[etroSlotName];
    if (itemId === null) {
      return null;
    }
    const itemMeldingData = lazyItemMeldingData[itemId];
    const canBeHq = hqFlags[itemId] === 1;
    const materias = Object.values<number>(gearset.materia[`${itemId}`] || gearset.materia[`${itemId}R`] || gearset.materia[`${itemId}L`] || {});
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
      hq: canBeHq
    };
  }

  private getAriyalaEquipmentPiece(dataset: any, ariyalaName: string, lazyItemMeldingData: LazyData['itemMeldingData'], hqFlags: LazyData['hqFlags'], lazyMaterias: LazyData['materias']): EquipmentPiece | null {
    const itemId = dataset.normal.items[ariyalaName];
    if (itemId === undefined) {
      return null;
    }
    const itemMeldingData = lazyItemMeldingData[itemId];
    const canBeHq = hqFlags[itemId] === 1;
    const materias = (dataset.normal.materiaData[`${ariyalaName}-${itemId}`] || []).map(row => this.getMateriaItemId(lazyMaterias, row)) as number[];
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
      hq: canBeHq
    };
  }

  private getLodestoneEquipmentPiece(gear: any, lodestoneName: string, lazyItemMeldingData: LazyData['itemMeldingData'], hqFlags: LazyData['hqFlags']): EquipmentPiece | null {
    const item = gear[lodestoneName];
    if (item === undefined) {
      return null;
    }
    const itemId = item.ID;
    const itemMeldingData = lazyItemMeldingData[itemId];
    const canBeHq = hqFlags[itemId] === 1;
    const materias = item.Materia;
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
      hq: canBeHq
    };
  }
}
