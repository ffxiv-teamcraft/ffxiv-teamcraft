import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { filter, first, map, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FreeCompanyWorkshopFacade } from '../+state/free-company-workshop.facade';
import { FreeCompanyWorkshop } from '../model/free-company-workshop';
import { VesselType } from '../model/vessel-type';
import { AuthFacade } from '../../../+state/auth.facade';
import { worlds } from '../../../core/data/sources/worlds';

@Component({
  selector: 'app-import-workshop-from-pcap-popup',
  templateUrl: './import-workshop-from-pcap-popup.component.html',
  styleUrls: ['./import-workshop-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportWorkshopFromPcapPopupComponent extends TeamcraftComponent implements OnInit {
  private _freeCompany = new BehaviorSubject(null);

  private _airshipList = new BehaviorSubject(Array(4));

  private _submarineList = new BehaviorSubject(Array(4));

  private _airshipSectorProgression = new BehaviorSubject(null);

  private _submarineSectorProgression = new BehaviorSubject(null);

  private fcId$ = this.ipc.freeCompanyId$.pipe(
    shareReplay(1),
    takeUntil(this.onDestroy$)
  );

  private freeCompanyDetails$ = this.ipc.freeCompanyDetails$.pipe(
    shareReplay(1),
    takeUntil(this.onDestroy$)
  );

  public fcIdStatus$ = this.fcId$.pipe(
    map(() => 'finish'),
    startWith('process')
  );

  public freeCompanyDetailsStatus$ = this.freeCompanyDetails$.pipe(
    map(() => 'finish'),
    startWith('process')
  );

  public interactStatus$ = combineLatest([
    this.freeCompanyDetailsStatus$,
    this.fcIdStatus$
  ]).pipe(
    map((statuses) => {
      if (statuses.every(s => s === 'finish')) {
        return 'process';
      }
      return 'wait';
    })
  );


  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade,
              private authFacade: AuthFacade) {
    super();
  }

  public get freeCompany$() {
    return this._freeCompany.asObservable();
  }

  public get airshipList$() {
    return this._airshipList.asObservable();
  }

  public get submarineList$() {
    return this._submarineList.asObservable();
  }

  ngOnInit(): void {
    this.freeCompanyWorkshopFacade.airshipStatus$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(({ slot, vessel }) => {
      const newAirshipList = this._airshipList.getValue().slice();
      newAirshipList[slot] = vessel;
      this._airshipList.next(newAirshipList);
    });

    this.freeCompanyWorkshopFacade.submarineStatusList$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((submarines) => {
      this._submarineList.next(submarines);
    });

    this.freeCompanyWorkshopFacade.vesselProgressionStatus$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(({ type, sectorsProgression }) => {
      switch (type) {
        case VesselType.AIRSHIP:
          this._airshipSectorProgression.next(sectorsProgression);
          break;
        case VesselType.SUBMARINE:
          this._submarineSectorProgression.next(sectorsProgression);
          break;
      }
    });

    const server$ = this.authFacade.user$.pipe(
      map((user) => {
        return Object.keys(worlds).find((key) => worlds[key] === user.world);
      }),
      shareReplay(1),
      takeUntil(this.onDestroy$)
    );

    this.freeCompanyDetails$.pipe(
      switchMap((packet) => {
        return combineLatest([of(packet), server$, this.fcId$]).pipe(
          first()
        );
      }),
      filter(([packet, , fcId]) => packet.freeCompanyId.toString() === fcId),
      map(([packet, server]) => {
        return {
          id: packet.freeCompanyId.toString(),
          name: packet.fcName,
          tag: packet.fcTag,
          rank: packet.fcRank,
          server
        };
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((data) => {
      this._freeCompany.next(data);
    });
  }

  save(): void {
    const workshop: FreeCompanyWorkshop = {
      ...this._freeCompany.getValue(),
      airships: {
        sectors: this._airshipSectorProgression.getValue(),
        slots: this._airshipList.getValue()
      },
      submarines: {
        sectors: this._submarineSectorProgression.getValue(),
        slots: this._submarineList.getValue()
      }
    };
    this.modalRef.close(workshop);
  }
}
