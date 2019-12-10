import { InjectionToken, Provider } from '@angular/core';
import { DesynthResultReporter } from './desynth-result-reporter';
import { ReductionResultReporter } from './reduction-result-reporter';
import { MachinaService } from '../electron/machina.service';
import { FishingReporter } from './fishing-reporter';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { LazyDataService } from '../data/lazy-data.service';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';

export const DataReporters = new InjectionToken('DataReporters');

export const DATA_REPORTERS: Provider[] = [
  { provide: DataReporters, useClass: DesynthResultReporter, multi: true },
  { provide: DataReporters, useClass: ReductionResultReporter, multi: true, deps: [MachinaService] },
  { provide: DataReporters, useClass: FishingReporter, multi: true, deps: [EorzeaFacade, LazyDataService, EorzeanTimeService, IpcService] }
];
