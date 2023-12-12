import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MetricsDisplayEntry } from '../metrics-display-entry';
import { MetricType } from '../../model/metric-type';
import { METRICS_DISPLAY_FILTERS, MetricsDisplayFilter } from '../../filters/metrics-display-filter';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { I18nName } from '@ffxiv-teamcraft/types';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { ProbeSource } from '../../model/probe-source';
import { MetricDisplayComponent } from '../metric-display/metric-display.component';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { I18nPipe } from '../../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { TutorialStepDirective } from '../../../../core/tutorial/tutorial-step.directive';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-metrics-display-editor',
    templateUrl: './metrics-display-editor.component.html',
    styleUrls: ['./metrics-display-editor.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzCardModule, TutorialStepDirective, FlexModule, NzButtonModule, NzWaveModule, NzPopconfirmModule, NzIconModule, NzDividerModule, NzGridModule, NzFormModule, NzSelectModule, FormsModule, NgFor, NgIf, NzCheckboxModule, NgSwitch, NgSwitchCase, NgSwitchDefault, NzInputModule, AsyncPipe, TranslateModule, I18nPipe]
})
export class MetricsDisplayEditorComponent {

  @Input()
  entry: MetricsDisplayEntry;

  @Output()
  entryChange: EventEmitter<MetricsDisplayEntry> = new EventEmitter<MetricsDisplayEntry>();

  @Output()
  removeEntry: EventEmitter<void> = new EventEmitter<void>();

  metricTypes = Object.keys(MetricType).filter(k => !isNaN(+k)).map(k => ({ value: +k, label: MetricType[k] }));

  filterNames = this.filters.map(filter => filter.getName());

  itemName$ = new BehaviorSubject<string>('');

  completionCache = {
    name: '',
    completion: of([])
  };

  // SourceFilter params
  sources: { value: number, label: string }[] = Object.keys(ProbeSource).filter(k => !isNaN(+k)).map(k => ({ value: +k, label: ProbeSource[k] }));

  // Component display input
  components: string[] = Object.keys(MetricDisplayComponent.COMPONENTS_REGISTRY);

  constructor(@Inject(METRICS_DISPLAY_FILTERS) private filters: MetricsDisplayFilter<any>[],
              private lazyData: LazyDataFacade, private i18n: I18nToolsService) {
  }

  getItemNameCompletion(name: string, itemIds: number[]): Observable<{ id: number, name: I18nName }[]> {
    if (this.completionCache.name !== name) {
      this.completionCache.name = name;
      this.completionCache.completion = this.itemName$.pipe(
        debounceTime(500),
        switchMap(value => {
          return this.lazyData.getSearchIndex('items').pipe(
            map(items => {
              if (value.length < 2) {
                return itemIds.map(id => {
                  return items.find(i => i.id === id);
                });
              } else {
                return items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
              }
            })
          );
        })
      );
    }
    return this.completionCache.completion;
  }

  addFilter(): void {
    this.entry.filters.push({
      gate: 'AND',
      name: 'NoFilter',
      args: []
    });
    this.entryChange.emit(this.entry);
  }

  removeFilter(index: number): void {
    this.entry.filters.splice(index, 1);
    this.entryChange.emit(this.entry);
  }

  componentChange(entry: MetricsDisplayEntry): void {
    switch (entry.component) {
      case 'total':
        entry.params = {
          fontSize: '24px',
          currencyName: 'Gil'
        };
        break;
      case 'pie-chart':
        entry.params = {
          metric: 'source'
        };
        break;
      default:
        delete entry.params;
        break;
    }
    this.entryChange.next(entry);
  }
}
