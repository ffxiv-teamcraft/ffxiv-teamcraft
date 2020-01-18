import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GearsetsFacade } from '../../../modules/gearsets/+state/gearsets.facade';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { ActivatedRoute } from '@angular/router';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { SearchAlgo, SearchIndex, XivapiSearchFilter, XivapiService } from '@xivapi/angular-client';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { chunk } from 'lodash';

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
          'IsAdvancedMeldingPermitted',
          'BaseParam*',
          'MateriaSlotCount',
          'LevelItem',
          'LevelEquip',
          'Stats'
        ],
        string_algo: SearchAlgo.WILDCARD_PLUS,
        limit: 250
      });
    }),
    map(response => {
      return response.Results.reduce((resArray, item) => {
        const itemSlotName = Object.keys(item.EquipSlotCategory)
          .filter(key => key !== 'ID')
          .find(key => item.EquipSlotCategory[key] === 1);

        let arrayEntry = resArray.find(row => row.name === itemSlotName);
        if (arrayEntry === undefined) {
          resArray.push({
            name: itemSlotName,
            index: item.EquipSlotCategory.ID,
            items: []
          });
          arrayEntry = resArray[resArray.length - 1];
        }
        arrayEntry.items.push(item);
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

  constructor(private fb: FormBuilder, private gearsetsFacade: GearsetsFacade,
              private activatedRoute: ActivatedRoute, private xivapi: XivapiService,
              private l12n: LocalizedDataService) {
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

}
