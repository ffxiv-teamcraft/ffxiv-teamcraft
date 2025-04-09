import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { combineLatest } from 'rxjs';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';
import { IpcService } from '../../../core/electron/ipc.service';
import { PacketCaptureStatus } from '../../../core/electron/packet-capture-status';
import { LogTracking } from '../../../model/user/log-tracking';
import { ofMessageType } from '../../../core/rxjs/of-message-type';
import { toIpcData } from '../../../core/rxjs/to-ipc-data';
import { LogTrackingService } from '../../../core/database/log-tracking.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzAlertComponent } from 'ng-zorro-antd/alert';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { JobUnicodePipe } from '../../../pipes/pipes/job-unicode.pipe';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { LazyScrollComponent } from '../../../modules/lazy-scroll/lazy-scroll/lazy-scroll.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-log-tracker-import-popup',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
    NzSpinComponent,
    NzAlertComponent,
    NzIconDirective,
    NzDividerComponent,
    JobUnicodePipe,
    NzCardComponent,
    LazyScrollComponent,
    ItemIconComponent,
    I18nNameComponent,
    NgTemplateOutlet,
    NzButtonComponent,
    NzPopconfirmDirective,
    NzRowDirective,
    NzColDirective
  ],
  templateUrl: './log-tracker-import-popup.component.html',
  styleUrl: './log-tracker-import-popup.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogTrackerImportPopupComponent {

  #lazyData = inject(LazyDataFacade);

  #logTrackingService = inject(LogTrackingService);

  #auth = inject(AuthFacade);

  #ipc = inject(IpcService);

  #translate = inject(TranslateService);

  #message = inject(NzMessageService);

  #modalRef = inject(NzModalRef);

  currentLog$ = this.#auth.logTracking$;

  baseData$ = combineLatest([
    this.#lazyData.getEntry('recipes'),
    this.#lazyData.getEntry('gatheringItems'),
    this.#lazyData.getEntry('fishParameter')
  ]).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  pcapReady$ = this.#ipc.pcapStatus$.pipe(
    map(status => status === PacketCaptureStatus.RUNNING)
  );

  readyToImport$ = combineLatest([
    this.baseData$,
    this.pcapReady$
  ]).pipe(
    map(([data, ready]) => data && ready)
  );

  logs$ = this.baseData$.pipe(
    switchMap(([recipes, gatheringItems, fishParameter]) => {
      return combineLatest([
        this.#ipc.packets$.pipe(
          ofMessageType('craftingLog'),
          toIpcData()
        ),
        this.#ipc.packets$.pipe(
          ofMessageType('gatheringLog'),
          toIpcData()
        )
      ]).pipe(
        map(([{ log: craftingLog }, { log: gatheringLog }]) => {
          const logTracking = new LogTracking();
          // Gathering log
          Object.keys(gatheringItems).forEach(key => {
            if (this.isDoHDoLEntryDone(gatheringLog, +key)) {
              logTracking.gathering.push(gatheringItems[key].itemId);
            }
          });
          // Crafting log
          recipes.forEach(recipe => {
            if (typeof recipe.id === 'string') {
              return;
            }
            if (this.isDoHDoLEntryDone(craftingLog, +recipe.id)) {
              logTracking.crafting.push(+recipe.id);
            }
          });
          return logTracking;
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  diff$ = combineLatest([
    this.currentLog$.pipe(first()),
    this.logs$,
    this.#lazyData.getEntry('recipes'),
    this.#lazyData.getEntry('fishes')
  ]).pipe(
    map(([current, imported, recipes,  fishes]) => {
      return {
        additions: {
          crafting: imported.crafting.filter(id => !current.crafting.includes(id)).map(id => {
            return recipes.find(r => +r.id === id);
          }).filter(Boolean).sort((a, b) => {
            if (a.job === b.job) {
              return a.rlvl - b.rlvl;
            }
            return a.job - b.job;
          }),
          gathering: imported.gathering.filter(id => !current.gathering.includes(id))
        },
        deletions: {
          crafting: current.crafting.filter(id => !imported.crafting.includes(id)).map(id => {
            return recipes.find(r => +r.id === id);
          }).filter(Boolean).sort((a, b) => {
            if (a.job === b.job) {
              return a.rlvl - b.rlvl;
            }
            return a.job - b.job;
          }),
          gathering: current.gathering.filter(id => !imported.gathering.includes(id) && !fishes.includes(id))
        }
      };
    })
  );

  trackByRecipe = (recipe) => recipe.id;

  protected saveLogs(log: LogTracking): void {
    this.#auth.logTracking$.pipe(
      first(),
      switchMap(current => {
        current.crafting = [...current.crafting, ...log.crafting];
        current.gathering = [...current.gathering, ...log.gathering];
        return this.#logTrackingService.set(current.$key, current);
      })
    ).subscribe(() => {
      this.#message.success(this.#translate.instant('LOG_TRACKER.Logs_import_done'));
      this.close();
    });
  }

  protected close(): void {
    this.#modalRef.close();
  }

  private isDoHDoLEntryDone(log: Uint8Array, index: number): boolean {
    const offset = Math.floor(index / 8);
    const byte = log[offset];
    const mask = 128 >> (index % 8);
    return (byte & mask) > 0;
  }

  private isPlayerSetupEntryDone(log: Uint8Array, index: number): boolean {
    const offset = Math.floor(index / 8);
    const byte = log[offset];
    const mask = 1 << (index % 8);
    return (byte & mask) > 0;
  }
}
