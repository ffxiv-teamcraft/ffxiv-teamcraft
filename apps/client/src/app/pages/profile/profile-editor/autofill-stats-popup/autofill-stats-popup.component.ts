import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IpcService } from '../../../../core/electron/ipc.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { TeamcraftComponent } from '../../../../core/component/teamcraft-component';
import { AuthFacade } from '../../../../+state/auth.facade';
import { EorzeaFacade } from '../../../../modules/eorzea/+state/eorzea.facade';

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

  constructor(private ipc: IpcService, private authFacade: AuthFacade,
              private eorzeaFacade: EorzeaFacade) {
    super();
    this.eorzeaFacade.classJobSet$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(set => {
        this.authFacade.saveSet(set);
        this.completion$.next({
          ...this.completion$.value,
          [set.jobId]: true
        });
      });
  }

}
