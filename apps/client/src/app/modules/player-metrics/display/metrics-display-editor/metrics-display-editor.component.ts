import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MetricsDisplayEntry } from '../metrics-display-entry';
import { MetricType } from '../../model/metric-type';
import { METRICS_DISPLAY_FILTERS, MetricsDisplayFilter } from '../../filters/metrics-display-filter';
import { BehaviorSubject, Observable } from 'rxjs';
import { I18nName } from '../../../../model/common/i18n-name';
import { debounceTime, map } from 'rxjs/operators';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { I18nToolsService } from '../../../../core/tools/i18n-tools.service';
import { ProbeSource } from '../../model/probe-source';
import { MetricDisplayComponent } from '../metric-display/metric-display.component';

@Component({
  selector: 'app-metrics-display-editor',
  templateUrl: './metrics-display-editor.component.html',
  styleUrls: ['./metrics-display-editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // ItemFilter params
  items: { id: number, name: I18nName }[];

  itemName$ = new BehaviorSubject<string>('');

  itemNameCompletion$: Observable<{ id: number, name: I18nName }[]> = this.itemName$.pipe(
    debounceTime(500),
    map(value => {
      if (value.length < 2) {
        return this.entry.filter.args.map(arg => {
          return this.items.find(i => i.id === arg);
        });
      } else {
        return this.items.filter(i => this.i18n.getName(i.name).toLowerCase().indexOf(value.toLowerCase()) > -1);
      }
    })
  );

  // SourceFilter params
  sources: { value: number, label: string }[] = Object.keys(ProbeSource).filter(k => !isNaN(+k)).map(k => ({ value: +k, label: ProbeSource[k] }));

  // Component display input
  components: string[] = Object.keys(MetricDisplayComponent.COMPONENTS_REGISTRY);

  constructor(@Inject(METRICS_DISPLAY_FILTERS) private filters: MetricsDisplayFilter<any>[],
              private lazyData: LazyDataService, private i18n: I18nToolsService) {
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.data.items)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });
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
