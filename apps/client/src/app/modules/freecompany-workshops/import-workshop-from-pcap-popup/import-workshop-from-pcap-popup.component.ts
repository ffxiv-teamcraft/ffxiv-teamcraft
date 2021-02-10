import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { filter, finalize, map, shareReplay, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
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
    const freecompanyId$ = this.ipc.freecompanyId$.pipe(
      shareReplay(1)
    );

    const airshipStatusList$ = this.ipc.airshipStatusListPackets$.pipe(
      withLatestFrom(freecompanyId$),
      filter(([, fcId]) => fcId !== null),
      map(([airshipStatusList, fcId]) => airshipStatusList.statusList.map((airship) => ({
        rank: airship.rank,
        status: airship.status,
        name: airship.name,
        birthdate: airship.birthdate,
        returnTime: airship.returnTime,
        freecompanyId: fcId
      }))),
      shareReplay(1)
    );

    const currentAirshipStatusFromList$ = this.ipc.eventPlay8Packets$.pipe(
      filter((event) => event.eventId === 0xB0102),
      map((event) => event.param1),
      withLatestFrom(airshipStatusList$),
      map(([slot, statusList]) => ({ slot: slot, partialStatus: statusList[slot] }))
    );

    this.freecompanyWorkshopFacade.vesselPartUpdate$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((itemInfo) => {
      const pc = this.freecompanyWorkshopFacade.getVesselPartCondition(itemInfo);
      this.partConditions[pc.type][pc.vesselSlot][pc.partSlot] = pc.condition;
    });

    this.ipc.airshipStatusPackets$.pipe(
      withLatestFrom(currentAirshipStatusFromList$),
      map(([airship, statusFromList]) => ({
        slot: statusFromList.slot,
        vessel: {
          ...statusFromList.partialStatus,
          capacity: airship.capacity,
          currentExperience: airship.currentExp,
          totalExperienceForNextRank: airship.totalExpForNextRank,
          destinations: [
            airship.dest1,
            airship.dest2,
            airship.dest3,
            airship.dest4,
            airship.dest5
          ].filter((dest) => dest > -1),
          parts: {
            hull: {
              partId: airship.hull,
              condition: this.partConditions[VesselType.AIRSHIP][statusFromList.slot][0]
            },
            rigging: {
              partId: airship.rigging,
              condition: this.partConditions[VesselType.AIRSHIP][statusFromList.slot][1]
            },
            forecastle: {
              partId: airship.forecastle,
              condition: this.partConditions[VesselType.AIRSHIP][statusFromList.slot][2]
            },
            aftcastle: {
              partId: airship.aftcastle,
              condition: this.partConditions[VesselType.AIRSHIP][statusFromList.slot][3]
            }
          }
        }
      })),
      takeUntil(this.onDestroy$)
    ).subscribe(({ slot, vessel }) => {
      const newAirshipList = this.airshipList$.getValue().slice();
      newAirshipList[slot] = vessel;
      this.airshipList$.next(newAirshipList);
    });

    this.ipc.submarinesStatusListPackets$.pipe(
      withLatestFrom(this.ipc.freecompanyId$),
      filter(([, fcId]) => fcId !== null),
      map(([submarineStatusList, fcId]) => submarineStatusList.statusList.map((submarine, slot) => {
        return {
          rank: submarine.rank,
          status: submarine.status,
          name: submarine.name,
          birthdate: submarine.birthdate,
          returnTime: submarine.returnTime,
          parts: {
            hull: {
              partId: submarine.hull,
              condition: this.partConditions[VesselType.SUBMARINE][slot][0]
            },
            stern: {
              partId: submarine.stern,
              condition: this.partConditions[VesselType.SUBMARINE][slot][1]
            },
            bow: {
              partId: submarine.bow,
              condition: this.partConditions[VesselType.SUBMARINE][slot][2]
            },
            bridge: {
              partId: submarine.bridge,
              condition: this.partConditions[VesselType.SUBMARINE][slot][3]
            }
          },
          capacity: submarine.capacity,
          currentExperience: submarine.currentExp,
          totalExperienceForNextRank: submarine.totalExpForNextRank,
          freecompanyId: fcId,
          destinations: [
            submarine.dest1,
            submarine.dest2,
            submarine.dest3,
            submarine.dest4,
            submarine.dest5
          ].filter((dest) => dest > 0)
        };
      })),
      takeUntil(this.onDestroy$)
    ).subscribe((submarines) => {
      this.submarineList$.next(submarines);
    });

    this.ipc.freecompanyId$.pipe(
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
