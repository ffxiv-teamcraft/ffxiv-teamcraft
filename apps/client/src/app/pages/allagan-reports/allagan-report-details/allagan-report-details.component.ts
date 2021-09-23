import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, map, switchMap, switchMapTo } from 'rxjs/operators';
import { AllaganReportsService } from '../allagan-reports.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { AllaganReportSource } from '../model/allagan-report-source';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { AllaganReport } from '../model/allagan-report';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { uniq } from 'lodash';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { FormGroup, NgForm } from '@angular/forms';

// noinspection JSMismatchedCollectionQueryUpdate
@Component({
  selector: 'app-allagan-report-details',
  templateUrl: './allagan-report-details.component.html',
  styleUrls: ['./allagan-report-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportDetailsComponent {

  modificationId: string = null;
  source: AllaganReportSource;
  voyageType: number;
  AllaganReportSource = AllaganReportSource;

  reloader$ = new BehaviorSubject<void>(void 0);

  itemId$ = this.route.paramMap.pipe(
    map(params => +params.get('itemId'))
  );

  userId$ = this.authFacade.userId$;

  isChecker$ = this.authFacade.user$.pipe(
    map(user => {
      return user.allaganChecker || user.admin || user.moderator;
    })
  );

  itemDetails$ = this.itemId$.pipe(
    switchMap(itemId => {
      return this.reloader$.pipe(switchMapTo(this.allaganReportsService.getItemReports(itemId).pipe(
        map(reports => {
          return {
            reports: reports.data.allagan_reports.map(report => {
              return {
                ...report,
                data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
              };
            }).sort((a, b) => a.created_at - b.created_at),
            isFish: this.lazyData.data.fishes.includes(itemId)
          };
        })
      )));
    })
  );

  itemReportsQueue$ = this.itemId$.pipe(
    switchMap(itemId => {
      return combineLatest([
        this.itemDetails$,
        this.reloader$.pipe(switchMapTo(this.allaganReportsService.getItemReportsQueue(itemId).pipe(
          map(reports => {
            return reports.data.allagan_reports_queue.map(report => {
              return {
                ...report,
                data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
              };
            });
          })
        )))
      ]);
    }),
    map(([details, queue]) => {
      return queue.map(entry => {
        if (entry.report) {
          entry.reportData = details.reports.find(r => r.uid === entry.report);
        }
        return entry;
      });
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

  public hoverId$ = new Subject<string>();

  constructor(private route: ActivatedRoute, private allaganReportsService: AllaganReportsService,
              private lazyData: LazyDataService, private i18n: I18nToolsService,
              private message: NzMessageService, private translate: TranslateService,
              private authFacade: AuthFacade, private cd: ChangeDetectorRef) {
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

  hoverQueueEntry(entry: AllaganReportQueueEntry): void {
    if (entry.report) {
      this.hoverId$.next(entry.report);
    }
  }

  addSource(itemId: number, formState: any, form: FormGroup): void {
    const { source } = formState;
    const report: AllaganReport = {
      itemId,
      source,
      data: this.getData(source, formState)
    };
    this.allaganReportsService.addReportToQueue(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Report_added'));
      this.reloader$.next();
      form.reset();
    });
  }

  submitModification(itemId: number, form: FormGroup, reportId: string): void {
    const formState = form.getRawValue();
    const { source } = formState;
    const report: AllaganReport = {
      itemId,
      source,
      data: this.getData(source, formState)
    };
    this.allaganReportsService.suggestModification(reportId, report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Modification_suggestion_submitted'));
      this.reloader$.next();
      form.reset();
    });
  }

  needsItem(source: AllaganReportSource): boolean {
    return [AllaganReportSource.DESYNTH, AllaganReportSource.REDUCTION, AllaganReportSource.GARDENING, AllaganReportSource.LOOT].includes(source);
  }

  accept(entry: AllaganReportQueueEntry): void {
    switch (entry.type) {
      case AllaganReportStatus.PROPOSAL:
        this.allaganReportsService.acceptProposal(entry).subscribe(() => {
          this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_accepted'));
          this.reloader$.next();
        });
        break;
      case AllaganReportStatus.DELETION:
        this.allaganReportsService.acceptDeletion(entry).subscribe(() => {
          this.message.success(this.translate.instant('ALLAGAN_REPORTS.Report_deleted'));
          this.reloader$.next();
        });
        break;
      case AllaganReportStatus.MODIFICATION:
        this.allaganReportsService.acceptModification(entry).subscribe(() => {
          this.message.success(this.translate.instant('ALLAGAN_REPORTS.Modification_applied'));
          this.reloader$.next();
        });
        break;
    }
  }

  reject(entry: AllaganReportQueueEntry): void {
    this.allaganReportsService.reject(entry).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
      this.reloader$.next();
    });
  }

  suggestDeletion(report: AllaganReport): void {
    this.allaganReportsService.suggestDeletion(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Deletion_suggestion_submitted'));
      this.reloader$.next();
    });
  }

  startModification(report: AllaganReport, ngForm: NgForm): void {
    const patch = this.getFormStatePatch(report);
    ngForm.form.patchValue({ source: report.source, ...patch });
    this.modificationId = report.uid;
    this.cd.detectChanges();
  }

  /**
   * This will be useful once we move to proper dynamic reactive form.
   * @param report
   * @private
   */
  private getFormStatePatch(report: AllaganReport): any {
    switch (report.source) {
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return { item: this.getEntryName(this.items, report.data.itemId) };
      case AllaganReportSource.INSTANCE:
        return { instance: this.getEntryName(this.instances, report.data.instanceId) };
      case AllaganReportSource.VENTURE:
        return { venture: this.getEntryName(this.ventures, report.data.ventureId) };
      case AllaganReportSource.DROP:
        return { mob: this.getEntryName(this.mobs, report.data.monsterId) };
      case AllaganReportSource.VOYAGE:
        return {
          voyageId: this.getEntryName([this.airshipVoyages, this.submarineVoyages][report.data.voyageType], report.data.voyageId),
          voyageType: report.data.voyageType
        };
    }
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
        return {
          voyageId: this.getEntryId([this.airshipVoyages, this.submarineVoyages][formState.voyageType], formState.voyage),
          voyageType: formState.voyageType
        };
    }
  }

  private getEntryId(registry: { id: number, name: I18nName }[], name: string): number {
    return registry.find(entry => this.i18n.getName(entry.name).toLowerCase() === name.toLowerCase())?.id;
  }

  private getEntryName(registry: { id: number, name: I18nName }[], id: number): string {
    return this.i18n.getName(registry.find(entry => entry.id === id)?.name);
  }

  trackByUid(index: number, row: AllaganReport | AllaganReportQueueEntry): string {
    return row.uid;
  }
}
