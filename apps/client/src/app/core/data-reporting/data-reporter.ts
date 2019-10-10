import { Observable } from 'rxjs';

export interface DataReporter {
  getDataReports(packets$: Observable<any>): Observable<any[]>;

  getDataType(): string;
}
