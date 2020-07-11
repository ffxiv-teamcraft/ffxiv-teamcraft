import { ProbeReport } from '../model/probe-report';
import { InjectionToken } from '@angular/core';

export const METRICS_DISPLAY_FILTERS = new InjectionToken('metrics:filters');

export interface MetricsDisplayFilter<T extends Array<any>> {
  getName(): string;

  matches(input: ProbeReport, ...args: T): boolean;
}
