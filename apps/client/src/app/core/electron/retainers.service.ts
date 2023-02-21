import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { BehaviorSubject, combineLatest, EMPTY, interval, ReplaySubject } from 'rxjs';
import { SettingsService } from '../../modules/settings/settings.service';
import { delay, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { SoundNotificationType } from '../sound-notification/sound-notification-type';
import { SoundNotificationService } from '../sound-notification/sound-notification.service';
import { InventoryItem } from '../../model/user/inventory/inventory-item';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { PlatformService } from '../tools/platform.service';

export interface Retainer {
  name: string;
  order: number;
  itemCount: number;
  itemSellingCount: number;
  level: number;
  job: number;
  task: number;
  taskComplete: number;
  gil: number;
  character: string;
  marketItems?: InventoryItem[];
}

@Injectable({
  providedIn: 'root'
})
export class RetainersService {

  private static readonly LS_KEY = 'retainers';

  public retainers$ = new BehaviorSubject(JSON.parse(localStorage.getItem(RetainersService.LS_KEY) || '{}'));

  private contentId$ = new ReplaySubject<string>();

  constructor(private ipc: IpcService, private settings: SettingsService,
              private translate: TranslateService, private i18n: I18nToolsService,
              private lazyData: LazyDataFacade, private soundNotificationService: SoundNotificationService,
              private platform: PlatformService) {
    this.settings.watchSetting('retainerTaskAlarms', false).pipe(
      delay(1000),
      switchMap(() => {
        if (!this.settings.retainerTaskAlarms) {
          return EMPTY;
        } else {
          return combineLatest([
            interval(1000).pipe(map(() => Math.floor(Date.now() / 1000))),
            this.retainers$,
            this.lazyData.getEntry('ventures')
          ]);
        }
      }),
      map(([now, retainers, ventures]) => {
        return {
          retainers: Object.values<Retainer>(retainers)
            .filter(retainer => retainer.taskComplete === now),
          ventures
        };
      })
    ).subscribe(({ retainers, ventures }) => {
      if (retainers.length > 0) {
        this.soundNotificationService.play(SoundNotificationType.RETAINER);
      }
      retainers.forEach(retainer => {
        this.ipc.send('notification', {
          title: this.translate.instant('RETAINERS.Task_completed_notification_title', { name: retainer.name }),
          content: this.translate.instant('RETAINERS.Task_completed_notification_content', {
            name: retainer.name,
            taskName: this.i18n.getName(ventures[retainer.task])
          })
        });
      });
    });
  }

  public set contentId(cid: string) {
    this.contentId$.next(cid);
  }

  public get retainers(): Record<string, Retainer> {
    return this.retainers$.value;
  }

  init(): void {
    if (this.platform.isDesktop()) {
      this.ipc.retainerInformationPackets$
        .pipe(
          withLatestFrom(this.contentId$)
        )
        .subscribe(([packet, contentId]) => {
          const retainers = this.retainers;
          retainers[packet.retainerId.toString(16).substr(-8)] = {
            name: packet.name,
            order: packet.hireOrder,
            itemCount: packet.itemCount,
            itemSellingCount: packet.sellingCount,
            level: packet.level,
            job: packet.classJob,
            task: packet.ventureId,
            taskComplete: packet.ventureComplete,
            gil: packet.gil,
            character: contentId
          };
          this.retainers$.next(retainers);
          this.persist();
        });
    }
  }

  persist(): void {
    localStorage.setItem(RetainersService.LS_KEY, JSON.stringify(this.retainers));
  }

  resetRetainers(): void {
    this.retainers$.next({});
    this.persist();
  }
}
