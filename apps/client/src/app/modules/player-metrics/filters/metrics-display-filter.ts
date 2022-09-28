import { ProbeReport } from '../model/probe-report';
import { InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

export const METRICS_DISPLAY_FILTERS = new InjectionToken('metrics:filters');

export abstract class MetricsDisplayFilter<T extends Array<any>> {
  loadData(): Observable<any> {
    return of(void 0)
  }

  abstract getName(): string;

  abstract matches(input: ProbeReport, ...args: T): boolean;
}
