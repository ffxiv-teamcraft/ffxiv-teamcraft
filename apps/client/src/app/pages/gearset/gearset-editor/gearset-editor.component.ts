import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { distinctUntilChanged, distinctUntilKeyChanged, filter, first, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { chunk, uniqBy } from 'lodash';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MateriasPopupComponent } from '../materias-popup/materias-popup.component';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MateriasNeededPopupComponent } from '../materias-needed-popup/materias-needed-popup.component';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { IpcService } from '../../../core/electron/ipc.service';
import { ImportFromPcapPopupComponent } from '../../../modules/gearsets/import-from-pcap-popup/import-from-pcap-popup.component';
import { GearsetCostPopupComponent } from '../../../modules/gearsets/gearset-cost-popup/gearset-cost-popup.component';
import { GearsetCreationPopupComponent } from '../../../modules/gearsets/gearset-creation-popup/gearset-creation-popup.component';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { Memoized } from '../../../core/decorators/memoized';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { EnvironmentService } from '../../../core/environment.service';
import { StatDisplayPipe } from './stat-display.pipe';
import { FoodBonusesPipePipe } from '../../../pipes/pipes/food-bonuses.pipe';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { FloorPipe } from '../../../pipes/pipes/floor.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { GearsetEditorRowComponent } from '../gearset-editor-row/gearset-editor-row.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { SearchFilter, SearchType } from '@ffxiv-teamcraft/types';
import { DataService } from '../../../core/api/data.service';

@Component({
  selector: 'app-gearset-editor',
  templateUrl: './gearset-editor.component.html',
  styleUrls: ['./gearset-editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FlexModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NzPopconfirmModule, RouterLink, NzAlertModule, NzCollapseModule, FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzInputNumberModule, NzCardModule, NzTagModule, GearsetEditorRowComponent, NzDividerModule, PageLoaderComponent, NzSelectModule, AsyncPipe, DecimalPipe, TranslateModule, I18nPipe, I18nRowPipe, ItemNamePipe, FloorPipe, JobUnicodePipe, FoodBonusesPipePipe, StatDisplayPipe]
})
export class GearsetEditorComponent extends TeamcraftComponent implements OnInit {

  itemFiltersform: UntypedFormGroup = this.fb.group({
    ilvlMin: [this.environment.maxIlvl - 30],
    ilvlMax: [999],
    elvlMin: [1],
    elvlMax: [this.environment.maxLevel]
  });

  categoriesOrder: string[] = [
    'MainHand',
    'OffHand',
    'Head',
    'Body',
    'Gloves',
    'Waist',
    'Legs',
    'Feet',
    'Ears',
    'Neck',
    'Wrists',
    'FingerL',
    'FingerR',
    'SoulCrystal'
  ];

  missingItems: boolean;

  public filters$ = new ReplaySubject<SearchFilter[]>();

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$;

  public isReadonly$ = this.gearsetsFacade.selectedGearsetPermissionLevel$.pipe(
    map(permissionLevel => permissionLevel < PermissionLevel.WRITE)
  );

  public level$ = new BehaviorSubject<number>(this.environment.maxLevel);

  public tribe$ = new BehaviorSubject<number>(1);

  public food$ = this.gearset$.pipe(
    map(gearset => {
      return gearset.food;
    })
  );

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$, this.food$]).pipe(
    switchMap(([set, level, tribe, food]) => {
      return this.statsService.getStats(set, level, tribe, food);
    })
  );

  public foods$: Observable<any[]> = this.gearset$.pipe(
    first(),
    switchMap(gearset => {
      return this.lazyData.getEntry('foods')
        .pipe(
          map(foods => {
            return [gearset, foods];
          })
        );
    }),
    map(([gearset, foods]: [TeamcraftGearset, LazyData['foods']]) => {
      const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
      return [].concat.apply([], foods
        .filter(food => {
          return Object.values<any>(food.Bonuses).some(stat => relevantStats.indexOf(stat.ID) > -1);
        })
        .sort((a, b) => {
          return b.LevelItem - a.LevelItem;
        })
        .map(food => {
          return [{ ...food, HQ: true }, { ...food, HQ: false }];
        }));
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = this.environment.maxLevel;

  private job$: Observable<number> = this.gearset$.pipe(
    filter(gearset => {
      return gearset && !gearset.notFound;
    }),
    map(gearset => gearset.job),
    distinctUntilChanged()
  );

  public items$: Observable<any[]> = combineLatest([this.filters$, this.job$]).pipe(
    withLazyData(this.lazyData, 'jobAbbr'),
    switchMap(([[filters, job], jobAbbr]) => {
      const rawFilters: SearchFilter[] = [
        ...filters,
        {
          name: `cjc.${jobAbbr[job].en}`,
          value: 1
        }
      ];

      const requests = [
        this.dataService.search('', SearchType.ITEM, rawFilters, ['ilvl', 'desc'])
      ];
      if (job >= 8 && job <= 15) {
        // Soul Crystal
        requests.push(this.dataService.search('', SearchType.ITEM, [
          { name: 'category', value: 62 },
          { name: `cjc.${jobAbbr[job].en}`, value: 1 }
        ], ['ilvl', 'desc']));
      } else if (job === 18) {
        // If it's fisher, add spearfishing gig
        requests.push(this.dataService.search('', SearchType.ITEM, [
          { name: 'id', value: 17726 }
        ], ['ilvl', 'desc']));
      } else {
        requests.push(of([]));
      }
      return combineLatest(requests);
    }),
    switchMap(([response, crystal]) => {
      return this.gearset$.pipe(
        withLazyData(this.lazyData, 'ilvls', 'itemEquipSlotCategory', 'itemStats', 'equipSlotCategories', 'hqFlags', 'itemMeldingData'),
        map(([gearset, lazyIlvls, itemEquipSlotCategory, stats, equipSlotCategories, hqFlags, itemMeldingData]) => {
          const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
          const prepared = [...response, ...crystal]
            .filter(item => {
              return (this.environment.gameVersion < 6 || itemEquipSlotCategory[item.itemId] !== 6)
                && relevantStats.some(stat => {
                  if (!gearset.isCombatSet()) {
                    return stats[item.itemId] && Object.values(stats[item.itemId]).some(value => value.ID === stat);
                  }
                  return true;
                });
            })
            .reduce((resArray, item) => {
              const slotName = Object.keys(equipSlotCategories[itemEquipSlotCategory[item.itemId]])
                .find(key => equipSlotCategories[itemEquipSlotCategory[item.itemId]][key] === 1);

              const itemSlotNames = [slotName];

              if (slotName === 'FingerL') {
                itemSlotNames.push('FingerR');
              }

              itemSlotNames.forEach(itemSlotName => {
                let arrayEntry = resArray.find(row => row.name === itemSlotName);
                const propertyName = this.gearsetsFacade.getPropertyNameFromCategoryName(itemSlotName);
                if (arrayEntry === undefined) {
                  resArray.push({
                    name: itemSlotName,
                    index: itemSlotName === 'FingerR' ? 12.1 : itemEquipSlotCategory[item.itemId],
                    property: propertyName,
                    items: []
                  });
                  arrayEntry = resArray[resArray.length - 1];
                }

                const itemEntry = {
                  item: item,
                  equipmentPiece: {
                    itemId: item.itemId,
                    hq: hqFlags[item.itemId] === 1,
                    materias: this.getMaterias(item, propertyName, itemMeldingData),
                    materiaSlots: itemMeldingData[item.itemId].slots,
                    canOvermeld: itemMeldingData[item.itemId].overmeld
                  }
                };

                const equipmentPieceFromGearset: EquipmentPiece = gearset[propertyName] as EquipmentPiece;

                if (equipmentPieceFromGearset && equipmentPieceFromGearset.itemId === item.itemId) {
                  itemEntry.equipmentPiece = equipmentPieceFromGearset;
                }

                arrayEntry.items.push(itemEntry);
              });
              return resArray;
            }, []);
          return prepared
            .map(category => {
              category.items = uniqBy(category.items.sort((a, b) => {
                const aIlvl = lazyIlvls[a.equipmentPiece.itemId];
                const bIlvl = lazyIlvls[b.equipmentPiece.itemId];
                if (aIlvl === bIlvl) {
                  return b.equipmentPiece.itemId - a.equipmentPiece.itemId;
                }
                return aIlvl - bIlvl;
              }), (row: any) => row.equipmentPiece.itemId).slice(0, 20); // Max 20 items per category to avoid rendering issues.
              return category;
            })
            .sort((a, b) => {
              return this.categoriesOrder.indexOf(a.name) - this.categoriesOrder.indexOf(b.name);
            });
        })
      );
    }),
    tap(categories => {
      const mandatory = [
        'MainHand',
        'Head',
        'Body',
        'Gloves',
        ...(this.environment.gameVersion < 6 ? ['Waist'] : []),
        'Legs',
        'Feet',
        'Ears',
        'Neck',
        'Wrists',
        'FingerL',
        'FingerR'
      ];
      if (mandatory.some(name => !categories.some(c => c.name === name))) {
        this.missingItems = true;
      }
    }),
    map(categories => {
      return chunk(categories, 2);
    })
  );

  constructor(private fb: UntypedFormBuilder, private gearsetsFacade: GearsetsFacade,
              private activatedRoute: ActivatedRoute,
              private lazyData: LazyDataFacade, private cd: ChangeDetectorRef,
              public translate: TranslateService, private dialog: NzModalService,
              private statsService: StatsService, private i18n: I18nToolsService,
              public ipc: IpcService, private environment: EnvironmentService,
              private dataService: DataService) {
    super();
    this.gearset$.pipe(
      distinctUntilKeyChanged('$key'),
      switchMap(gearset => {
        return this.lazyData.getEntry('ilvls')
          .pipe(
            map(ilvls => {
              return [gearset, ilvls];
            })
          );
      })
    ).subscribe(([gearset, lazyIlvls]: [TeamcraftGearset, LazyData['ilvls']]) => {
      const gearsetArray = this.gearsetsFacade.toArray(gearset);
      // We're removing Spearfishing gig from the lowest ilvl filter.
      const ilvls = gearsetArray
        .filter(entry => entry.piece.itemId !== 17726)
        .map(entry => lazyIlvls[entry.piece.itemId]);
      let lowestIlvl = Math.min(...ilvls);
      let highestIlvl = Math.max(...ilvls) + 30;
      let usedDefaultValues = false;
      if (lowestIlvl === Infinity) {
        lowestIlvl = this.environment.maxIlvl - 30;
        usedDefaultValues = true;
      }
      if (highestIlvl === -Infinity) {
        highestIlvl = 999;
        usedDefaultValues = true;
      }
      let didChange = false;
      if (!usedDefaultValues) {
        if (lowestIlvl !== Infinity) {
          this.itemFiltersform.controls.ilvlMax.patchValue(highestIlvl);
          this.itemFiltersform.controls.ilvlMin.patchValue(lowestIlvl || 5);
        }
        didChange = true;
      }
      if (didChange) {
        this.submitFilters();
      }
      gearsetArray.forEach(row => {
        if (row.piece?.materias?.length > 0) {
          this.materiaCache = {
            ...this.materiaCache,
            [`${row.piece.itemId}:${row.slot}`]: {
              materias: row.piece.materias,
              date: Date.now()
            }
          };
        }
      });
    });
  }

  private _materiaCache = JSON.parse(localStorage.getItem('materias') || '{}');

  private get materiaCache(): any {
    return this._materiaCache;
  }

  private set materiaCache(cache: any) {
    this._materiaCache = cache;
    localStorage.setItem('materias', JSON.stringify(cache));
  }

  ngOnInit() {
    this.activatedRoute.paramMap
      .pipe(
        map(params => params.get('setId')),
        tap((setId: string) => this.gearsetsFacade.load(setId)),
        takeUntil(this.onDestroy$)
      )
      .subscribe(setId => {
        this.gearsetsFacade.select(setId);
      });
    const filters = localStorage.getItem('gearset:filters');
    if (filters) {
      this.itemFiltersform.patchValue(JSON.parse(filters), { emitEvent: false });
    }
    const cacheClone = { ...this.materiaCache };
    Object.entries<any>(cacheClone).forEach(([key, entry]) => {
      // Delete all cache entries older than one week.
      if (Date.now() - entry.date > 7 * 24 * 3600 * 100) {
        delete cacheClone[key];
      }
    });
    this.materiaCache = cacheClone;
    this.submitFilters();
  }

  foodComparator(a: any, b: any): boolean {
    return a === b || ((a && a.ID) === (b && b.ID) && a.HQ === b.HQ);
  }

  saveAsNew(gearset: TeamcraftGearset): void {
    gearset.fromSync = false;
    this.gearsetsFacade.createGearset(gearset);
  }

  setGearsetPiece(gearset: TeamcraftGearset, property: string, equipmentPiece: EquipmentPiece): void {
    if (gearset[property]) {
      this.materiaCache = {
        ...this.materiaCache,
        [`${gearset.$key}:${gearset[property].itemId}:${property}`]: {
          materias: gearset[property].materias,
          date: Date.now()
        }
      };
    }
    gearset[property] = equipmentPiece;
    if (equipmentPiece) {
      this.gearsetsFacade.applyEquipSlotChanges(gearset, equipmentPiece.itemId)
        .subscribe(updated => this.saveChanges(updated));
    } else {
      this.saveChanges(gearset);
    }
  }

  saveChanges(gearset: TeamcraftGearset): void {
    this.isReadonly$.pipe(
      first()
    ).subscribe(isReadonly => {
      const clone = new TeamcraftGearset();
      Object.assign(clone, gearset);
      this.gearsetsFacade.update(clone.$key, clone, isReadonly);
    });
  }

  @Memoized()
  canEquipSlot(slotName: string, chestPieceId: number, legsPieceId: number): Observable<boolean> {
    return this.gearsetsFacade.canEquipSlot(slotName, chestPieceId, legsPieceId).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  submitFilters(): void {
    const rawValue = this.itemFiltersform.getRawValue();
    localStorage.setItem('gearset:filters', JSON.stringify(rawValue));
    const filters: SearchFilter[] = [
      {
        name: 'ilvl',
        minMax: true,
        value: { min: rawValue.ilvlMin, max: rawValue.ilvlMax }
      },
      {
        name: 'elvl',
        minMax: true,
        value: { min: rawValue.elvlMin, max: rawValue.elvlMax }
      },
      {
        name: 'category',
        minMax: true,
        value: { min: 0, max: 999999999 }
      }
    ];
    this.filters$.next(filters);
  }

  editMaterias(gearset: TeamcraftGearset, propertyName: string, equipmentPiece: EquipmentPiece, category: any): void {
    const clone = JSON.parse(JSON.stringify(equipmentPiece));
    this.i18n.getNameObservable('items', equipmentPiece.itemId).pipe(
      first(),
      switchMap(itemName => {
        return this.dialog.create({
          nzTitle: this.translate.instant('GEARSETS.Modal_editor', { itemName }),
          nzContent: MateriasPopupComponent,
          nzData: {
            equipmentPiece: equipmentPiece,
            job: gearset.job
          },
          nzFooter: null
        }).afterClose;
      })
    ).subscribe(res => {
      if (res) {
        this.materiaCache = {
          ...this.materiaCache,
          [`${res.itemId}:${propertyName}`]: {
            materias: res.materias,
            date: Date.now()
          }
        };
        equipmentPiece.materias = [...res.materias];
      }
      if (res && gearset[propertyName] && gearset[propertyName].itemId === res.itemId) {
        this.setGearsetPiece(gearset, propertyName, { ...res });
      } else if (res) {
        category.items = category.items.map(item => {
          if (item.equipmentPiece.itemId === equipmentPiece.itemId) {
            return {
              ...item,
              equipmentPiece: { ...res }
            };
          }
          return item;
        });
      } else {
        Object.assign(equipmentPiece, clone);
      }
      this.cd.detectChanges();
    });
  }

  openTotalNeededPopup(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.Total_materias_needed'),
      nzContent: MateriasNeededPopupComponent,
      nzData: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

  openTotalCostPopup(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.Total_cost'),
      nzContent: GearsetCostPopupComponent,
      nzData: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

  updateFromPcap(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzContent: ImportFromPcapPopupComponent,
      nzData: {
        job: gearset.job,
        gearsetName: gearset.name,
        updateMode: true
      },
      nzFooter: null,
      nzTitle: this.translate.instant('GEARSETS.Update_from_pcap')
    }).afterClose.pipe(
      first()
    ).subscribe(res => {
      Object.assign(gearset, res);
      this.saveChanges(gearset);
    });
  }

  edit(gearset: TeamcraftGearset): void {
    const clone = new TeamcraftGearset();
    Object.assign(clone, JSON.parse(JSON.stringify(gearset)));
    this.dialog.create({
      nzContent: GearsetCreationPopupComponent,
      nzData: { gearset: clone },
      nzFooter: null,
      nzTitle: this.translate.instant('GEARSETS.Edit_gearset')
    }).afterClose.pipe(
      filter(res => res !== undefined)
    ).subscribe((res: TeamcraftGearset) => {
      gearset.name = res.name;
      if (res.job !== gearset.job) {
        gearset.job = res.job;
        delete res.crystal;
        delete res.offHand;
        delete res.mainHand;
      }
      this.saveChanges(gearset);
    });
  }

  emptyMaterias(gearset: TeamcraftGearset): void {
    Object.keys(gearset)
      .filter(key => gearset[key]?.itemId)
      .forEach(key => {
        gearset[key].materias = gearset[key].materias.map(() => 0);
      });
    this.saveChanges(gearset);
  }

  private getMaterias(item: any, propertyName: string, itemMeldingData: LazyData['itemMeldingData']): number[] {
    if (this.materiaCache[`${item.itemId}:${propertyName}`]) {
      return this.materiaCache[`${item.itemId}:${propertyName}`].materias;
    }
    const meldingData = itemMeldingData[item.itemId];
    if (meldingData.slots > 0) {
      if (meldingData.overmeld) {
        return [0, 0, 0, 0, 0];
      }
      return new Array(meldingData.slots).fill(0);
    }
    return [];
  }
}
