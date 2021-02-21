import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { BehaviorSubject, combineLatest, EMPTY, interval, Observable } from 'rxjs';
import { SettingsService } from '../../modules/settings/settings.service';
import { filter, map, mapTo, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';
import { TranslateService } from '@ngx-translate/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { UserInventory } from '../../model/user/inventory/user-inventory';
import { select, Store } from '@ngrx/store';
import { inventoryQuery } from '../../modules/inventory/+state/inventory.selectors';
import { InventoryPartialState } from '../../modules/inventory/+state/inventory.reducer';

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
}

@Injectable({
  providedIn: 'root'
})
export class RetainersService {

  private static readonly LS_KEY = 'retainers';

  public retainers$ = new BehaviorSubject(JSON.parse(localStorage.getItem(RetainersService.LS_KEY) || '{}'));

  private contentId$: Observable<string> = this.store.pipe(
    select(inventoryQuery.getInventory),
    filter(inventory => inventory !== null),
    map((inventory: UserInventory) => inventory.contentId)
  );

  public get retainers(): Record<string, Retainer> {
    return this.retainers$.value;
  }

  constructor(private ipc: IpcService, private settings: SettingsService,
              private translate: TranslateService, private i18n: I18nToolsService,
              private lazyData: LazyDataService, private store: Store<InventoryPartialState>) {
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

  persist(): void {
    localStorage.setItem(RetainersService.LS_KEY, JSON.stringify(this.retainers));
  }
}
