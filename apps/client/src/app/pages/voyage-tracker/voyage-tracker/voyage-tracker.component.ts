import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreecompanyWorkshopFacade } from '../../../modules/freecompany-workshops/+state/freecompany-workshop.facade';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { SectorExploration } from '../../../modules/freecompany-workshops/model/sector-exploration';

@Component({
  selector: 'app-voyage-tracker',
  templateUrl: './voyage-tracker.component.html',
  styleUrls: ['./voyage-tracker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VoyageTrackerComponent extends TeamcraftComponent implements OnInit {
  isLoading$ = new BehaviorSubject(true);

  private _airshipMaxRank = new BehaviorSubject(null);

  public get airshipMaxRank$() {
    return this._airshipMaxRank.asObservable();
  }

  private _submarineMaxRank = new BehaviorSubject(null);

  public get submarineMaxRank$() {
    return this._submarineMaxRank.asObservable();
  }

  private _airshipSectorsTotal = new BehaviorSubject(null);

  public get airshipSectorsTotal$() {
    return this._airshipSectorsTotal.asObservable();
  }

  private _submarineSectorsTotal = new BehaviorSubject(null);

  public get submarineSectorsTotal$() {
    return this._submarineSectorsTotal.asObservable();
  }

  public display$ = this.freecompanyWorkshopFacade.workshops$.pipe(
    map((results) => {
      this.isLoading$.next(true);
      const worlds = {};
      results.forEach((fc) => {
        if (worlds[fc.server] === undefined) {
          worlds[fc.server] = [];
        }
        worlds[fc.server].push(fc);
      });
      return worlds;
    }),
    tap(() => {
      this.isLoading$.next(false);
    }),
    finalize(() => {
      this.isLoading$.next(false);
    }),
    takeUntil(this.onDestroy$)
  );

  constructor(private dialog: NzModalService, public ipc: IpcService,
              private lazyData: LazyDataService, public translate: TranslateService,
              private freecompanyWorkshopFacade: FreecompanyWorkshopFacade, private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this._submarineMaxRank.next(Object.keys(this.lazyData.data.submarineRanks).pop());
    this._airshipMaxRank.next(Object.keys(this.lazyData.data.airshipRanks).pop());
    this._airshipSectorsTotal.next(Object.keys(this.lazyData.data.airshipVoyages).filter((id) => this.lazyData.data.airshipVoyages[id].en).length);
    this._submarineSectorsTotal.next(Object.keys(this.lazyData.data.submarineVoyages).filter((id) => this.lazyData.data.submarineVoyages[id].en).length);
  }

  getSectorsProgression(sectors: Record<string, SectorExploration>): number {
    return Object.keys(sectors).filter(id => sectors[id].unlocked).length;
  }

  importFromPcap(): void {
    this.freecompanyWorkshopFacade.importFromPcap();
  }

  deleteWorkshop(id): void {
    this.freecompanyWorkshopFacade.deleteWorkshop(id);
  }

  trackByServerKey(index, value) {
    return value.key;
  }

  trackById(index, value) {
    return value.id;
  }
}
