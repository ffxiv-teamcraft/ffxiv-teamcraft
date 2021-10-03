import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, filter, map, pluck, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AllaganReportsService } from '../allagan-reports.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { AllaganReportSource } from '../model/allagan-report-source';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { AllaganReport } from '../model/allagan-report';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { pickBy, uniq } from 'lodash';
import { AuthFacade } from '../../../+state/auth.facade';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Hookset } from '../../../core/data/model/hookset';
import { Tug } from '../../../core/data/model/tug';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { FishContextService } from '../../db/service/fish-context.service';
import { ItemContextService } from '../../db/service/item-context.service';
import { ReportsManagementComponent } from '../reports-management.component';
import { OceanFishingTime } from '../model/ocean-fishing-time';
import { SearchType } from '../../search/search-type';


function durationRequired(control: AbstractControl) {
  if (control.parent?.get('spawn').value !== null) {
    return Validators.required(control);
  }
  return null;
}

// noinspection JSMismatchedCollectionQueryUpdate
@Component({
  selector: 'app-allagan-report-details',
  templateUrl: './allagan-report-details.component.html',
  styleUrls: ['./allagan-report-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllaganReportDetailsComponent extends ReportsManagementComponent {

  loadingReports = false;
  loadingReportsQueue = false;
  modificationId$ = new BehaviorSubject<string>(null);
  source: AllaganReportSource;
  voyageType: number;
  AllaganReportSource = AllaganReportSource;
  SearchType = SearchType;

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
    tap(() => this.loadingReports = true),
    switchMap(itemId => {
      return this.allaganReportsService.getItemReports(itemId).pipe(
        map(reports => {
          return {
            itemId,
            reports: reports.data.allagan_reports.map(report => {
              return {
                ...report,
                data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
              };
            }).sort((a, b) => a.created_at - b.created_at),
            isFish: this.lazyData.data.fishes.includes(itemId),
            spots: []
          };
        }),
        map(data => {
          if (data.isFish) {
            data.spots = this.lazyData.data.fishingSpots.filter(spot => {
              return spot.fishes.includes(itemId);
            });
          }
          return data;
        })
      );
    }),
    tap(() => this.loadingReports = false)
  );

  itemReportsQueue$ = this.itemId$.pipe(
    tap(() => this.loadingReportsQueue = true),
    switchMap(itemId => {
      return combineLatest([
        this.itemDetails$,
        this.allaganReportsService.getItemReportsQueue(itemId).pipe(
          map(reports => {
            return reports.data.allagan_reports_queue.map(report => {
              return {
                ...report,
                data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
              };
            });
          })
        )
      ]);
    }),
    map(([details, queue]) => {
      return queue.map(entry => {
        if (entry.report) {
          entry.reportData = details.reports.find(r => r.uid === entry.report);
        }
        return entry;
      });
    }),
    tap(() => this.loadingReportsQueue = false)
  );

  sources = uniq(Object.keys(AllaganReportSource))
    .map(key => ({ key: key, value: AllaganReportSource[key] }));

  hooksets = Object.keys(Hookset)
    .filter(key => !isNaN(+key) && +key > 0)
    .map(key => ({ key: +key, value: [0, 4103, 4179][+key] }));

  tugs = Object.keys(Tug)
    .filter(key => !isNaN(+key))
    .map(key => ({ key: +key, value: Tug[key] }));

  oceanFishingTimes = Object.keys(OceanFishingTime)
    .filter(key => !isNaN(+key))
    .map(key => ({ key: +key, value: OceanFishingTime[key] }));

  /** Spawn are limited to hours (0 to 23) **/
  public SPAWN_VALIDATOR = {
    min: 0,
    max: 23
  };

  /** Duration is only limited to hours (0 to 23) **/
  public DURATION_VALIDATOR = {
    min: 0,
    max: 23
  };

  // tslint:disable-next-line:member-ordering
  form: FormGroup = this.fb.group({
    source: [null, Validators.required],
    item: [null, this.requiredIfSource(AllaganReportSource.DESYNTH, AllaganReportSource.REDUCTION, AllaganReportSource.GARDENING, AllaganReportSource.LOOT)],
    instance: [null, this.requiredIfSource(AllaganReportSource.INSTANCE)],
    venture: [null, this.requiredIfSource(AllaganReportSource.VENTURE)],
    fate: [null, this.requiredIfSource(AllaganReportSource.FATE)],
    mob: [null, this.requiredIfSource(AllaganReportSource.DROP)],
    voyageType: [null, this.requiredIfSource(AllaganReportSource.VOYAGE)],
    voyage: [null, this.requiredIfSource(AllaganReportSource.VOYAGE)],
    spot: [null, this.requiredIfSource(AllaganReportSource.FISHING)],
    hookset: [null],
    tug: [null, this.requiredIfSource(AllaganReportSource.FISHING)],
    bait: [null, this.requiredIfSource(AllaganReportSource.FISHING)],
    spawn: [null],
    duration: [null, durationRequired],
    weathers: [[]],
    weathersFrom: [[]],
    predators: [[]],
    snagging: [false],
    gig: [null, this.requiredIfSource(AllaganReportSource.SPEARFISHING)],
    oceanFishingTime: [0],
    minGathering: [0],
    price: [0, this.requiredIfSource(AllaganReportSource.MOGSTATION)],
    productId: [null, this.requiredIfSource(AllaganReportSource.MOGSTATION)]
  });

  fishingSpotPatch$ = new Subject<any>();

  fishingSpot$ = merge(this.form.valueChanges.pipe(pluck('spot')), this.fishingSpotPatch$).pipe(
    shareReplay(1)
  );

  isOceanFishing$ = this.fishingSpot$.pipe(
    map(spot => this.isOceanFishingSpot(spot))
  );

  public canSuggestForThisSpot$ = combineLatest([this.fishingSpot$, this.itemDetails$, this.modificationId$]).pipe(
    map(([spot, details, modificationId]) => {
      return !!modificationId || !spot || !details.reports.some(report => report.source === AllaganReportSource.FISHING && report.data.spot === spot.id);
    }),
    startWith(true)
  );

  public possibleFish$ = this.fishingSpot$.pipe(
    filter(spot => !!spot),
    map(spot => spot.fishes.filter(f => f > 0))
  );

  public possibleBaits$ = combineLatest([this.possibleFish$, this.xivapi.get(XivapiEndpoint.ItemSearchCategory, 30, {
    columns: ['GameContentLinks']
  })]).pipe(
    map(([possibleFish, fishingTackleCategory]) => {
      return [...possibleFish, ...fishingTackleCategory.GameContentLinks.Item.ItemSearchCategory];
    }),
    startWith([])
  );

  public mapWeathers$ = this.fishingSpot$.pipe(
    filter(spot => !!spot),
    map((spot) => {
      return _.uniq(weatherIndex[mapIds.find(m => m.id === spot.mapId).weatherRate].map(row => +row.weatherId)) as number[];
    }),
    shareReplay(1)
  );

  public loadingGubal = false;

  public gubalSuggestions$ = this.itemDetails$.pipe(
    filter(details => details.isFish),
    tap(() => this.loadingGubal = true),
    switchMap(details => {
      return this.form.get('spot').valueChanges
        .pipe(
          startWith(this.form.get('spot').value),
          filter(spot => !!spot),
          switchMap(spot => {
            this.itemCtx.setItemId(details.itemId);
            this.fishCtx.setSpotId(spot.id);
            return combineLatest([
              this.fishCtx.baitMoochesBySpot$,
              this.fishCtx.hooksetTugsByFish$,
              this.fishCtx.weatherAndTransitionsByFish$,
              this.fishCtx.hoursByFish$,
              this.fishCtx.statisticsByFish$
            ]);
          }),
          map(([baits, hooksetTugs, weathers, hours, stats]) => {
            return {
              bait: +baits.data.baits.filter(row => row.itemId === details.itemId).sort((a, b) => b.occurences - a.occurences)[0]?.baitId || null,
              tug: +hooksetTugs.data.tugs.sort((a, b) => b.occurences - a.occurences)[0]?.tug || null,
              hookset: +hooksetTugs.data.hooksets.sort((a, b) => b.occurences - a.occurences)[0]?.hookset || null,
              spawn: this.getSpawnHour(hours.data.byId),
              duration: this.getDuration(hours.data.byId),
              weathers: weathers.data.weathers.length > 4 ? [] : weathers.data.weathers.filter(w => w.occurences > 5).map(w => w.weatherId),
              weathersFrom: weathers.data.weatherTransitions.length > 5 ? [] : weathers.data.weatherTransitions.filter(w => w.occurences > 5).map(w => w.previousWeatherId),
              snagging: stats.data.snagging > 90,
              minGathering: stats.data.stats.aggregate.min.gathering
            };
          })
        );
    }),
    tap(() => this.loadingGubal = false),
    shareReplay(1)
  );

  public itemInput$: Subject<string> = new Subject<string>();

  public itemCompletion$ = this.makeCompletionObservable(this.itemInput$, 'items');

  public instanceInput$: Subject<string> = new Subject<string>();

  public instanceCompletion$ = this.makeCompletionObservable(this.instanceInput$, 'instances');

  public ventureInput$: Subject<string> = new Subject<string>();

  public ventureCompletion$ = this.makeCompletionObservable(this.ventureInput$, 'ventures');

  public mobInput$: Subject<string> = new Subject<string>();

  public mobCompletion$ = this.makeCompletionObservable(this.mobInput$, 'mobs');

  public fateInput$: Subject<string> = new Subject<string>();

  public fateCompletion$ = this.makeCompletionObservable(this.fateInput$, 'fates');

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

  public spearFishingFishList = this.lazyData.data.spearFishingFish;

  public hoverId$ = new Subject<string>();

  constructor(private route: ActivatedRoute, private allaganReportsService: AllaganReportsService,
              protected lazyData: LazyDataService, private i18n: I18nToolsService,
              private message: NzMessageService, private translate: TranslateService,
              private authFacade: AuthFacade, private cd: ChangeDetectorRef,
              private xivapi: XivapiService, private fb: FormBuilder,
              private fishCtx: FishContextService, private itemCtx: ItemContextService) {
    super(lazyData);
    this.form.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(value => {
      this.source = value.source;
      this.voyageType = value.voyageType;
    });
    this.form.get('spawn').valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.form.get('duration').updateValueAndValidity();
    });
    this.form.get('source').valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      setTimeout(() => this.form.updateValueAndValidity());
    });
  }

  requiredIfSource(...sources: AllaganReportSource[]) {
    return (control: AbstractControl) => {
      if (sources.includes(control.parent?.get('source').value)) {
        return Validators.required(control);
      }
    };
  }

  hoverQueueEntry(entry: AllaganReportQueueEntry): void {
    if (entry.report) {
      this.hoverId$.next(entry.report);
    }
  }

  addSource(itemId: number): void {
    const formState = this.form.getRawValue();
    const { source } = formState;
    const report: AllaganReport = {
      itemId,
      source,
      data: this.getData(source, formState)
    };
    this.allaganReportsService.addReportToQueue(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Report_added'));
      this.form.reset();
    });
  }

  cancel(): void {
    this.form.reset();
    this.modificationId$.next(null);
  }

  submitModification(itemId: number, reportId: string): void {
    const formState = this.form.getRawValue();
    const { source } = formState;
    const report: AllaganReport = {
      itemId,
      source,
      data: this.getData(source, formState)
    };
    this.allaganReportsService.suggestModification(reportId, report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Modification_suggestion_submitted'));
      this.form.reset();
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
        });
        break;
      case AllaganReportStatus.DELETION:
        this.allaganReportsService.acceptDeletion(entry).subscribe(() => {
          this.message.success(this.translate.instant('ALLAGAN_REPORTS.Report_deleted'));
        });
        break;
      case AllaganReportStatus.MODIFICATION:
        this.allaganReportsService.acceptModification(entry).subscribe(() => {
          this.message.success(this.translate.instant('ALLAGAN_REPORTS.Modification_applied'));
        });
        break;
    }
  }

  reject(entry: AllaganReportQueueEntry): void {
    this.allaganReportsService.reject(entry).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
    });
  }

  suggestDeletion(report: AllaganReport): void {
    this.allaganReportsService.suggestDeletion(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Deletion_suggestion_submitted'));
    });
  }

  startModification(report: AllaganReport): void {
    const patch = this.getFormStatePatch(report);
    this.source = report.source;
    this.form.patchValue({ source: report.source, ...patch }, { emitEvent: true });
    if (patch.spot) {
      setTimeout(() => {
        this.fishingSpotPatch$.next(patch.spot);
      });
    }
    this.modificationId$.next(report.uid);
    this.cd.detectChanges();
  }

  private getFormStatePatch(report: AllaganReport): any {
    switch (report.source) {
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return { item: this.getEntryName(this.items, report.data.itemId) };
      case AllaganReportSource.MOGSTATION:
        return { price: report.data.price, productId: report.data.productId };
      case AllaganReportSource.INSTANCE:
        return { instance: this.getEntryName(this.instances, report.data.instanceId) };
      case AllaganReportSource.FATE:
        return { fate: this.getEntryName(this.instances, report.data.fateId) };
      case AllaganReportSource.VENTURE:
        return { venture: this.getEntryName(this.ventures, report.data.ventureId) };
      case AllaganReportSource.DROP:
        return { mob: this.getEntryName(this.mobs, report.data.monsterId) };
      case AllaganReportSource.VOYAGE:
        return {
          voyageId: this.getEntryName([this.airshipVoyages, this.submarineVoyages][report.data.voyageType], report.data.voyageId),
          voyageType: report.data.voyageType
        };
      case AllaganReportSource.SPEARFISHING:
        return pickBy({
          gig: report.data.gig,
          predators: report.data.predators,
          spawn: report.data.spawn,
          duration: report.data.duration
        }, value => value !== undefined && value !== null);
      case AllaganReportSource.FISHING:
        return pickBy({
          spot: this.lazyData.data.fishingSpots.find(s => s.id === report.data.spot),
          hookset: report.data.hookset,
          tug: report.data.tug,
          bait: report.data.bait,
          spawn: report.data.spawn,
          duration: report.data.duration,
          weathers: report.data.weathers,
          weathersFrom: report.data.weathersFrom,
          snagging: report.data.snagging,
          predators: report.data.predators,
          oceanFishingTime: report.data.oceanFishingTime,
          minGathering: report.data.minGathering
        }, value => value !== undefined && value !== null);
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
      case AllaganReportSource.MOGSTATION:
        return { price: formState.price, productId: formState.productId };
      case AllaganReportSource.INSTANCE:
        return { instanceId: this.getEntryId(this.instances, formState.instance) };
      case AllaganReportSource.FATE:
        return { fateId: this.getEntryId(this.fates, formState.fate) };
      case AllaganReportSource.VENTURE:
        return { ventureId: this.getEntryId(this.ventures, formState.venture) };
      case AllaganReportSource.DROP:
        return { monsterId: this.getEntryId(this.mobs, formState.mob) };
      case AllaganReportSource.VOYAGE:
        return {
          voyageId: this.getEntryId([this.airshipVoyages, this.submarineVoyages][formState.voyageType], formState.voyage),
          voyageType: formState.voyageType
        };
      case AllaganReportSource.SPEARFISHING:
        return pickBy({
          gig: formState.gig,
          predators: formState.predators,
          spawn: formState.spawn,
          duration: formState.duration
        }, value => value !== undefined && value !== null);
      case AllaganReportSource.FISHING:
        return pickBy({
          spot: formState.spot.id,
          hookset: formState.hookset,
          tug: formState.tug,
          bait: formState.bait,
          spawn: formState.spawn,
          duration: formState.duration,
          weathers: formState.weathers,
          weathersFrom: formState.weathersFrom,
          snagging: formState.snagging,
          predators: formState.predators,
          oceanFishingTime: this.isOceanFishingSpot(formState.spot) ? formState.oceanFishingTime : null,
          minGathering: formState.minGathering
        }, value => value !== undefined && value !== null);
    }
  }

  private isOceanFishingSpot(spot: any): boolean {
    return spot?.placeId === 3477;
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

  private getSpawnHour(byId: Record<string, number>): number | null {
    if (Object.values(byId).every(v => v === 0)) {
      return null;
    }
    let spawn = null;
    while (byId[spawn || 0] === 0) {
      spawn = (spawn || 0) + 1;
    }
    if (spawn === null) {
      return this.getDuration(byId) !== null ? 0 : null;
    }
    return spawn;
  }

  private getDuration(byId: Record<string, number>): number | null {
    return Object.values(byId).filter(v => v > 0).length;
  }
}
