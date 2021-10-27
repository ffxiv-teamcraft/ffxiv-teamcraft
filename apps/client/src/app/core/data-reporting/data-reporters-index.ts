import { InjectionToken, Provider } from '@angular/core';
import { DesynthResultReporter } from './desynth-result-reporter';
import { ReductionResultReporter } from './reduction-result-reporter';
import { PacketCaptureTrackerService } from '../electron/packet-capture-tracker.service';
import { FishingReporter } from './fishing-reporter';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { LazyDataService } from '../data/lazy-data.service';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';
import { SubmarineExplorationResultReporter } from './submarine-exploration-result-reporter';
import { AirshipExplorationResultReporter } from './airship-exploration-result-reporter';
import { SettingsService } from '../../modules/settings/settings.service';

export const DataReporters = new InjectionToken('DataReporters');

export const DATA_REPORTERS: Provider[] = [
  { provide: DataReporters, useClass: DesynthResultReporter, multi: true },
  { provide: DataReporters, useClass: ReductionResultReporter, multi: true, deps: [PacketCaptureTrackerService] },
  { provide: DataReporters, useClass: FishingReporter, multi: true, deps: [EorzeaFacade, LazyDataService, EorzeanTimeService, IpcService, SettingsService] },
  { provide: DataReporters, useClass: SubmarineExplorationResultReporter, multi: true, deps: [LazyDataService] },
  { provide: DataReporters, useClass: AirshipExplorationResultReporter, multi: true, deps: [LazyDataService] }
];
