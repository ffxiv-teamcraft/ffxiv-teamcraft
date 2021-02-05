import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreecompanyWorkshopFacade } from '../../../modules/freecompany-workshops/+state/freecompany-workshop.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { VesselType } from '../../../modules/freecompany-workshops/model/vessel-type';
import { Observable } from 'rxjs/Observable';
import { Vessel } from '../../../modules/freecompany-workshops/model/vessel';

@Component({
  selector: 'app-voyage-tracker',
  templateUrl: './voyage-tracker.component.html',
  styleUrls: ['./voyage-tracker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoyageTrackerComponent implements OnInit {
  isLoading$ = new BehaviorSubject(true);
  private machinaToggle = false;

  public airshipMaxRank$ = new BehaviorSubject(null);
  public submarineMaxRank$ = new BehaviorSubject(null);

  public display$ = this.freecompanyWorkshopFacade.workshops$.pipe(
    map((results) => {
      this.isLoading$.next(true);
      const worlds = {};
      results.forEach((fc) => {
        if (worlds[fc.world] === undefined) {
          worlds[fc.world] = [];
        }
        worlds[fc.world].push(fc);
      });
      return worlds;
    }),
    tap(() => {
      this.isLoading$.next(false);
    }),
    switchMap((results) => timer(0, 1000).pipe(
      map(() => results)
    )),
    finalize(() => {
      this.isLoading$.next(false);
    })
  );

  constructor(private dialog: NzModalService, private ipc: IpcService,
              private lazyData: LazyDataService, public translate: TranslateService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade) {
  }

  ngOnInit(): void {
    this.ipc.once('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.freecompanyWorkshopFacade.load();
    this.submarineMaxRank$.next(Object.keys(this.lazyData.data.submarineRanks).pop());
    this.airshipMaxRank$.next(50);
  }

  importFromPcap(): void {
    this.freecompanyWorkshopFacade.importFromPcap();
  }

  isVesselBack(vessel: Vessel): boolean {
    if (vessel === null) {
      return true;
    }
    return vessel.returnTime <= Date.now() / 1000;
  }

  isVesselCompleted(vessel: Vessel): boolean {
    if (vessel === null) {
      return false;
    }
    return vessel.status === 2 && this.isVesselBack(vessel);
  }

  getRemainingTime(unixTimestamp: number): number {
    return this.freecompanyWorkshopFacade.getRemainingTime(unixTimestamp);
  }

  getNoVesselMessageByVesselType(vesselType: VesselType): string {
    return vesselType === VesselType.AIRSHIP ? this.translate.instant('VOYAGE_TRACKER.No_airship') : this.translate.instant('VOYAGE_TRACKER.No_submersible');
  }

  getMaxRankByVesselType(vesselType: VesselType): Observable<number> {
    return vesselType === VesselType.AIRSHIP ? this.airshipMaxRank$ : this.submarineMaxRank$;
  }

  trackByWorldKey(index, value) {
    return value.key;
  }

  trackById(index, value) {
    return value.id;
  }
}
