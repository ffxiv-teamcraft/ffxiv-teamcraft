import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { BehaviorSubject } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { XivapiService } from '@xivapi/angular-client';
import { FreecompanyWorkshopFacade } from '../+state/freecompany-workshop.facade';
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

  constructor(private modalRef: NzModalRef, private ipc: IpcService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade,
              private xivapiService: XivapiService) {
    super();
  }

  ngOnInit(): void {
    this.freecompanyWorkshopFacade.airshipStatus$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(({ slot, vessel }) => {
      const newAirshipList = this.airshipList$.getValue().slice();
      newAirshipList[slot] = vessel;
      this.airshipList$.next(newAirshipList);
    });

    this.freecompanyWorkshopFacade.submarineStatusList$.pipe(
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
