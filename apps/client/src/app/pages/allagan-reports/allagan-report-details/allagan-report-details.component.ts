import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { debounceTime, filter, first, map, pluck, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AllaganReportsService } from '../allagan-reports.service';
import { AllaganReportSource } from '../model/allagan-report-source';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
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
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { withLazyData } from '../../../core/rxjs/with-lazy-data';
import { SpearfishingSpeed } from '../../../core/data/model/spearfishing-speed';
import { SpearfishingShadowSize } from '../../../core/data/model/spearfishing-shadow-size';


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

  voyageType: 0 | 1;

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
    withLazyData(this.lazyData, 'fishes', 'fishingSpots', 'fishParameter'),
    switchMap(([itemId, fishes, fishingSpots, fishParameter]) => {
      return this.allaganReportsService.getItemReports(itemId).pipe(
        map(reports => {
          const data = {
            itemId,
            reports: reports.data.allagan_reports.map(report => {
              return {
                ...report,
                data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
              };
            }).sort((a, b) => a.created_at - b.created_at),
            isFish: fishes.includes(itemId),
            spots: []
          };
          if (data.isFish) {
            data.spots = fishingSpots.filter(spot => {
              return spot.fishes.includes(itemId);
            });
            if (data.spots.length === 0) {
              const param = fishParameter[itemId];
              data.spots = fishingSpots.filter(spot => {
                return spot.mapId === param.mapId;
              });
            }
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

  speeds = Object.keys(SpearfishingSpeed)
    .filter(key => !isNaN(+key))
    .map(key => ({ key: +key, value: SpearfishingSpeed[key] }));

  shadowSizes = Object.keys(SpearfishingShadowSize)
    .filter(key => !isNaN(+key))
    .map(key => ({ key: +key, value: SpearfishingShadowSize[key] }));

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
    item: [null, this.requiredIfSource([AllaganReportSource.DESYNTH, AllaganReportSource.REDUCTION, AllaganReportSource.GARDENING, AllaganReportSource.LOOT], 'items$')],
    instance: [null, this.requiredIfSource([AllaganReportSource.INSTANCE], 'instances$')],
    venture: [null, this.requiredIfSource([AllaganReportSource.VENTURE], 'ventures$')],
    fate: [null, this.requiredIfSource([AllaganReportSource.FATE], 'fates$')],
    mob: [null, this.requiredIfSource([AllaganReportSource.DROP], 'mobs$')],
    voyageType: [null, this.requiredIfSource([AllaganReportSource.VOYAGE])],
    voyage: [null, this.requiredIfSource([AllaganReportSource.VOYAGE])],
    rarity: [null],
    spot: [null, this.requiredIfSource([AllaganReportSource.FISHING])],
    hookset: [null],
    tug: [null, this.requiredIfSource([AllaganReportSource.FISHING])],
    bait: [null, this.requiredIfSource([AllaganReportSource.FISHING])],
    spawn: [null],
    duration: [null, durationRequired],
    weathers: [[]],
    weathersFrom: [[]],
    predators: [[]],
    snagging: [false],
    speed: [null, this.requiredIfSource([AllaganReportSource.SPEARFISHING])],
    shadowSize: [null, this.requiredIfSource([AllaganReportSource.SPEARFISHING])],
    oceanFishingTime: [0],
    minGathering: [0],
    price: [0, this.requiredIfSource([AllaganReportSource.MOGSTATION])],
    productId: [null, this.requiredIfSource([AllaganReportSource.MOGSTATION])]
  });

  fishingSpotPatch$ = new Subject<any>();

  fishingSpot$ = merge(this.form.valueChanges.pipe(pluck('spot')), this.fishingSpotPatch$).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
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
    shareReplay({ bufferSize: 1, refCount: true })
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
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public itemInput$: Subject<string> = new Subject<string>();

  public itemCompletion$ = this.makeCompletionObservable(this.itemInput$, this.items$);

  public instanceInput$: Subject<string> = new Subject<string>();

  public instanceCompletion$ = this.makeCompletionObservable(this.instanceInput$, this.instances$);

  public ventureInput$: Subject<string> = new Subject<string>();

  public ventureCompletion$ = this.makeCompletionObservable(this.ventureInput$, this.ventures$);

  public mobInput$: Subject<string> = new Subject<string>();

  public mobCompletion$ = this.makeCompletionObservable(this.mobInput$, this.mobs$).pipe(
    withLazyData(this.lazyData, 'monsters'),
    map(([completion, monsters]) => {
      return completion.map(row => {
        row.details = (monsters[row.id]?.positions || [])[0];
        return row;
      });
    })
  );

  public fateInput$: Subject<string> = new Subject<string>();

  public fateCompletion$ = this.makeCompletionObservable(this.fateInput$, this.fates$);

  public voyageInput$: Subject<string> = new Subject<string>();

  public voyageCompletion$ = this.voyageInput$.pipe(
    debounceTime(500),
    switchMap(value => {
      if (value.length < 2) {
        return of([]);
      } else {
        return [this.airshipVoyages$, this.submarineVoyages$][this.voyageType].pipe(
          map(voyages => voyages.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1))
        );
      }
    })
  );

  public spearFishingFishList$ = this.lazyData.getEntry('spearFishingFish');

  public hoverId$ = new Subject<string>();

  constructor(private route: ActivatedRoute, private allaganReportsService: AllaganReportsService,
              protected lazyData: LazyDataFacade, private i18n: I18nToolsService,
              private message: NzMessageService, private translate: TranslateService,
              private authFacade: AuthFacade, private cd: ChangeDetectorRef,
              private xivapi: XivapiService, private fb: FormBuilder,
              private fishCtx: FishContextService, private itemCtx: ItemContextService,
              private router: Router) {
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
      setTimeout(() => {
        this.form.updateValueAndValidity();
        this.cd.detectChanges();
      });
    });
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.onDestroy$)
    ).subscribe(() => {
      this.cancel();
    });
  }

  requiredIfSource(sources: AllaganReportSource[], registryKey?: keyof Extract<ReportsManagementComponent, Observable<any>>): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl) => {
      if (sources.includes(control.parent?.get('source').value)) {
        const required = Validators.required(control);
        if (required || !registryKey) {
          return required;
        }
        const id = this.getEntryId(control.value);
        if (!id) {
          return { invalid: true };
        }
        return null;
      }
      return null;
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
    this.getData(source, formState).pipe(
      first(),
      switchMap(data => {
        const report: AllaganReport = {
          itemId,
          source,
          data
        };
        return this.allaganReportsService.addReportToQueue(report);
      })
    ).subscribe(() => {
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
    this.getData(source, formState).pipe(
      first(),
      switchMap(data => {
        const report: AllaganReport = {
          itemId,
          source,
          data
        };
        return this.allaganReportsService.suggestModification(reportId, report);
      })
    ).subscribe(() => {
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

  deleteOwnProposal(report: AllaganReportQueueEntry): void {
    this.allaganReportsService.reject(report).subscribe(() => {
      this.message.success(this.translate.instant('ALLAGAN_REPORTS.Proposal_rejected'));
    });
  }

  startModification(report: AllaganReport): void {
    this.getFormStatePatch(report).pipe(
      first()
    ).subscribe(patch => {
      this.source = report.source;
      this.form.patchValue({ source: report.source, ...patch }, { emitEvent: true });
      if (patch.spot) {
        setTimeout(() => {
          this.fishingSpotPatch$.next(patch.spot);
        });
      }
      this.modificationId$.next(report.uid);
      this.cd.detectChanges();
    });
  }

  trackByUid(index: number, row: AllaganReport | AllaganReportQueueEntry): string {
    return row.uid;
  }

  private getFormStatePatch(report: AllaganReport): Observable<any> {
    switch (report.source) {
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return this.getEntryName(this.items$, report.data.itemId).pipe(
          map(name => ({ item: name }))
        );
      case AllaganReportSource.MOGSTATION:
        return of({ price: report.data.price, productId: report.data.productId });
      case AllaganReportSource.INSTANCE:
        return this.getEntryName(this.instances$, report.data.instanceId).pipe(
          map(name => ({ instance: name }))
        );
      case AllaganReportSource.FATE:
        return this.getEntryName(this.instances$, report.data.fateId).pipe(
          map(name => ({ fate: name }))
        );
      case AllaganReportSource.VENTURE:
        return this.getEntryName(this.ventures$, report.data.ventureId).pipe(
          map(name => ({ venture: name }))
        );
      case AllaganReportSource.DROP:
        return this.getEntryName(this.mobs$, report.data.monsterId).pipe(
          map(name => ({ mob: name }))
        );
      case AllaganReportSource.VOYAGE:
        return this.getEntryName([this.airshipVoyages$, this.submarineVoyages$][report.data.voyageType], report.data.voyageId).pipe(
          map(voyageName => ({
            voyageId: voyageName,
            voyageType: report.data.voyageType,
            rarity: report.data.rarity
          }))
        );
      case AllaganReportSource.SPEARFISHING:
        return of(pickBy({
          speed: report.data.speed,
          shadowSize: report.data.shadowSize,
          predators: report.data.predators,
          spawn: report.data.spawn,
          duration: report.data.duration
        }, value => value !== undefined && value !== null));
      case AllaganReportSource.FISHING:
        return this.lazyData.getEntry('fishingSpots').pipe(
          map(fishingSpots => {
            return pickBy({
              spot: fishingSpots.find(s => s.id === report.data.spot),
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
          })
        );
    }
  }

  private makeCompletionObservable(subject: Subject<string>, registry$: Observable<{ id: number, name: I18nName }[]>): Observable<{ id: number, name: I18nName, details?: any }[]> {
    return subject.pipe(
      debounceTime(500),
      switchMap(value => {
        if (value.length < 2) {
          return of([]);
        } else {
          return registry$.pipe(
            map(registry => registry.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1))
          );
        }
      })
    );
  }

  private getData(source: AllaganReportSource, formState: any): Observable<any> {
    switch (source) {
      case AllaganReportSource.DEPRECATED:
        return of(true);
      case AllaganReportSource.DESYNTH:
      case AllaganReportSource.REDUCTION:
      case AllaganReportSource.GARDENING:
      case AllaganReportSource.LOOT:
        return of(this.getEntryId(formState.item)).pipe(
          map(id => ({ itemId: id }))
        );
      case AllaganReportSource.MOGSTATION:
        return of({ price: formState.price, productId: formState.productId });
      case AllaganReportSource.INSTANCE:
        return of(this.getEntryId(formState.instance)).pipe(
          map(id => ({ instanceId: id }))
        );
      case AllaganReportSource.FATE:
        return of(this.getEntryId(formState.fate)).pipe(
          map(id => ({ fateId: id }))
        );
      case AllaganReportSource.VENTURE:
        return of(this.getEntryId(formState.venture)).pipe(
          map(id => ({ ventureId: id }))
        );
      case AllaganReportSource.DROP:
        return of(this.getEntryId(formState.mob)).pipe(
          map(id => ({ monsterId: id }))
        );
      case AllaganReportSource.VOYAGE:
        return of(this.getEntryId(formState.voyage)).pipe(
          map(id => ({
            voyageId: id,
            voyageType: formState.voyageType,
            rarity: formState.rarity
          }))
        );
      case AllaganReportSource.SPEARFISHING:
        return of(pickBy({
          speed: formState.speed,
          shadowSize: formState.shadowSize,
          predators: formState.predators,
          spawn: formState.spawn,
          duration: formState.duration
        }, value => value !== undefined && value !== null));
      case AllaganReportSource.FISHING:
        return of(pickBy({
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
        }, value => value !== undefined && value !== null));
    }
  }

  private isOceanFishingSpot(spot: any): boolean {
    return spot?.placeId === 3477;
  }

  private getEntryId(name: string): number | null {
    const match = name.match(/\[(-?\d+)]\s.*/);
    if (!match) {
      return null;
    }
    return +match[1];
  }

  private getEntryName(registry$: Observable<{ id: number, name: I18nName }[]>, id: number): Observable<string> {
    return registry$.pipe(
      map(registry => this.i18n.getName(registry.find(entry => entry.id === id)?.name))
    );
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
