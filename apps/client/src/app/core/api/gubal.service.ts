import { Inject, Injectable } from '@angular/core';
import { IpcService } from '../electron/ipc.service';
import { catchError, debounceTime, first, map, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../+state/auth.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { DataReporter } from '../data-reporting/data-reporter';
import { DataReporters } from '../data-reporting/data-reporters-index';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { PlatformService } from '../tools/platform.service';
import { EnvironmentService } from '../environment.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GubalService {

  private readonly version: number;

  constructor(private ipc: IpcService, private authFacade: AuthFacade, private envService: EnvironmentService,
              @Inject(DataReporters) private reporters: DataReporter[], private apollo: Apollo,
              private platform: PlatformService) {
    const versionFragments = environment.version.toString().split('.');
    this.version = (+versionFragments[0] * 100000) + (+versionFragments[1] * 100) + (+versionFragments[2]);
  }

  public init(): void {
    if (this.platform.isDesktop()) {
      combineLatest(this.reporters.map(reporter => {
        return reporter.getDataReports(this.ipc.packets$).pipe(
          debounceTime(500),
          switchMap(dataReports => {
            if (dataReports.length === 0) {
              return of(null);
            }
            return this.submitData(reporter.getDataType(), dataReports);
          })
        );
      })).subscribe();
    }
  }

  private submitData(dataType: string, data: any[]): Observable<void> {
    let query = gql`mutation add${dataType}Data($data: [${dataType}_insert_input!]!) {
        insert_${dataType}(objects: $data) {
          affected_rows
        }
      }`;
    if (dataType === 'bnpc') {
      query = gql`mutation add${dataType}Data($data: [${dataType}_insert_input!]!) {
        insert_${dataType}(objects: $data, on_conflict: {
      constraint: bnpc_bnpcName_bnpcBase_key,
      update_columns: []
    }) {
          affected_rows
        }
      }`;
    }
    return this.authFacade.userId$.pipe(
      first(),
      switchMap(userId => {
        return this.apollo.mutate({
          mutation: query,
          variables: {
            data: data.map(row => ({
              ...row,
              userId: userId,
              version: this.version || -1
            }))
          }
        });
      }),
      catchError(() => of(null)),
      map(() => null)
    );
  }
}
