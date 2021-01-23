import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { BehaviorSubject, combineLatest, EMPTY, interval } from 'rxjs';
import { SettingsService } from '../../modules/settings/settings.service';
import { filter, map, mapTo, startWith, switchMap } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../tools/i18n-tools.service';

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
}

@Injectable({
  providedIn: 'root'
})
export class RetainersService {

  private static readonly LS_KEY = 'retainers';

  public retainers$ = new BehaviorSubject(JSON.parse(localStorage.getItem(RetainersService.LS_KEY) || '{}'));

  public get retainers(): Record<string, Retainer> {
    return this.retainers$.value;
  }

  constructor(private ipc: IpcService, private settings: SettingsService,
              private translate: TranslateService, private i18n: I18nToolsService,
              private lazyData: LazyDataService) {
    this.settings.settingsChange$.pipe(
      filter(change => change === 'retainerTaskAlarms'),
      startWith(this.settings.retainerTaskAlarms),
      switchMap(() => {
        if (!this.settings.retainerTaskAlarms) {
          return EMPTY;
        } else {
          return combineLatest([
            interval(1000).pipe(mapTo(Math.floor(Date.now() / 1000))),
            this.retainers$
          ]);
        }
      }),
      map(([now, retainers]) => {
        return Object.values<Retainer>(retainers)
          .filter(retainer => retainer.taskComplete === now);
      })
    ).subscribe(retainers => {
      if (retainers.length > 0) {
        // Let's ring the alarm !
        let audio: HTMLAudioElement;
        // If this isn't a file path (desktop app), then take it inside the assets folder.
        if (this.settings.alarmSound.indexOf(':') === -1) {
          audio = new Audio(`./assets/audio/${this.settings.alarmSound}.mp3`);
        } else {
          audio = new Audio(this.settings.alarmSound);
        }
        audio.loop = false;
        audio.volume = this.settings.alarmVolume;
        audio.play();
      }
      retainers.forEach(retainer => {
        this.ipc.send('notification', {
          title: this.translate.instant('RETAINERS.Task_completed_notification_title', { name: retainer.name }),
          content: this.translate.instant('RETAINERS.Task_completed_notification_content', {
            name: retainer.name,
            taskName: this.i18n.getName(this.lazyData.data.ventures[retainer.task])
          })
        });
      });

    });
  }

  init(): void {
    this.ipc.retainerInformationPackets$.subscribe(packet => {
      const retainers = this.retainers;
      retainers[packet.retainerID.toString(16)] = {
        name: packet.name,
        order: packet.hireOrder,
        itemCount: packet.itemCount,
        itemSellingCount: packet.itemSellingCount,
        level: packet.level,
        job: packet.classJobID,
        task: packet.ventureID,
        taskComplete: packet.ventureComplete,
        gil: packet.gil
      };
      this.retainers$.next(retainers);
      this.persist();
    });
  }

  persist(): void {
    localStorage.setItem(RetainersService.LS_KEY, JSON.stringify(this.retainers));
  }
}
