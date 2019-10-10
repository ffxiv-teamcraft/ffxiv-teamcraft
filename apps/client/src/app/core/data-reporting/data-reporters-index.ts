import { InjectionToken, Provider } from '@angular/core';
import { DesynthResultReporter } from './desynth-result-reporter';

export const DataReporters = new InjectionToken('DataReporters');

export const DATA_REPORTERS: Provider[] = [
  { provide: DataReporters, useClass: DesynthResultReporter, multi: true }
];
