import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { ProbeSource } from '../../model/probe-source';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { IpcService } from '../../../../core/electron/ipc.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PlayerMetricsService } from '../../player-metrics.service';
import { SettingsService } from '../../../settings/settings.service';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { WidthBreakpointsPipe } from '../../../../pipes/pipes/width-breakpoints';
import { ItemNamePipe } from '../../../../pipes/pipes/item-name.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgIf, NgFor, AsyncPipe, DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NzTableModule, NgFor, NzButtonModule, NzWaveModule, NzPopconfirmModule, NzIconModule, AsyncPipe, DecimalPipe, DatePipe, TranslateModule, ItemNamePipe, WidthBreakpointsPipe, I18nPipe]
})
export class TableComponent extends AbstractMetricDisplayComponent implements OnInit {
  ProbeSource = ProbeSource;

  public columns$ = this.filters$.pipe(
    map(filters => {
      return [
        {
          title: 'Value',
          compare: (a, b) => a.data[1] - b.data[1],
          priority: 2
        },
        {
          title: 'Source',
          compare: (a, b) => a.source - b.source,
          priority: 3
        },
        {
          title: 'Timestamp',
          compare: (a, b) => a.timestamp - b.timestamp,
          priority: 1
        }
      ].filter(column => {
        if (column.title === 'Source') {
          const sourceFilter = filters.find(f => f.name === 'SourceFilter');
          if (sourceFilter && sourceFilter.args.length === 1) {
            return false;
          }
        }
        return true;
      });
    })
  );

  public showSourceColumn$ = this.columns$.pipe(
    map(columns => columns.some(c => c.title === 'Source'))
  );

  public labelWidth = {
    1300: `100px`,
    default: `auto`
  };

  public sortState: Record<string, string | null> = {};

  constructor(public translate: TranslateService, private ipc: IpcService,
              private message: NzMessageService, private metricsService: PlayerMetricsService,
              public settings: SettingsService) {
    super();
  }

  saveSort(column: string, sort: string | null): void {
    this.sortState[column] = sort;
    localStorage.setItem(`metrics:table:sort:${this.title}`, JSON.stringify(this.sortState));
  }

  deleteRow(id: number): void {
    this.ipc.once('metrics:delete:done', () => {
      this.message.success(this.translate.instant('METRICS.Deleted'));
      this.metricsService.reload();
    });
    this.ipc.send('metrics:delete', id);
  }

  ngOnInit(): void {
    this.sortState = JSON.parse(localStorage.getItem(`metrics:table:sort:${this.title}`) || '{}');
  }
}
