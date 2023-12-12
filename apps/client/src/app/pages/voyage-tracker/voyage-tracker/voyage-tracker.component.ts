import { ChangeDetectionStrategy, Component } from '@angular/core';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IpcService } from '../../../core/electron/ipc.service';
import { FreeCompanyWorkshopFacade } from '../../../modules/free-company-workshops/+state/free-company-workshop.facade';
import { BehaviorSubject } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TeamcraftComponent } from '../../../core/component/teamcraft-component';
import { SectorExploration } from '../../../modules/free-company-workshops/model/sector-exploration';
import { SettingsService } from '../../../modules/settings/settings.service';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { VesselListComponent } from './vessel-list/vessel-list.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgIf, NgFor, AsyncPipe, KeyValuePipe } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-voyage-tracker',
    templateUrl: './voyage-tracker.component.html',
    styleUrls: ['./voyage-tracker.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgIf, NzButtonModule, NzWaveModule, NzSwitchModule, FormsModule, PageLoaderComponent, NgFor, NzCollapseModule, NzGridModule, NzToolTipModule, NzPopconfirmModule, NzIconModule, VesselListComponent, FullpageMessageComponent, AsyncPipe, KeyValuePipe, TranslateModule]
})
export class VoyageTrackerComponent extends TeamcraftComponent {
  isLoading$ = new BehaviorSubject(false);

  airshipMaxRank$ = this.freeCompanyWorkshopFacade.getAirshipMaxRank();

  submarineMaxRank$ = this.freeCompanyWorkshopFacade.getSubmarineMaxRank();

  airshipSectorsTotal$ = this.freeCompanyWorkshopFacade.getAirshipSectorTotalCount();

  submarineSectorsTotal$ = this.freeCompanyWorkshopFacade.getSubmarineSectorTotalCount();

  activeState = JSON.parse(localStorage.getItem('voyage-tracker:panels') || '{}');

  public display$ = this.freeCompanyWorkshopFacade.workshops$.pipe(
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

  constructor(private dialog: NzModalService, public ipc: IpcService, public translate: TranslateService,
              private freeCompanyWorkshopFacade: FreeCompanyWorkshopFacade, public settings: SettingsService) {
    super();
  }

  getAirshipSectorsProgression(sectors: Record<string, SectorExploration>): number {
    // Exclude Diadem sector
    if (sectors && sectors[22]) {
      delete sectors[22];
    }
    return this.getSectorsProgression(sectors);
  }

  getSubmarineSectorsProgression(sectors: Record<string, SectorExploration>): number {
    return this.getSectorsProgression(sectors);
  }

  importFromPcap(): void {
    this.freeCompanyWorkshopFacade.importFromPcap();
  }

  setActiveState(key: string, active: boolean): void {
    this.activeState[key] = active;
    localStorage.setItem('voyage-tracker:panels', JSON.stringify(this.activeState));
  }

  deleteWorkshop(id): void {
    this.freeCompanyWorkshopFacade.deleteWorkshop(id);
  }

  trackByServerKey(index, value) {
    return value.key;
  }

  trackById(index, value) {
    return value.id;
  }

  private getSectorsProgression(sectors: Record<string, SectorExploration>): number {
    if (!sectors) {
      return 0;
    }
    return Object.keys(sectors).filter(id => sectors[id].unlocked).length;
  }
}
