import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';
import { shareReplay, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DataReporter } from '../data-reporting/data-reporter';
import { DataReporters } from '../data-reporting/data-reporters-index';

@Injectable({
  providedIn: 'root'
})
export class GubalService {

  private userId$: Observable<string> = this.authFacade.userId$.pipe(shareReplay(1));

  constructor(private http: HttpClient, private ipc: IpcService, private authFacade: AuthFacade,
              @Inject(DataReporters) private reporters: DataReporter[]) {
  }

  private submitData(dataType: string, data: any): Observable<void> {
    return this.userId$.pipe(
      switchMap(userId => {
        userId = !environment.production ? 'beta' : userId;
        return this.http.post<void>(`https://gubal.ffxivteamcraft.com/${dataType}`, {
          userId: userId,
          ...data
        });
      })
    );
  }

  public init(): void {
    combineLatest(this.reporters.map(reporter => {
      return reporter.getDataReports(this.ipc.packets$)
        .pipe(
          switchMap(dataReports => {
            if (dataReports.length === 0) {
              return of(null);
            }
            return combineLatest(dataReports.map(data => {
              return this.submitData(reporter.getDataType(), data);
            }));
          })
        );
    })).subscribe();
  }
}
