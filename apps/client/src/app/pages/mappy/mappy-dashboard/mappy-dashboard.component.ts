import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { I18nPipe } from '../../../core/i18n.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { MappyService } from '../../../core/database/mappy.service';
import { uniq } from 'lodash';
import { LazyMap } from '@ffxiv-teamcraft/data/model/lazy-map';
import { SettingsService } from '../../../modules/settings/settings.service';
import { NzPageHeaderComponent, NzPageHeaderExtraDirective, NzPageHeaderTitleDirective } from 'ng-zorro-antd/page-header';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { MapMarker } from '../../../modules/map/map-marker';
import { MapComponent } from '../../../modules/map/map/map.component';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-mappy-dashboard',
  templateUrl: './mappy-dashboard.component.html',
  styleUrls: ['./mappy-dashboard.component.less'],
  standalone: true,
  imports: [NzDividerModule, FlexModule, NzButtonModule, NzWaveModule, NzIconModule, NzSwitchModule, FormsModule, NgIf, NgFor, NzCardModule, NzTagModule, RouterLink, AsyncPipe, DatePipe, MapNamePipe, I18nPipe, TranslateModule, NzPageHeaderTitleDirective, NzPageHeaderComponent, NzPageHeaderExtraDirective, NzCheckboxComponent, MapComponent, NzRadioGroupComponent, NzRadioComponent, NzEmptyComponent]
})
export class MappyDashboardComponent {

  public displayMode$ = new BehaviorSubject<'empty' | 'scanned' | 'all'>('all');

  acceptedMaps$ = this.lazyData.getEntry('nodes').pipe(
    map(nodes => {
      return uniq<number>(Object.values<any>(nodes).map(n => n.map)).filter(Boolean);
    }),
    switchMap(maps => {
      return combineLatest(maps.map(mapId => this.lazyData.getRow('maps', mapId)));
    })
  );

  public display$ = combineLatest([
    this.acceptedMaps$,
    this.mappy.query(),
    this.displayMode$
  ]).pipe(
    takeUntilDestroyed(),
    map(([maps, reports, displayMode]) => {
      return maps.map((row: LazyMap) => {
        const mapReports = reports.filter(r => r.MapID === row.id);
        return {
          ...row,
          reports: mapReports,
          markers: mapReports.map(report => {
            return {
              x: report.PosX,
              y: report.PosY,
              iconType: 'img',
              iconImg: './assets/icons/mappy/enemy.png'
            } as MapMarker;
          })
        };
      }).filter(row => {
        switch (displayMode) {
          case 'empty':
            return row.reports.length === 0;
          case 'scanned':
            return row.reports.length > 0;
          case 'all':
            return true;
          default:
            return true;
        }
      }).sort((a, b) => a.id - b.id);
    })
  );

  constructor(private lazyData: LazyDataFacade, public translate: TranslateService,
              private mappy: MappyService, public settings: SettingsService) {
  }

}
