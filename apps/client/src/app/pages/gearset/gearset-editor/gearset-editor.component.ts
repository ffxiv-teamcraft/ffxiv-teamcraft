import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { distinctUntilChanged, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { SearchAlgo, SearchIndex, XivapiSearchFilter, XivapiService } from '@xivapi/angular-client';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { chunk } from 'lodash';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd';
import { MateriasPopupComponent } from '../materias-popup/materias-popup.component';
import { MateriaService } from '../../../modules/gearsets/materia.service';
import { StatsService } from '../../../modules/gearsets/stats.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { Memoized } from '../../../core/decorators/memoized';
import { MateriasNeededPopupComponent } from '../materias-needed-popup/materias-needed-popup.component';
import { environment } from '../../../../environments/environment';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { IpcService } from '../../../core/electron/ipc.service';
import { ImportFromPcapPopupComponent } from '../../../modules/gearsets/import-from-pcap-popup/import-from-pcap-popup.component';

@Component({
  selector: 'app-gearset-editor',
  templateUrl: './gearset-editor.component.html',
  styleUrls: ['./gearset-editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GearsetEditorComponent extends TeamcraftComponent implements OnInit {

  public machinaToggle = false;

  itemFiltersform: FormGroup = this.fb.group({
    ilvlMin: [460],
    ilvlMax: [999],
    elvlMin: [1],
    elvlMax: [80]
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

  public filters$ = new ReplaySubject<XivapiSearchFilter[]>();

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$.pipe(
    tap(gearset => {
      const ilvls = this.gearsetsFacade.toArray(gearset).map(piece => this.lazyData.data.ilvls[piece.itemId]);
      const lowestIlvl = Math.min(...ilvls);
      const highestIlvl = Math.max(...ilvls);
      let didChange = false;
      if (this.itemFiltersform.value.ilvlMin > lowestIlvl) {
        this.itemFiltersform.controls.ilvlMin.patchValue(lowestIlvl);
        didChange = true;
      }
      if (this.itemFiltersform.value.ilvlMax < highestIlvl) {
        this.itemFiltersform.controls.ilvlMax.patchValue(highestIlvl);
        didChange = true;
      }
      if (didChange) {
        this.submitFilters();
      }
    })
  );

  private job$: Observable<number> = this.gearset$.pipe(
    filter(gearset => {
      return gearset && !gearset.notFound;
    }),
    map(gearset => gearset.job),
    distinctUntilChanged()
  );

  public items$: Observable<any[]> = combineLatest([this.filters$, this.job$]).pipe(
    switchMap(([filters, job]) => {
      const requests = [
        this.xivapi.search({
          indexes: [SearchIndex.ITEM],
          string_algo: SearchAlgo.QUERY_STRING,
          string: '-Dated*',
          string_column: 'Name_en',
          filters: [
            ...filters,
            {
              column: `ClassJobCategory.${this.l12n.getJobAbbr(job).en}`,
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
              column: `ClassJobCategory.${this.l12n.getJobAbbr(job).en}`,
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
      } else {
        requests.push(of({ Results: [] }));
      }
      return combineLatest(requests);
    }),
    switchMap(([response, crystal]) => {
      return this.gearset$.pipe(
        map(gearset => {
          const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
          const prepared = [...response.Results, ...crystal.Results]
            .filter(item => {
              return relevantStats.some(stat => {
                if (!gearset.isCombatSet()) {
                  return item.Stats && Object.values<any>(item.Stats).some(value => value.ID === stat);
                }
                return true;
              });
            })
            .reduce((resArray, item) => {
              const itemSlotName = Object.keys(item.EquipSlotCategory)
                .filter(key => key !== 'ID')
                .find(key => item.EquipSlotCategory[key] === 1);

              let arrayEntry = resArray.find(row => row.name === itemSlotName);
              const propertyName = this.getPropertyName(itemSlotName);
              if (arrayEntry === undefined) {
                resArray.push({
                  name: itemSlotName,
                  index: item.EquipSlotCategory.ID,
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
              return resArray;
            }, []);
          const fingerLCategory = prepared.find(category => category.index === 12);
          if (fingerLCategory) {
            prepared.push(JSON.parse(JSON.stringify({
              ...fingerLCategory,
              name: 'FingerR',
              property: this.getPropertyName('FingerR'),
              index: 12.1
            })));
          }
          return prepared
            .map(category => {
              category.items = category.items.sort((a, b) => {
                const aIlvl = this.lazyData.data.ilvls[a.equipmentPiece.itemId];
                const bIlvl = this.lazyData.data.ilvls[b.equipmentPiece.itemId];
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
    map(categories => {
      return chunk(categories, 2);
    })
  );

  public level$ = new BehaviorSubject<number>(80);

  public tribe$ = new BehaviorSubject<number>(1);

  public food$ = this.gearset$.pipe(
    map(gearset => {
      return gearset.food;
    })
  );

  public stats$: Observable<{ id: number, value: number }[]> = combineLatest([this.gearsetsFacade.selectedGearset$, this.level$, this.tribe$, this.food$]).pipe(
    map(([set, level, tribe, food]) => {
      return this.statsService.getStats(set, level, tribe, food);
    })
  );

  public foods$: Observable<any[]> = this.gearset$.pipe(
    first(),
    map(gearset => {
      const relevantStats = this.statsService.getRelevantBaseStats(gearset.job);
      return [].concat.apply([], this.lazyData.data.foods
        .filter(food => {
          return Object.values<any>(food.Bonuses).some(stat => relevantStats.indexOf(stat.ID) > -1);
        })
        .map(food => {
          return [{ ...food, HQ: false }, { ...food, HQ: true }];
        }));
    })
  );

  tribesMenu = this.gearsetsFacade.tribesMenu;

  maxLevel = environment.maxLevel;

  private _materiaCache = JSON.parse(localStorage.getItem('materias') || '{}');

  private get materiaCache(): any {
    return this._materiaCache;
  }

  private set materiaCache(cache: any) {
    this._materiaCache = cache;
    localStorage.setItem('materias', JSON.stringify(cache));
  }

  permissionLevel$: Observable<PermissionLevel> = this.gearsetsFacade.selectedGearsetPermissionLevel$;

  constructor(private fb: FormBuilder, private gearsetsFacade: GearsetsFacade,
              private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private l12n: LocalizedDataService, private lazyData: LazyDataService,
              public translate: TranslateService, private dialog: NzModalService,
              private  materiasService: MateriaService, private statsService: StatsService,
              private i18n: I18nToolsService, private ipc: IpcService, private router: Router) {
    super();
    this.permissionLevel$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(level => {
      if (level < PermissionLevel.WRITE) {
        this.router.navigate(['/gearsets']);
      }
    });
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.ipc.send('toggle-machina:get');
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
    this.submitFilters();
  }

  foodComparator(a: any, b: any): boolean {
    return a === b || ((a && a.ID) === (b && b.ID) && a.HQ === b.HQ);
  }

  private getMaterias(item: any, propertyName: string): number[] {
    if (this.materiaCache[`${item.ID}:${propertyName}`]) {
      return this.materiaCache[`${item.ID}:${propertyName}`];
    }
    if (item.MateriaSlotCount > 0) {
      if (item.IsAdvancedMeldingPermitted === 1) {
        return [0, 0, 0, 0, 0];
      }
      return new Array(item.MateriaSlotCount).fill(0);
    }
    return [];
  }

  @Memoized()
  private getPropertyName(slotName: string): keyof TeamcraftGearset {
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

  setGearsetPiece(gearset: TeamcraftGearset, property: string, equipmentPiece: EquipmentPiece): void {
    gearset[property] = equipmentPiece;
    this.gearsetsFacade.update(gearset.$key, equipmentPiece ? this.applyEquipSlotChanges(gearset, equipmentPiece.itemId) : gearset);
  }

  canEquipSlot(slotName: string, chestPieceId: number, legsPieceId: number): boolean {
    return this.gearsetsFacade.canEquipSlot(slotName, chestPieceId, legsPieceId);
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

  editMaterias(gearset: TeamcraftGearset, propertyName: string, equipmentPiece: EquipmentPiece): void {
    const clone = JSON.parse(JSON.stringify(equipmentPiece));
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.Modal_editor', { itemName: this.i18n.getName(this.l12n.getItem(equipmentPiece.itemId)) }),
      nzContent: MateriasPopupComponent,
      nzComponentParams: {
        equipmentPiece: equipmentPiece,
        job: gearset.job
      },
      nzFooter: null
    }).afterClose
      .subscribe((res) => {
        if (res && res.materias.some(m => m > 0)) {
          this.materiaCache = {
            ...this.materiaCache,
            [`${res.itemId}:${propertyName}`]: res.materias
          };
          equipmentPiece.materias = [...res.materias];
        }
        if (res && gearset[propertyName] && gearset[propertyName].itemId === res.itemId) {
          this.setGearsetPiece(gearset, propertyName, { ...res });
        } else if (!res) {
          Object.assign(equipmentPiece, clone);
        }
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
      this.gearsetsFacade.update(gearset.$key, gearset);
    });
  }

  rename(gearset: TeamcraftGearset): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzComponentParams: { baseName: gearset.name },
      nzFooter: null,
      nzTitle: this.translate.instant('GEARSETS.Rename_gearset')
    }).afterClose.pipe(
      filter(name => name !== undefined)
    ).subscribe(name => {
      gearset.name = name;
      this.gearsetsFacade.pureUpdate(gearset.$key, {
        name: gearset.name
      });
    });
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

  private applyEquipSlotChanges(gearset: TeamcraftGearset, itemId: number): TeamcraftGearset {
    const equipSlotCategory = this.lazyData.data.equipSlotCategories[this.lazyData.data.itemEquipSlotCategory[itemId]];
    if (!equipSlotCategory) {
      return gearset;
    }
    Object.keys(equipSlotCategory)
      .filter(key => +equipSlotCategory[key] === -1)
      .forEach(key => {
        delete gearset[this.getPropertyName(key)];
      });
    return gearset;
  }
}
