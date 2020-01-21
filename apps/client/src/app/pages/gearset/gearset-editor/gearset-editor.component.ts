import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { SearchAlgo, SearchIndex, XivapiSearchFilter, XivapiService } from '@xivapi/angular-client';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { chunk } from 'lodash';
import { EquipmentPiece } from '../../../model/gearset/equipment-piece';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd';
import { MateriasPopupComponent } from '../materias-popup/materias-popup.component';
import { MateriasService } from '../materias.service';

@Component({
  selector: 'app-gearset-editor',
  templateUrl: './gearset-editor.component.html',
  styleUrls: ['./gearset-editor.component.less']
})
export class GearsetEditorComponent extends TeamcraftComponent implements OnInit {

  itemFiltersform: FormGroup = this.fb.group({
    ilvlMin: [360],
    ilvlMax: [999],
    elvlMin: [1],
    elvlMax: [80]
  });

  public filters$ = new ReplaySubject<XivapiSearchFilter[]>();

  public gearset$: Observable<TeamcraftGearset> = this.gearsetsFacade.selectedGearset$;

  private job$: Observable<number> = this.gearset$.pipe(
    filter(gearset => {
      return gearset && !gearset.notFound;
    }),
    map(gearset => gearset.job),
    distinctUntilChanged()
  );

  public items$: Observable<any[]> = combineLatest([this.filters$, this.job$]).pipe(
    switchMap(([filters, job]) => {
      return this.xivapi.search({
        indexes: [SearchIndex.ITEM],
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
        string_algo: SearchAlgo.WILDCARD_PLUS,
        limit: 250
      });
    }),
    withLatestFrom(this.gearset$),
    map(([response, gearset]) => {
      return response.Results.reduce((resArray, item) => {
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
            materias: this.getMaterias(item),
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
      }, [])
        .sort((a, b) => {
          return a.index - b.index;
        });
    }),
    map(categories => {
      return chunk(categories, 2);
    })
  );

  public stats$: Observable<{ id: number, value: number }[]> = this.gearset$.pipe(
    map(set => {
      //TODO make this change based on job
      const stats = [
        {
          id: 70,
          value: 0
        },
        {
          id: 71,
          value: 0
        },
        {
          id: 11,
          value: 160
        }
      ];
      Object.values(set)
        .filter(value => value && value.itemId !== undefined)
        .forEach((equipmentPiece: EquipmentPiece) => {
          const itemStats = this.lazyData.data.itemStats[equipmentPiece.itemId];
          Object.values(itemStats)
            .filter((stat: any) => stat.ID !== undefined)
            .forEach((stat: any) => {
              let statsRow = stats.find(s => s.id === stat.ID);
              if (statsRow === undefined) {
                stats.push({
                  id: stat.ID,
                  // TODO getStartValue?
                  value: 0
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
                  // TODO getStartValue?
                  value: 0
                });
                statsRow = stats[stats.length - 1];
              }
              statsRow.value += bonus.value;
            });
        });
      return stats;
    })
  );

  constructor(private fb: FormBuilder, private gearsetsFacade: GearsetsFacade,
              private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private l12n: LocalizedDataService, private lazyData: LazyDataService,
              public translate: TranslateService, private dialog: NzModalService,
              private  materiasService: MateriasService) {
    super();
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

  private getMaterias(item: any): number[] {
    const cache = JSON.parse(localStorage.getItem('materias') || '{}');
    if (cache[item.ID]) {
      return cache[item.ID];
    }
    if (item.MateriaSlotCount > 0) {
      return [0, 0, 0, 0, 0];
    }
    return [];
  }

  setGearsetPiece(gearset: TeamcraftGearset, property: string, equipmentPiece: EquipmentPiece): void {
    gearset[property] = equipmentPiece;
    this.gearsetsFacade.update(gearset.$key, gearset);
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

  public editMaterias(gearset: TeamcraftGearset, propertyName: string, equipmentPiece: EquipmentPiece): void {
    const clone = JSON.parse(JSON.stringify(equipmentPiece));
    this.dialog.create({
      nzTitle: this.translate.instant('GEARSETS.Modal_editor'),
      nzContent: MateriasPopupComponent,
      nzComponentParams: {
        equipmentPiece: equipmentPiece,
        job: gearset.job
      },
      nzFooter: null
    }).afterClose
      .subscribe((res) => {
        if (res) {
          this.setGearsetPiece(gearset, propertyName, res);
        } else {
          Object.assign(equipmentPiece, clone);
        }
      });
  }
}
