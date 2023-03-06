import { ChangeDetectorRef, Component } from '@angular/core';
import { FishTrainFacade } from '../../../modules/fish-train/fish-train/fish-train.facade';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, map, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FishTrainStatus } from './fish-train-status';
import { distinctUntilChanged, startWith, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { getFishTrainStatus } from '../../../modules/fish-train/get-fish-train-status';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { DataModel } from '../../../core/database/storage/data-model';

@Component({
  selector: 'app-fish-trains',
  templateUrl: './fish-trains.component.html',
  styleUrls: ['./fish-trains.component.less']
})
export class FishTrainsComponent extends TeamcraftComponent {

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
    name: new FormControl<string>(''),
    datacenter: new FormControl<string>(null)
  });

  public datacenters$ = this.lazyData.datacenters$;

  results$ = this.filtersForm.valueChanges.pipe(
    startWith(this.filtersForm.getRawValue()),
    withLatestFrom(this.datacenters$),
    switchMap(([filters, datacenters]) => {
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
                && (!filters.datacenter || datacenters[filters.datacenter]?.some(server => server.toLowerCase() === train.world?.toLowerCase() || !train.world))
                && (filters.status === FishTrainStatus.ANY || train.status === filters.status);
            })
            .sort((a, b) => b.start - a.start);
        })
      );
    }),
    tap(() => this.cd.markForCheck())
  );

  userTrains$ = combineLatest([
    this.fishTrainFacade.allTrains$,
    this.authFacade.userId$.pipe(distinctUntilChanged())
  ]).pipe(
    map(([trains, userId]) => trains.filter(train => train.conductor === userId))
  );

  public datacentersList$ = this.lazyData.datacenters$.pipe(
    map(dc => Object.keys(dc))
  );

  constructor(private fishTrainFacade: FishTrainFacade, public translate: TranslateService,
              private cd: ChangeDetectorRef, private authFacade: AuthFacade,
              private lazyData: LazyDataFacade) {
    super();
    fishTrainFacade.loadAll();
    this.authFacade.mainCharacter$.pipe(
      map(char => char?.Server),
      distinctUntilChanged(),
      switchMap(server => {
        return this.datacenters$.pipe(
          map(datacenters => {
            return Object.keys(datacenters).find(dc => datacenters[dc].some(entry => entry.toLowerCase() === server.toLowerCase()));
          })
        );
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(datacenter => {
      this.filtersForm.patchValue({
        datacenter
      }, { emitEvent: true });
    });
  }

  trackByKey(index: number, element: DataModel): string {
    return element.$key;
  }

}
