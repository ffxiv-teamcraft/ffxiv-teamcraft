import { ChangeDetectorRef, Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { delayWhen, distinctUntilChanged, filter, first, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { DataType, FishTrainStop, GatheringNode, getExtract, getItemSource } from '@ffxiv-teamcraft/types';
import { combineLatest, of } from 'rxjs';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { TranslateService } from '@ngx-translate/core';
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
import { PushNotificationsService } from 'ng-push-ivy';

@Component({
  selector: 'app-fish-train',
  templateUrl: './fish-train.component.html',
  styleUrls: ['./fish-train.component.less']
})
export class FishTrainComponent extends TeamcraftComponent {

  fishTrain$ = this.fishTrainFacade.selectedFishTrain$;

  gubalFishTrainStats$ = this.fishTrain$.pipe(
    map(train => train.$key),
    distinctUntilChanged(),
    switchMap(trainId => {
      return this.fishDataService.getTrainStats(trainId);
    }),
    startWith({
      count: 0,
      reports: []
    })
  );

  fishTrainWithLocations$ = this.fishTrain$.pipe(
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
    this.fishTrainFacade.time$,
    this.fishTrainWithLocations$,
    this.fishTrainFacade.currentTrain$,
    this.gubalFishTrainStats$,
    this.authFacade.userId$
  ]).pipe(
    map(([time, train, currentTrain, gubalStats, userId]) => {
      let stops = train.fish;
      const stop = train.fish[train.fish.length - 1].end;
      const stopped = stop <= time;
      const running = !stopped && train.start <= time;
      const waiting = train.start >= time;
      let current = train.fish.find(stop => stop.start <= time && stop.end >= time);
      // If there's no current fish but train is running, we're moving to the next one !
      if (!current && running) {
        const lastIndex = findLastIndex(train.fish, stop => stop.start <= time);
        current = train.fish[lastIndex + 1] || null;
      }
      let currentIndex = train.fish.indexOf(current);
      if (currentIndex > 1 && running) {
        stops = stops.slice(currentIndex - 1);
        currentIndex = 1;
      }
      const matchingItemIds = train.fish.map(fish => fish.id);
      const accuracy = gubalStats.reports.length === 0 ? 0 :
        gubalStats.reports.filter(report => matchingItemIds.includes(report.itemId)).length / gubalStats.reports.length;
      const durationHours = (Math.min(time, train.end) - train.start) / (60000 * 60);
      const rate = (durationHours === 0 || gubalStats.reports.length === 0) ? 0 : Math.floor(100 * gubalStats.reports.length / durationHours) / 100;
      return {
        ...train,
        stops,
        current,
        currentIndex,
        stop,
        stopped,
        running,
        waiting,
        time,
        currentTrain,
        gubalStats,
        accuracy,
        rate,
        reports: gubalStats.reports,
        isConductor: userId === train.conductor
      };
    }),
    tap(display => {
      if (display.current) {
        const time = Math.floor(display.time / 1000);
        if (time === Math.floor(display.current.end / 1000)) {
          this.notifyMovement(display.fish[display.currentIndex + 1]);
        }
      }
      this.cd.detectChanges();
    }),
    shareReplay(1)
  );

  public servers$ = this.lazyData.servers$;

  public loggedIn$ = this.authFacade.loggedIn$;

  macroPopoverShown = false;

  constructor(private fishTrainFacade: FishTrainFacade, private route: ActivatedRoute,
              private lazyData: LazyDataFacade, private i18n: I18nToolsService,
              public translate: TranslateService, private fishDataService: FishDataService,
              public platform: PlatformService, private ipc: IpcService,
              private dialog: NzModalService, private message: NzMessageService,
              private authFacade: AuthFacade, private soundNotificationService: SoundNotificationService,
              private notificationService: NzNotificationService, private pushNotificationsService: PushNotificationsService,
              private cd: ChangeDetectorRef, private router: Router) {
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
      this.i18n.getNameObservable('items', current.node.baits[current.node.baits.length - 1].id),
      this.lazyData.getEntry('mapEntries').pipe(
        switchMap(entries => this.i18n.getNameObservable('places', entries.find(e => e.id === current.node.map)?.zone))
      )
    ]).pipe(
      first(),
      map(([itemName, baitName, mapName]) => {
        return this.translate.instant(`FISH_TRAIN.${macroKey}`, {
          itemName,
          mapName,
          coords: useCurrentPos ? '<pos>' : `X:${current.node.x} - Y:${current.node.y}`,
          bait: baitName,
          minGathering: current.node.minGathering
        });
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
            return this.pushNotificationsService.create(title,
              {
                icon: icon,
                sticky: false,
                renotify: false,
                body: body
              }
            ).pipe(
              map(() => void 0)
            );
          }
          return of(null);
        }
      })
    ).subscribe();
  }

}
