import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { distinctUntilChanged, expand, filter, first, last, map, shareReplay, switchMap, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, ReplaySubject, timer } from 'rxjs';
import { SearchAlgo, SearchIndex, XivapiSearchFilter, XivapiService } from '@xivapi/angular-client';
import { chunk } from 'lodash';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MateriasPopupComponent } from '../materias-popup/materias-popup.component';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { MateriasNeededPopupComponent } from '../materias-needed-popup/materias-needed-popup.component';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { IpcService } from '../../../core/electron/ipc.service';
import { ImportFromPcapPopupComponent } from '../../../modules/gearsets/import-from-pcap-popup/import-from-pcap-popup.component';
import { GearsetCostPopupComponent } from '../../../modules/gearsets/gearset-cost-popup/gearset-cost-popup.component';
import { GearsetCreationPopupComponent } from '../../../modules/gearsets/gearset-creation-popup/gearset-creation-popup.component';
import { XivapiSearchOptions } from '@xivapi/angular-client/src/model';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { LazyData } from '../../../lazy-data/lazy-data';
import { Memoized } from '../../../core/decorators/memoized';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { EnvironmentService } from '../../../core/environment.service';

@Component({
  selector: 'app-gearset-editor',
  templateUrl: './gearset-editor.component.html',
  styleUrls: ['./gearset-editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GearsetEditorComponent extends TeamcraftComponent implements OnInit {

  public machinaToggle = false;

  itemFiltersform: FormGroup = this.fb.group({
    ilvlMin: [540],
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

  public filters$ = new ReplaySubject<XivapiSearchFilter[]>();

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
      const xivapiFilters: XivapiSearchFilter[] = [
        ...filters,
        {
          column: `ClassJobCategory.${jobAbbr[job].en}`,
          operator: '=',
          value: 1
        }
      ];
      const requests = [
        this.fullSearchResults({
          indexes: [SearchIndex.ITEM],
          string_algo: SearchAlgo.QUERY_STRING,
          string: '-Dated*',
          string_column: 'Name_en',
          filters: xivapiFilters,
          columns: [
            'ID',
            'Name_*',
            'Icon',
            'EquipSlotCategory',
            'BaseParamModifier',
            'IsAdvancedMeldingPermitted',
            'BaseParam*',
            'MateriaSlotCount',
            'LevelItem',
            'LevelEquip',
            'Stats',
            'CanBeHq'
          ],
          limit: 250
        })
      ];
      if (job >= 8 && job <= 15) {
        requests.push(this.xivapi.search({
          indexes: [SearchIndex.ITEM],
          filters: [
            {
              column: 'EquipSlotCategory.SoulCrystal',
              operator: '=',
              value: 1
            }, {
              column: 'ItemUICategoryTargetID',
              operator: '=',
              value: 62
            },
            {
              column: `ClassJobCategory.${jobAbbr[job].en}`,
              operator: '=',
              value: 1
            }
          ],
          columns: [
            'ID',
            'Name_*',
            'Icon',
            'EquipSlotCategory',
            'BaseParamModifier',
            'IsAdvancedMeldingPermitted',
            'MateriaSlotCount',
            'LevelItem',
            'LevelEquip',
            'Stats',
            'CanBeHq'
          ],
          limit: 250
        }));
      } else if (job === 18) {
        // If it's fisher, add spearfishing gig
        requests.push(this.xivapi.search({
          indexes: [SearchIndex.ITEM],
          filters: [
            {
              column: 'ID',
              operator: '=',
              value: 17726
            }
          ],
          columns: [
            'ID',
            'Name_*',
            'Icon',
            'EquipSlotCategory',
            'BaseParamModifier',
            'IsAdvancedMeldingPermitted',
            'MateriaSlotCount',
            'LevelItem',
            'LevelEquip',
            'Stats',
            'CanBeHq'
          ],
          limit: 250
        }));
      } else {
        requests.push(of({ Results: [] }));
      }
      return combineLatest(requests);
    }),
    switchMap(([response, crystal]) => {
      return this.gearset$.pipe(
        switchMap(gearset => {
          return this.lazyData.getEntry('ilvls')
            .pipe(
              map(ilvls => {
                return [gearset, ilvls];
              })
            );
        }),
        map(([gearset, lazyIlvls]: [TeamcraftGearset, LazyData['ilvls']]) => {
          const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
          const prepared = [...response.Results, ...crystal.Results]
            .filter(item => {
              return (this.environment.gameVersion < 6 || item.EquipSlotCategory.ID !== 6)
                && relevantStats.some(stat => {
                  if (!gearset.isCombatSet()) {
                    return item.Stats && Object.values<any>(item.Stats).some(value => value.ID === stat);
                  }
                  return true;
                });
            })
            .reduce((resArray, item) => {
              const slotName = Object.keys(item.EquipSlotCategory)
                .filter(key => key !== 'ID')
                .find(key => item.EquipSlotCategory[key] === 1);

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
                    index: itemSlotName === 'FingerR' ? 12.1 : item.EquipSlotCategory.ID,
                    property: propertyName,
                    items: []
                  });
                  arrayEntry = resArray[resArray.length - 1];
                }

                const itemEntry = {
                  item: item,
                  equipmentPiece: {
                    itemId: item.ID,
                    hq: item.CanBeHq === 1,
                    materias: this.getMaterias(item, propertyName),
                    materiaSlots: item.MateriaSlotCount,
                    canOvermeld: item.IsAdvancedMeldingPermitted === 1
                  }
                };

                const equipmentPieceFromGearset: EquipmentPiece = gearset[propertyName] as EquipmentPiece;

                if (equipmentPieceFromGearset && equipmentPieceFromGearset.itemId === item.ID) {
                  itemEntry.equipmentPiece = equipmentPieceFromGearset;
                }

                arrayEntry.items.push(itemEntry);
              });
              return resArray;
            }, []);
          return prepared
            .map(category => {
              category.items = category.items.sort((a, b) => {
                const aIlvl = lazyIlvls[a.equipmentPiece.itemId];
                const bIlvl = lazyIlvls[b.equipmentPiece.itemId];
                if (aIlvl === bIlvl) {
                  return b.item.ID - a.item.Id;
                }
                return aIlvl - bIlvl;
              });
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

  constructor(private fb: FormBuilder, private gearsetsFacade: GearsetsFacade,
              private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private lazyData: LazyDataFacade, private cd: ChangeDetectorRef,
              public translate: TranslateService, private dialog: NzModalService,
              private materiasService: MateriaService, private statsService: StatsService,
              private i18n: I18nToolsService, private ipc: IpcService, private environment: EnvironmentService) {
    super();
    this.gearset$.pipe(
      first(),
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
        lowestIlvl = 460;
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
          this.itemFiltersform.controls.ilvlMin.patchValue(lowestIlvl);
        }
        didChange = true;
      } else if (!usedDefaultValues) {
        if (this.itemFiltersform.value.ilvlMin > lowestIlvl) {
          this.itemFiltersform.controls.ilvlMin.patchValue(lowestIlvl);
          didChange = true;
        }
        if (this.itemFiltersform.value.ilvlMax < highestIlvl) {
          this.itemFiltersform.controls.ilvlMax.patchValue(highestIlvl);
          didChange = true;
        }
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
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('toggle-machina:get');
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
    localStorage.setItem('gearset:filters', JSON.stringify(this.itemFiltersform.getRawValue()));
    const controls = this.itemFiltersform.controls;
    const filters: XivapiSearchFilter[] = [
      {
        column: 'LevelItem',
        operator: '>=',
        value: controls.ilvlMin.value
      },
      {
        column: 'LevelItem',
        operator: '<=',
        value: controls.ilvlMax.value
      },
      {
        column: 'LevelEquip',
        operator: '>=',
        value: controls.elvlMin.value
      },
      {
        column: 'LevelEquip',
        operator: '<=',
        value: controls.elvlMax.value
      },
      {
        column: 'EquipSlotCategoryTargetID',
        operator: '>',
        value: 0
      }
    ];
    this.filters$.next(filters);
  }

  editMaterias(gearset: TeamcraftGearset, propertyName: string, equipmentPiece: EquipmentPiece, category: any): void {
    const clone = JSON.parse(JSON.stringify(equipmentPiece));
    this.i18n.getNameObservable('items', equipmentPiece.itemId).pipe(
      switchMap(itemName => {
        return this.dialog.create({
          nzTitle: this.translate.instant('GEARSETS.Modal_editor', { itemName }),
          nzContent: MateriasPopupComponent,
          nzComponentParams: {
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
      } else if (!!res) {
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
      nzComponentParams: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

  openTotalCostPopup(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.Total_cost'),
      nzContent: GearsetCostPopupComponent,
      nzComponentParams: {
        gearset: gearset
      },
      nzFooter: null
    });
  }

  updateFromPcap(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzContent: ImportFromPcapPopupComponent,
      nzComponentParams: {
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
      nzComponentParams: { gearset: clone },
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

  trackByItemId(index: number, row: any): number {
    return row.item.ID;
  }

  trackByCategory(index: number, row: any): string {
    return row.name;
  }

  trackByChunk(index: number): number {
    return index;
  }

  private fullSearchResults(options: XivapiSearchOptions): Observable<{ Results: any[] }> {
    return this.xivapi.search(options).pipe(
      expand((response) => {
        if (response.Pagination.PageNext) {
          return timer(200).pipe(
            first(),
            switchMapTo(this.xivapi.search({
                ...options,
                page: response.Pagination.PageNext
              }).pipe(
                map(res => {
                  return {
                    ...res,
                    Results: [
                      ...response.Results,
                      ...res.Results
                    ]
                  };
                })
              )
            )
          );
        }
        return EMPTY;
      }),
      last()
    );
  }

  private getMaterias(item: any, propertyName: string): number[] {
    if (this.materiaCache[`${item.ID}:${propertyName}`]) {
      return this.materiaCache[`${item.ID}:${propertyName}`].materias;
    }
    if (item.MateriaSlotCount > 0) {
      if (item.IsAdvancedMeldingPermitted === 1) {
        return [0, 0, 0, 0, 0];
      }
      return new Array(item.MateriaSlotCount).fill(0);
    }
    return [];
  }
}
