import { ChangeDetectorRef, Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { delayWhen, filter, first, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { DataType, FishTrainStop, GatheringNode, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { BehaviorSubject, combineLatest, of, Subscription, timer } from 'rxjs';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FishDataService } from '../../db/service/fish-data.service';
import { findLastIndex } from 'lodash';
import { PlatformService } from '../../../core/tools/platform.service';
import { IpcService } from '../../../core/electron/ipc.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NameQuestionPopupComponent } from '../../../modules/name-question-popup/name-question-popup/name-question-popup.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthFacade } from '../../../+state/auth.facade';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProgressPopupService } from '../../../modules/progress-popup/progress-popup.service';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { TrainFishingReport } from '../../../core/data-reporting/fishing-report';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';
import { PushNotificationsService } from '../../../core/push-notifications.service';
import { SettingsService } from '../../../modules/settings/settings.service';
import { HooksetActionIdPipe } from '../../../pipes/pipes/hookset-action-id.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { IfMobilePipe } from '../../../pipes/pipes/if-mobile.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { TimerPipe } from '../../../core/eorzea/timer.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FishSizeChartComponent } from '../fish-size-chart/fish-size-chart.component';
import { BaitBreakdownComponent } from '../bait-breakdown/bait-breakdown.component';
import { FishBreakdownComponent } from '../fish-breakdown/fish-breakdown.component';
import { ContributionPerPassengerComponent } from '../contribution-per-passenger/contribution-per-passenger.component';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { MapPositionComponent } from '../../../modules/map/map-position/map-position.component';
import { NgForTrackByIdDirective } from '../../../core/track-by/ng-for-track-by-id.directive';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserAvatarComponent } from '../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { MapComponent } from '../../../modules/map/map/map.component';
import { ClipboardDirective } from '../../../core/clipboard.directive';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FishingBaitComponent } from '../../../modules/fishing-bait/fishing-bait/fishing-bait.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NgIf, NgFor, NgTemplateOutlet, AsyncPipe, LowerCasePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-fish-train',
    templateUrl: './fish-train.component.html',
    styleUrls: ['./fish-train.component.less'],
    standalone: true,
    imports: [NgIf, FullpageMessageComponent, NzCardModule, ItemIconComponent, I18nNameComponent, NzToolTipModule, NzDividerModule, NzGridModule, FishingBaitComponent, NzButtonModule, NzWaveModule, NzPopoverModule, NzSpaceModule, ClipboardDirective, MapComponent, NzPageHeaderModule, UserAvatarComponent, NzIconModule, NzInputModule, NzSelectModule, FormsModule, NgFor, NzTagModule, NzSwitchModule, NzPopconfirmModule, NzAlertModule, NzAffixModule, NzSliderModule, NzStepsModule, NgForTrackByIdDirective, MapPositionComponent, NgTemplateOutlet, NzStatisticModule, ContributionPerPassengerComponent, FishBreakdownComponent, BaitBreakdownComponent, FishSizeChartComponent, PageLoaderComponent, AsyncPipe, LowerCasePipe, DatePipe, TranslateModule, I18nPipe, TimerPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, IfMobilePipe, XivapiIconPipe, MapNamePipe, HooksetActionIdPipe]
})
export class FishTrainComponent extends TeamcraftComponent {

  timeTravel$ = new BehaviorSubject<number | null>(null);

  timeIncludingTravel$ = combineLatest([
    this.fishTrainFacade.time$,
    this.timeTravel$
  ]).pipe(
    map(([time, timeTravel]) => {
      return timeTravel ? timeTravel : time;
    })
  );

  playSpeed$ = new BehaviorSubject<number>(50);

  playSub: Subscription;

  fishTrain$ = this.fishTrainFacade.selectedFishTrain$;

  outdated$ = this.fishTrain$.pipe(
    map(train => train.reports.length === 0 && train.end < new Date('04/05/2023').getTime() && !train.empty)
  );

  gubalFishTrainStats$ = this.fishTrain$.pipe(
    filter(train => train.reports !== undefined),
    map(train => ({
      count: train.reports.length,
      reports: train.reports
    })),
    startWith({
      count: 0,
      reports: []
    })
  );

  fishTrainWithLocations$ = this.fishTrain$.pipe(
    filter(train => !train.notFound),
    switchMap(train => {
      return this.lazyData.getRows('extracts', ...train.fish.map(stop => stop.id)).pipe(
        map(extracts => {
          return {
            ...train,
            fish: train.fish.map(stop => {
              return {
                ...stop,
                node: getItemSource(getExtract(extracts, stop.id), DataType.GATHERED_BY)?.nodes[0]
              };
            })
          };
        })
      );
    })
  );

  display$ = combineLatest([
    this.timeIncludingTravel$,
    this.fishTrainFacade.time$,
    this.fishTrainWithLocations$,
    this.fishTrainFacade.currentTrain$,
    this.gubalFishTrainStats$,
    this.authFacade.userId$
  ]).pipe(
    map(([timeIncludingTravel, time, train, currentTrain, gubalStats, userId]) => {
      const reports = gubalStats.reports.filter(report => new Date(report.date).getTime() <= timeIncludingTravel);
      let stops = train.fish;
      const stop = train.fish[train.fish.length - 1].end;
      const stopped = stop <= time;
      const running = !stopped && train.start <= time;
      const waiting = train.start >= time;
      let current = train.fish.find(stop => stop.start <= timeIncludingTravel && stop.end >= timeIncludingTravel);
      // If there's no current fish but train is running, we're moving to the next one !
      if (!current && running) {
        const lastIndex = findLastIndex(train.fish, stop => stop.start <= timeIncludingTravel);
        current = train.fish[lastIndex + 1] || null;
      }
      let currentIndex = train.fish.indexOf(current);
      if (currentIndex > 1 && running) {
        stops = stops.slice(currentIndex - 1);
        currentIndex = 1;
      }
      const matchingItemIds = train.fish.map(fish => fish.id);
      let accuracy = 0;
      if (reports.length > 0) {
        accuracy = reports.filter(report => matchingItemIds.includes(report.itemId)).length / reports.length;
        accuracy = Math.round(accuracy * 1000) / 1000;
      }
      const durationHours = (Math.min(time, train.end) - train.start) / (60000 * 60);
      const rate = (durationHours === 0 || reports.length === 0) ? 0 : Math.floor(100 * reports.length / durationHours) / 100;
      return {
        ...train,
        stops,
        current,
        currentIndex,
        stop,
        stopped,
        running,
        waiting,
        time: timeIncludingTravel,
        currentTrain,
        gubalStats,
        accuracy,
        rate,
        reports,
        isConductor: userId === train.conductor
      };
    }),
    tap(display => {
      if (display.current && display.running) {
        const time = Math.floor(display.time / 1000);
        if (time === Math.floor(display.current.end / 1000)) {
          this.notifyMovement(display.fish[display.currentIndex + 1]);
        }
      }
      this.cd.detectChanges();
    }),
    shareReplay(1)
  );

  public sliderData$ = this.display$.pipe(
    map((display) => {
      return {
        min: display.start,
        max: display.end,
        value: Math.min(display.time, display.end),
        marks: display.fish.reduce((acc, fish) => {
          return {
            ...acc,
            [fish.start]: ''
          };
        }, {
          [display.start]: 'Departure',
          [display.end]: 'Terminus'
        }),
        formatter: timestamp => new Date(timestamp).toLocaleString()
      };
    })
  );

  public servers$ = this.lazyData.servers$;

  public loggedIn$ = this.authFacade.loggedIn$;

  public macroPopoverShown = false;

  public overlay = false;

  constructor(private fishTrainFacade: FishTrainFacade, private route: ActivatedRoute,
              private lazyData: LazyDataFacade, private i18n: I18nToolsService,
              public translate: TranslateService, private fishDataService: FishDataService,
              public platform: PlatformService, private ipc: IpcService,
              private dialog: NzModalService, private message: NzMessageService,
              private authFacade: AuthFacade, private soundNotificationService: SoundNotificationService,
              private notificationService: NzNotificationService, private pushNotificationsService: PushNotificationsService,
              private cd: ChangeDetectorRef, private router: Router, private progressPopup: ProgressPopupService,
              private lodestone: LodestoneService, public settings: SettingsService) {
    super();
    route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntil(this.onDestroy$)
      )
      .subscribe(id => {
        this.fishTrainFacade.load(id);
        this.fishTrainFacade.select(id);
      });
    route.queryParamMap.pipe(
      switchMap(query => {
        return this.fishTrain$.pipe(
          filter(Boolean),
          map(train => ({ query, train }))
        );
      }),
      first(),
      delayWhen(() => this.translate.get('LOADING'))
    ).subscribe(({ query, train }) => {
      this.overlay = query.get('overlay') !== null;
      const token = query.get('conductorToken');
      if (token && !train.conductor) {
        if (token === train.conductorToken) {
          this.fishTrainFacade.claimConductorRole(train.$key);
          this.message.success(this.translate.instant('FISH_TRAIN.Conductor_role_claimed'));
        } else {
          this.message.error(this.translate.instant('FISH_TRAIN.Wrong_token'));
        }
      }
      if (token) {
        router.navigate([], {
          queryParams: {}
        });
      }
    });
  }

  getMacro = (current: FishTrainStop & { node: GatheringNode }, macroKey: string, useCurrentPos = false) => {
    return combineLatest([
      this.i18n.getNameObservable('items', current.id),
      combineLatest(current.node.baits.map(bait => this.i18n.getNameObservable('items', bait.id))),
      this.lazyData.getEntry('mapEntries').pipe(
        switchMap(entries => this.i18n.getNameObservable('places', entries.find(e => e.id === current.node.map)?.zone))
      ),
      current.slap ? this.i18n.getNameObservable('items', current.slap) : of(null),
      current.node.predators ? combineLatest(current.node.predators.map(predator => {
        return this.i18n.getNameObservable('items', predator.id).pipe(
          map(name => ({ name, amount: predator.amount }))
        );
      })) : of(null)
    ]).pipe(
      first(),
      map(([itemName, baits, mapName, slap, intuition]) => {
        let macro = this.translate.instant(`FISH_TRAIN.${macroKey}`, {
          itemName,
          mapName,
          coords: useCurrentPos ? '<pos>' : `X:${current.node.x} - Y:${current.node.y}`,
          bait: baits.join(' -> '),
          minGathering: current.node.minGathering
        });
        if (slap) {
          macro = `${macro} ${this.translate.instant('FISH_TRAIN.Slap', { target: slap })}.`;
        }
        if (intuition) {
          macro = `${macro} ${this.translate.instant('FISH_TRAIN.Fish_before', { target: intuition.map(row => `${row.amount}x ${row.name}`).join(', ') })}.`;
        }
        return macro;
      })
    );
  };

  boardTrain(id: string): void {
    this.fishTrainFacade.boardTrain(id);
  }

  claimConductorRole(id: string, token: string): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('FISH_TRAIN.Enter_conductor_token'),
      nzComponentParams: {
        placeholder: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
      }
    }).afterClose.pipe(
      filter(res => res && res.length > 0)
    ).subscribe(res => {
      if (res.trim() === token) {
        this.fishTrainFacade.claimConductorRole(id);
        this.message.success(this.translate.instant('FISH_TRAIN.Conductor_role_claimed'));
      } else {
        this.message.error(this.translate.instant('FISH_TRAIN.Wrong_token'));
      }
    });
  }

  renameTrain(id: string, name: string): void {
    this.dialog.create({
      nzContent: NameQuestionPopupComponent,
      nzFooter: null,
      nzTitle: this.translate.instant('FISH_TRAIN.Rename_train'),
      nzComponentParams: {
        baseName: name
      }
    }).afterClose.pipe(
      filter(res => res && res.length > 0)
    ).subscribe(res => {
      this.fishTrainFacade.rename(id, res);
    });
  }

  leaveTrain(id: string): void {
    this.fishTrainFacade.leaveTrain(id);
  }

  openFishingOverlay(): void {
    this.ipc.openOverlay('/fishing-reporter-overlay');
  }

  setSlap(train: PersistedFishTrain, fish: FishTrainStop, slap: number): void {
    this.fishTrainFacade.setSlap(train, fish, slap);
  }

  setPublicFlag(id: string, flag: boolean): void {
    this.fishTrainFacade.setPublicFlag(id, flag);
  }

  setTrainWorld(id: string, world: string): void {
    this.fishTrainFacade.setTrainWorld(id, world);
  }

  notifyMovement(fish: FishTrainStop & { node: GatheringNode }): void {
    this.soundNotificationService.play(SoundNotificationType.FISH_TRAIN);
    combineLatest([
      this.lazyData.getRow('itemIcons', fish.id),
      this.i18n.getNameObservable('items', fish.id),
      this.lazyData.getEntry('mapEntries').pipe(
        switchMap(entries => this.i18n.getNameObservable('places', entries.find(e => e.id === fish.node.map)?.zone))
      )
    ]).pipe(
      first(),
      switchMap(([lazyIcon, itemName, placeName]) => {
        const icon = `https://xivapi.com${lazyIcon}`;
        const coords = `X: ${fish.node.x} - Y: ${fish.node.y}`;
        const title = this.translate.instant('FISH_TRAIN.Moving_notification_title');
        const body = this.translate.instant('FISH_TRAIN.Moving_notification', {
          itemName, placeName, coords
        });
        if (this.platform.isDesktop()) {
          this.ipc.send('notification', {
            title: title,
            content: body,
            icon: icon
          });
          return of(null);
        } else {
          this.notificationService.info(title, body);
          if (this.pushNotificationsService.isSupported() && this.pushNotificationsService.permission === 'granted') {
            this.pushNotificationsService.create(title,
              {
                icon: icon,
                renotify: false,
                body: body
              }
            );
          }
          return of(null);
        }
      })
    ).subscribe();
  }

  play(start: number, end: number): void {
    if (!this.timeTravel$.value || this.timeTravel$.value >= end) {
      this.timeTravel$.next(start);
    }
    this.playSub = this.playSpeed$.pipe(
      switchMap((speed) => timer(0, 1000 / speed))
    ).subscribe(() => {
      this.timeTravel$.next(this.timeTravel$.value + 1000);
      if (this.timeTravel$.value >= end) {
        this.pause();
      }
    });
  }

  pause(): void {
    this.playSub.unsubscribe();
    delete this.playSub;
  }

  stop(): void {
    if (this.playSub) {
      this.pause();
    }
    this.timeTravel$.next(null);
  }

  changeSpeed(): void {
    const speeds = [
      50,
      100,
      200,
      500
    ];
    const currentSpeed = speeds.indexOf(this.playSpeed$.value);
    this.playSpeed$.next(speeds[(currentSpeed + 1) % speeds.length]);
  }

  deleteTrain(key: string): void {
    this.fishTrainFacade.deleteTrain(key);
  }

  migrateTrain(train: PersistedFishTrain): void {
    const operation$ = this.fishDataService.getTrainStatsSnapshot(train.$key).pipe(
      switchMap(stats => {
        // Preparing characters first
        const characters$ = safeCombineLatest(train.passengers.map(passenger => this.lodestone.getUserCharacter(passenger).pipe(
            map(character => {
              return {
                id: passenger,
                name: character?.character?.Name || 'Anonymous'
              };
            })
          ))
        ).pipe(
          map(chars => {
            return chars.reduce((acc, char) => {
              return {
                ...acc,
                [char.id]: char.name
              };
            }, {});
          }),
          first()
        );

        // Then migrating stats model to new report model
        return characters$.pipe(
          map(chars => {
            return stats.reports.map(report => {
              return {
                trainId: train.$key,
                baitId: report.baitId,
                mooch: report.mooch,
                date: new Date(report.date).getTime(),
                name: chars[report.userId] || 'Anonymous',
                size: report.size,
                itemId: report.itemId
              } as TrainFishingReport;
            });
          }),
          switchMap(reports => {
            return this.fishTrainFacade.addReports(train.$key, reports);
          }),
          tap(() => this.fishTrainFacade.load(train.$key))
        );
      })
    );
    this.progressPopup.showProgress(operation$, 1);
  }
}
