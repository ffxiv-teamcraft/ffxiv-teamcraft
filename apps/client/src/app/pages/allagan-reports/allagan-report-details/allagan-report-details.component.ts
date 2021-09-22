import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AllaganReportsService } from '../allagan-reports.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { AllaganReportSource } from '../model/allagan-report-source';
import { Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { AllaganReport } from '../model/allagan-report';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { uniq } from 'lodash';

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
            reports: reports.data.allagan_reports.map(report => {
              report.data = JSON.parse(report.data);
              return report;
            }),
            isFish: this.lazyData.data.fishes.includes(itemId)
          };
        })
      );
    })
  );

  itemReportsQueue$ = this.itemId$.pipe(
    switchMap(itemId => {
      return this.allaganReportsService.getItemReportsQueue(itemId).pipe(
        map(reports => {
          return reports.data.allagan_reports_queue.map(report => {
            if (typeof report.data === 'string') {
              report.data = JSON.parse(report.data);
            }
            return report;
          });
        })
      );
    })
  );

  sources = uniq(Object.keys(AllaganReportSource))
    .map(key => ({ key: key, value: AllaganReportSource[key] }));

  private readonly items: { id: number, name: I18nName }[] = [];
  private readonly instances: { id: number, name: I18nName }[] = [];
  private readonly ventures: { id: number, name: I18nName }[] = [];
  private readonly submarineVoyages: { id: number, name: I18nName }[] = [];
  private readonly airshipVoyages: { id: number, name: I18nName }[] = [];
  private readonly mobs: { id: number, name: I18nName }[] = [];

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
              private lazyData: LazyDataService, private i18n: I18nToolsService,
              private message: NzMessageService, private translate: TranslateService) {
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

  addSource(itemId: number, formState: any): void {
    const { source } = formState;
    const report: AllaganReport = {
      itemId,
      source,
      data: this.getData(source, formState)
    };
    this.allaganReportsService.addReportToQueue(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Report_added'));
    });
  }

  private getData(source: AllaganReportSource, formState: any): any {
    switch (source) {
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return { itemId: this.getEntryId(this.items, formState.item) };
      case AllaganReportSource.INSTANCE:
        return { instanceId: this.getEntryId(this.instances, formState.instance) };
      case AllaganReportSource.VENTURE:
        return { ventureId: this.getEntryId(this.ventures, formState.venture) };
      case AllaganReportSource.DROP:
        return { monsterId: this.getEntryId(this.mobs, formState.mob) };
      case AllaganReportSource.VOYAGE:
        return { itemId: this.getEntryId([this.airshipVoyages, this.submarineVoyages][formState.voyageType], formState.voyage) };
    }
  }

  private getEntryId(registry: { id: number, name: I18nName }[], name: string): number {
    return registry.find(entry => this.i18n.getName(entry.name).toLowerCase() === name.toLowerCase())?.id;
  }

  needsItem(source: AllaganReportSource): boolean {
    return [AllaganReportSource.DESYNTH, AllaganReportSource.REDUCTION, AllaganReportSource.GARDENING, AllaganReportSource.LOOT].includes(source);
  }
}
