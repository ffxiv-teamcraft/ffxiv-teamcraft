import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IpcService } from '../../../../core/electron/ipc.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { AuthFacade } from '../../../../+state/auth.facade';

@Component({
  selector: 'app-autofill-stats-popup',
  templateUrl: './autofill-stats-popup.component.html',
  styleUrls: ['./autofill-stats-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutofillStatsPopupComponent extends TeamcraftComponent {

  private completion$: BehaviorSubject<{ [index: number]: boolean }> = new BehaviorSubject({});

  public display$: Observable<{ job: number, done: boolean }[]> = this.completion$.pipe(
    map((completion) => {
      return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(job => {
        return {
          job: job,
          done: completion[job]
        };
      });
    })
  );

  private soulCrystal$ = this.ipc.itemInfoPackets$.pipe(
    filter(packet => {
      return packet.catalogId >= 10337 && packet.catalogId <= 10344 && packet.slot === 13 && packet.containerId === 1000;
    }),
    startWith({
      catalogId: 0
    })
  );

  constructor(private ipc: IpcService, private authFacade: AuthFacade) {
    super();
    combineLatest([this.ipc.playerStatsPackets$, this.ipc.updateClassInfoPackets$, this.soulCrystal$]).pipe(
      debounceTime(500),
      takeUntil(this.onDestroy$),
      switchMap(([playerStats, classInfo, soulCrystal]) => {
        return this.authFacade.gearSets$.pipe(
          first(),
          map(sets => {
            return sets.find(set => set.jobId === classInfo.classId);
          }),
          filter(set => set !== undefined),
          map(set => {
            return {
              ...set,
              level: classInfo.level,
              cp: playerStats.cp,
              control: playerStats.control,
              craftsmanship: playerStats.craftsmanship,
              specialist: soulCrystal.catalogId === set.jobId + 10329
            };
          })
        );
      })
    ).subscribe(set => {
      this.authFacade.saveSet(set);
      this.completion$.next({
        ...this.completion$.value,
        [set.jobId]: true
      });
    });
  }

}
