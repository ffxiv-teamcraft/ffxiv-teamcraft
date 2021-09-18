import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { GearsetsPartialState } from './gearsets.reducer';
import { gearsetsQuery } from './gearsets.selectors';
import {
  CreateGearset,
  DeleteGearset,
  ImportAriyalaGearset,
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
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable, of } from 'rxjs';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { StatsService } from '../stats.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { MateriaService } from '../materia.service';
import { Memoized } from '../../../core/decorators/memoized';
import { AriyalaLinkParser } from '../../../pages/lists/list-import-popup/link-parser/ariyala-link-parser';
import { HttpClient } from '@angular/common/http';
import { AriyalaMateria } from '../../../pages/lists/list-import-popup/link-parser/aryiala-materia';
import { XivapiService } from '@xivapi/angular-client';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';
import { EnvironmentService } from '../../../core/environment.service';

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
        return !gearset.notFound && gearset.getPermissionLevel(userId);
      })
    );

  constructor(private store: Store<GearsetsPartialState>, private authFacade: AuthFacade,
              private statsService: StatsService, private lazyData: LazyDataService,
              private materiasService: MateriaService, private http: HttpClient,
              private xivapi: XivapiService, private env: EnvironmentService) {
  }

  toArray(gearset: TeamcraftGearset): { piece: EquipmentPiece, slot: string }[] {
    return [
      { piece: gearset.mainHand, slot: 'mainHand' },
      { piece: gearset.offHand, slot: 'offHand' },
      { piece: gearset.head, slot: 'head' },
      ...this.env.gameVersion < 60 ? [{ piece: gearset.chest, slot: 'chest' }] : [],
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
        gearset.job = +Object.keys(this.lazyData.data.jobAbbr).find(k => this.lazyData.data.jobAbbr[k].en.toLowerCase() === data.content.toLowerCase()) || +Object.keys(this.lazyData.data.jobName).find(k => this.lazyData.data.jobName[k].en.toLowerCase() === data.content.toLowerCase());
        gearset.name = url;
        gearset.mainHand = this.getAriyalaEquipmentPiece(dataset, 'mainhand');
        gearset.offHand = this.getAriyalaEquipmentPiece(dataset, 'offhand');
        gearset.head = this.getAriyalaEquipmentPiece(dataset, 'head');
        gearset.chest = this.getAriyalaEquipmentPiece(dataset, 'chest');
        gearset.gloves = this.getAriyalaEquipmentPiece(dataset, 'hands');
        if (this.env.gameVersion < 6) {
          gearset.belt = this.getAriyalaEquipmentPiece(dataset, 'waist');
        }
        gearset.legs = this.getAriyalaEquipmentPiece(dataset, 'legs');
        gearset.feet = this.getAriyalaEquipmentPiece(dataset, 'feet');
        gearset.earRings = this.getAriyalaEquipmentPiece(dataset, 'ears');
        gearset.necklace = this.getAriyalaEquipmentPiece(dataset, 'neck');
        gearset.bracelet = this.getAriyalaEquipmentPiece(dataset, 'wrist');
        gearset.ring1 = this.getAriyalaEquipmentPiece(dataset, 'ringLeft');
        gearset.ring2 = this.getAriyalaEquipmentPiece(dataset, 'ringRight');
        gearset.crystal = this.getAriyalaEquipmentPiece(dataset, 'soulCrystal');
        if (dataset.normal.items.food) {
          gearset.food = this.lazyData.data.foods.find(food => food.ID === dataset.normal.items.food);
          if (gearset.food) {
            gearset.food.HQ = true;
          }
        }
        return gearset;
      }),
      catchError(() => of(null))
    );
  }

  private getAriyalaEquipmentPiece(dataset: any, ariyalaName: string): EquipmentPiece | null {
    const itemId = dataset.normal.items[ariyalaName];
    if (itemId === undefined) {
      return null;
    }
    const itemMeldingData = this.lazyData.data.itemMeldingData[itemId];
    const canBeHq = this.lazyData.data.hqFlags[itemId] === 1;
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
      hq: canBeHq
    };
  }

  private getLodestoneEquipmentPiece(gear: any, lodestoneName: string): EquipmentPiece | null {
    const item = gear[lodestoneName];
    if (item === undefined) {
      return null;
    }
    const itemId = item.ID;
    const itemMeldingData = this.lazyData.data.itemMeldingData[itemId];
    const canBeHq = this.lazyData.data.hqFlags[itemId] === 1;
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

  fromLodestone(lodestoneId: number): Observable<TeamcraftGearset> {
    return this.xivapi.getCharacter(
      lodestoneId,
      {
        extraQueryParams: {
          data: 'cj'
        }
      }
    ).pipe(
      map(data => {
        const lodestoneGear = data.Character.GearSet.Gear;
        const gearset = new TeamcraftGearset();
        gearset.job = data.Character.ActiveClassJob.JobID;
        gearset.name = data.Character.Name;
        gearset.mainHand = this.getLodestoneEquipmentPiece(lodestoneGear, 'MainHand');
        gearset.offHand = this.getLodestoneEquipmentPiece(lodestoneGear, 'OffHand');
        gearset.head = this.getLodestoneEquipmentPiece(lodestoneGear, 'Head');
        gearset.chest = this.getLodestoneEquipmentPiece(lodestoneGear, 'Body');
        gearset.gloves = this.getLodestoneEquipmentPiece(lodestoneGear, 'Hands');
        if (this.env.gameVersion < 6) {
          gearset.belt = this.getLodestoneEquipmentPiece(lodestoneGear, 'Waist');
        }
        gearset.legs = this.getLodestoneEquipmentPiece(lodestoneGear, 'Legs');
        gearset.feet = this.getLodestoneEquipmentPiece(lodestoneGear, 'Feet');
        gearset.earRings = this.getLodestoneEquipmentPiece(lodestoneGear, 'Earrings');
        gearset.necklace = this.getLodestoneEquipmentPiece(lodestoneGear, 'Necklace');
        gearset.bracelet = this.getLodestoneEquipmentPiece(lodestoneGear, 'Bracelets');
        gearset.ring1 = this.getLodestoneEquipmentPiece(lodestoneGear, 'Ring1');
        gearset.ring2 = this.getLodestoneEquipmentPiece(lodestoneGear, 'Ring2');
        gearset.crystal = this.getLodestoneEquipmentPiece(lodestoneGear, 'SoulCrystal');
        return gearset;
      })
    );
  }

  public applyEquipSlotChanges(gearset: TeamcraftGearset, itemId: number): TeamcraftGearset {
    const equipSlotCategory = this.lazyData.data.equipSlotCategories[this.lazyData.data.itemEquipSlotCategory[itemId]];
    if (!equipSlotCategory) {
      return gearset;
    }
    Object.keys(equipSlotCategory)
      .filter(key => +equipSlotCategory[key] === -1)
      .forEach(key => {
        delete gearset[this.getPropertyNameFromCategoryName(key)];
      });
    return gearset;
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
}
