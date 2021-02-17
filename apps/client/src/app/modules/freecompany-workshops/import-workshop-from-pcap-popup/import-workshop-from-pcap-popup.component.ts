import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { FreecompanyWorkshopFacade } from '../+state/freecompany-workshop.facade';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import { VesselType } from '../model/vessel-type';

@Component({
  selector: 'app-import-workshop-from-pcap-popup',
  templateUrl: './import-workshop-from-pcap-popup.component.html',
  styleUrls: ['./import-workshop-from-pcap-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportWorkshopFromPcapPopupComponent extends TeamcraftComponent implements OnInit {
  public dataLoaded$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = new BehaviorSubject<boolean>(false);

  private _freeCompany = new BehaviorSubject(null);
  private _airshipList = new BehaviorSubject(Array(4));
  private _submarineList = new BehaviorSubject(Array(4));
  private _airshipSectorProgression = new BehaviorSubject(null);
  private _submarineSectorProgression = new BehaviorSubject(null);

  public get freeCompany$() {
    return this._freeCompany.asObservable();
  }

  public get airshipList$() {
    return this._airshipList.asObservable();
  }

  public get submarineList$() {
    return this._submarineList.asObservable();
  }

  public get airshipSectorProgression() {
    return this._airshipSectorProgression.asObservable();
  }

  public get submarineSectorProgression() {
    return this._submarineSectorProgression.asObservable();
  }

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade,
              private xivapiService: XivapiService) {
    super();
  }

  ngOnInit(): void {
    this.freecompanyWorkshopFacade.airshipStatus$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(({ slot, vessel }) => {
      const newAirshipList = this._airshipList.getValue().slice();
      newAirshipList[slot] = vessel;
      this._airshipList.next(newAirshipList);
    });

    this.freecompanyWorkshopFacade.submarineStatusList$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((submarines) => {
      this._submarineList.next(submarines);
    });

    this.freecompanyWorkshopFacade.vesselProgressionStatus$.pipe(
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
              server: result.FreeCompany.Server
            })),
            finalize(() => this.hideLoading()));
      }),
      takeUntil(this.onDestroy$)
    ).subscribe((data) => {
      this._freeCompany.next(data);
    });
  }

  save(): void {
    const workshop: FreecompanyWorkshop = {
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

  private hideLoading() {
    this.isLoading$.next(false);
  }
}
