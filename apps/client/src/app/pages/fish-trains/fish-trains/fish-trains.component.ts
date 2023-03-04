import { ChangeDetectorRef, Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, map, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FishTrainStatus } from './fish-train-status';
import { startWith, tap } from 'rxjs/operators';
import { getFishTrainStatus } from '../../../modules/fish-train/get-fish-train-status';

@Component({
  selector: 'app-fish-trains',
  templateUrl: './fish-trains.component.html',
  styleUrls: ['./fish-trains.component.less']
})
export class FishTrainsComponent {

  FishTrainStatus = FishTrainStatus;

  runningOptions$ = combineLatest([
    this.translate.get('COMMON.Any'),
    this.translate.get('FISH_TRAIN.Waiting'),
    this.translate.get('FISH_TRAIN.Running'),
    this.translate.get('FISH_TRAIN.Stopped')
  ]).pipe(
    map(([anyLabel, waitingLabel, runningLabel, stoppedLabel]) => {
      return [
        {
          label: anyLabel,
          value: FishTrainStatus.ANY
        },
        {
          label: waitingLabel,
          value: FishTrainStatus.WAITING
        },
        {
          label: runningLabel,
          value: FishTrainStatus.RUNNING
        },
        {
          label: stoppedLabel,
          value: FishTrainStatus.STOPPED
        }
      ];
    })
  );

  filtersForm = new FormGroup({
    status: new FormControl<FishTrainStatus>(FishTrainStatus.ANY),
    name: new FormControl<string>('')
  });

  results$ = this.filtersForm.valueChanges.pipe(
    startWith(this.filtersForm.getRawValue()),
    switchMap(filters => {
      return this.fishTrainFacade.allPublicTrains$.pipe(
        map(trains => {
          return trains
            .map(train => {
              return {
                ...train,
                status: getFishTrainStatus(train)
              };
            })
            .filter(train => {
              return train.name.includes(filters.name)
                && (filters.status === FishTrainStatus.ANY || train.status === filters.status);
            })
            .sort((a, b) => b.start - a.start);
        })
      );
    }),
    tap(() => this.cd.markForCheck())
  );

  constructor(private fishTrainFacade: FishTrainFacade, public translate: TranslateService,
              private cd: ChangeDetectorRef) {
    fishTrainFacade.loadAll();
  }

}
