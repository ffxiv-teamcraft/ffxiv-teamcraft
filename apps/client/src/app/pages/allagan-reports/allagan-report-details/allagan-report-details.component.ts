import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AllaganReportsService } from '../allagan-reports.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { AllaganReportSource } from '../allagan-report-source';
import { Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

// noinspection JSMismatchedCollectionQueryUpdate
@Component({
  selector: 'app-allagan-report-details',
  templateUrl: './allagan-report-details.component.html',
  styleUrls: ['./allagan-report-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportDetailsComponent {

  source: AllaganReportSource;
  voyageType: string;
  AllaganReportSource = AllaganReportSource;

  itemId$ = this.route.paramMap.pipe(
    map(params => +params.get('itemId'))
  );

  itemDetails$ = this.itemId$.pipe(
    switchMap(itemId => {
      return this.allaganReportsService.getItemReports(itemId).pipe(
        map(reports => {
          return {
            ...reports.data,
            isFish: this.lazyData.data.fishes.includes(itemId)
          };
        })
      );
    })
  );

  sources = Object.keys(AllaganReportSource)
    .filter(key => !isNaN(+key))
    .map(key => ({ key: +key, value: AllaganReportSource[key] }));

  private items: { id: number, name: I18nName }[] = [];
  private instances: { id: number, name: I18nName }[] = [];
  private ventures: { id: number, name: I18nName }[] = [];
  private submarineVoyages: { id: number, name: I18nName }[] = [];
  private airshipVoyages: { id: number, name: I18nName }[] = [];
  private mobs: { id: number, name: I18nName }[] = [];

  public itemInput$: Subject<string> = new Subject<string>();

  public itemCompletion$ = this.makeCompletionObservable(this.itemInput$, 'items');

  public instanceInput$: Subject<string> = new Subject<string>();

  public instanceCompletion$ = this.makeCompletionObservable(this.instanceInput$, 'instances');

  public ventureInput$: Subject<string> = new Subject<string>();

  public ventureCompletion$ = this.makeCompletionObservable(this.ventureInput$, 'ventures');

  public mobInput$: Subject<string> = new Subject<string>();

  public mobCompletion$ = this.makeCompletionObservable(this.mobInput$, 'mobs');

  public voyageInput$: Subject<string> = new Subject<string>();

  public voyageCompletion$ = this.voyageInput$.pipe(
    debounceTime(500),
    map(value => {
      if (value.length < 2) {
        return [];
      } else {
        return [this.airshipVoyages, this.submarineVoyages][this.voyageType].filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
      }
    })
  );

  constructor(private route: ActivatedRoute, private allaganReportsService: AllaganReportsService,
              private lazyData: LazyDataService, private i18n: I18nToolsService) {
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.data.items)
      .filter(key => +key > 1)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });

    this.instances = Object.keys(this.lazyData.data.instances)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.instances[key]
        };
      });

    this.ventures = Object.keys(this.lazyData.data.ventures)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.ventures[key]
        };
      });

    this.airshipVoyages = Object.keys(this.lazyData.data.airshipVoyages)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.airshipVoyages[key]
        };
      });

    this.submarineVoyages = Object.keys(this.lazyData.data.submarineVoyages)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.submarineVoyages[key]
        };
      });

    this.mobs = Object.keys(this.lazyData.data.mobs)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.mobs[key]
        };
      });
  }

  private makeCompletionObservable(subject: Subject<string>, registryKey: keyof Extract<AllaganReportDetailsComponent, { id: number, name: I18nName }[]>): Observable<{ id: number, name: I18nName }[]> {
    return subject.pipe(
      debounceTime(500),
      map(value => {
        if (value.length < 2) {
          return [];
        } else {
          return this[registryKey].filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
        }
      })
    );
  }

  addSource(data: any): void {
    console.log(data);
  }

  needsItem(source: AllaganReportSource): boolean {
    return [AllaganReportSource.DESYNTH, AllaganReportSource.REDUCTION, AllaganReportSource.GARDENING, AllaganReportSource.LOOT].includes(source);
  }
}
