import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { FreecompanyWorkshopFacade } from '../+state/freecompany-workshop.facade';
import { VesselType } from '../model/vessel-type';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';

@Component({
  selector: 'app-import-workshop-from-pcap-popup',
  templateUrl: './import-workshop-from-pcap-popup.component.html',
  styleUrls: ['./import-workshop-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportWorkshopFromPcapPopupComponent extends TeamcraftComponent implements OnInit {
  public dataLoaded$ = new BehaviorSubject<boolean>(false);
  public freecompany$ = new BehaviorSubject(null);

  public isLoading$ = new BehaviorSubject<boolean>(false);

  public airshipList$ = new BehaviorSubject(Array(4));
  public submarineList$ = new BehaviorSubject(Array(4));

  private partConditions = {
    [VesselType.AIRSHIP]: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    [VesselType.SUBMARINE]: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
  };

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade,
              private xivapiService: XivapiService, private lazyData: LazyDataService) {
    super();
  }

  ngOnInit(): void {
    this.freecompanyWorkshopFacade.vesselPartUpdate$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((itemInfo) => {
      const pc = this.freecompanyWorkshopFacade.getVesselPartCondition(itemInfo);
      this.partConditions[pc.type][pc.vesselSlot][pc.partSlot] = pc.condition;
    });

    this.freecompanyWorkshopFacade.airshipStatus$.pipe(
      map((status) => {
        const newState = { ...status };
        newState.vessel.parts.hull.condition = this.partConditions[VesselType.AIRSHIP][status.slot][0];
        newState.vessel.parts.rigging.condition = this.partConditions[VesselType.AIRSHIP][status.slot][1];
        newState.vessel.parts.forecastle.condition = this.partConditions[VesselType.AIRSHIP][status.slot][2];
        newState.vessel.parts.aftcastle.condition = this.partConditions[VesselType.AIRSHIP][status.slot][3];
        return newState;
      }),
      takeUntil(this.onDestroy$)
    ).subscribe(({ slot, vessel }) => {
      const newAirshipList = this.airshipList$.getValue().slice();
      newAirshipList[slot] = vessel;
      this.airshipList$.next(newAirshipList);
    });

    this.freecompanyWorkshopFacade.submarineStatusList$.pipe(
      map((submarines) => submarines.map((submarine, slot) => {
        const newState = { ...submarine };
        newState.parts.hull.condition = this.partConditions[VesselType.SUBMARINE][slot][0];
        newState.parts.stern.condition = this.partConditions[VesselType.SUBMARINE][slot][1];
        newState.parts.bow.condition = this.partConditions[VesselType.SUBMARINE][slot][2];
        newState.parts.bridge.condition = this.partConditions[VesselType.SUBMARINE][slot][3];
        return newState;
      })),
      takeUntil(this.onDestroy$)
    ).subscribe((submarines) => {
      this.submarineList$.next(submarines);
    });

    this.ipc.freeCompanyId$.pipe(
      switchMap((freecompanyId) => {
        this.dataLoaded$.next(freecompanyId !== null);
        return this.xivapiService.getFreeCompany(freecompanyId)
          .pipe(
            tap(() => {
              this.isLoading$.next(true);
            }),
            map((result: any) => ({
              id: freecompanyId,
              name: result.FreeCompany.Name,
              tag: result.FreeCompany.Tag,
              rank: result.FreeCompany.Rank,
              server: result.FreeCompany.Server,
              estatePlot: result.FreeCompany.Estate.Plot
            })),
            finalize(() => this.hideLoading()));
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((data) => {
      this.freecompany$.next(data);
    });
  }

  save(): void {
    const workshop: FreecompanyWorkshop = {
      ...this.freecompany$.getValue(),
      airships: { slots: this.airshipList$.getValue() },
      submarines: { slots: this.submarineList$.getValue() }
    };
    this.modalRef.close(workshop);
  }

  private hideLoading() {
    this.isLoading$.next(false);
  }
}
