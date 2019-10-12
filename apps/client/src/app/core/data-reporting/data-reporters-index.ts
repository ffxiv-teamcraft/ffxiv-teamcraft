import { InjectionToken, Provider } from '@angular/core';
import { DesynthResultReporter } from './desynth-result-reporter';
import { ReductionResultReporter } from './reduction-result-reporter';
import { MachinaService } from '../electron/machina.service';
import { QuicksynthResultReporter } from './quicksynth-result-reporter';
import { LazyDataService } from '../data/lazy-data.service';

export const DataReporters = new InjectionToken('DataReporters');

export const DATA_REPORTERS: Provider[] = [
  { provide: DataReporters, useClass: DesynthResultReporter, multi: true },
  { provide: DataReporters, useClass: ReductionResultReporter, multi: true, deps: [MachinaService] },
  { provide: DataReporters, useClass: QuicksynthResultReporter, multi: true, deps: [MachinaService, LazyDataService] }
];
