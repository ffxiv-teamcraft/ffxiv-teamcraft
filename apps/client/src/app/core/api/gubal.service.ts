import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IpcService } from '../electron/ipc.service';
import { debounceTime, first, mapTo, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { DataReporter } from '../data-reporting/data-reporter';
import { DataReporters } from '../data-reporting/data-reporters-index';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class GubalService {

  constructor(private http: HttpClient, private ipc: IpcService, private authFacade: AuthFacade,
              @Inject(DataReporters) private reporters: DataReporter[], private apollo: Apollo) {
  }

  private submitData(dataType: string, data: any): Observable<void> {
    const query = gql`mutation addData($data: ${dataType}_insert_input!) {
        insert_${dataType}(objects: [$data]) {
          affected_rows
        }
      }`;
    return this.authFacade.userId$.pipe(
      first(),
      switchMap(userId => {
        return this.apollo.mutate({
          mutation: query,
          variables: {
            data: {
              ...data,
              userId: userId
            }
          }
        });
      }),
      mapTo(null)
    );
  }

  public init(): void {
    combineLatest(this.reporters.map(reporter => {
      return reporter.getDataReports(this.ipc.packets$)
        .pipe(
          debounceTime(500),
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
