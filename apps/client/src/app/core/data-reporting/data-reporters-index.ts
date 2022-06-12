import { InjectionToken, Provider } from '@angular/core';
import { ReductionResultReporter } from './reduction-result-reporter';
import { PacketCaptureTrackerService } from '../electron/packet-capture-tracker.service';
import { FishingReporter } from './fishing-reporter';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';
import { SubmarineExplorationResultReporter } from './submarine-exploration-result-reporter';
import { AirshipExplorationResultReporter } from './airship-exploration-result-reporter';
import { SettingsService } from '../../modules/settings/settings.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

export const DataReporters = new InjectionToken('DataReporters');

export const DATA_REPORTERS: Provider[] = [
  // { provide: DataReporters, useClass: DesynthResultReporter, multi: true },
  { provide: DataReporters, useClass: ReductionResultReporter, multi: true, deps: [PacketCaptureTrackerService] },
  { provide: DataReporters, useClass: FishingReporter, multi: true, deps: [EorzeaFacade, LazyDataFacade, EorzeanTimeService, IpcService, SettingsService] },
  { provide: DataReporters, useClass: SubmarineExplorationResultReporter, multi: true, deps: [LazyDataFacade] },
  { provide: DataReporters, useClass: AirshipExplorationResultReporter, multi: true, deps: [LazyDataFacade] }
];
