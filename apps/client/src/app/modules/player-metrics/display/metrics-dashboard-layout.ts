import { MetricsDisplayEntry } from './metrics-display-entry';
import { MetricType } from '../model/metric-type';
import { DataModel } from '../../../core/database/storage/data-model';

export class MetricsDashboardLayout extends DataModel {

  public static get DEFAULT(): MetricsDashboardLayout {
    return new MetricsDashboardLayout([
      [
        {
          component: 'total',
          type: MetricType.CURRENCY,
          filters: [{
            name: 'ItemFilter',
            args: [1, 2, 3, 4, 5, 6]
          }],
          params: {
            currencyName: 'Gil',
            fontSize: '24px'
          },
          title: 'Total Gil benefit'
        },
        {
          component: 'table',
          type: MetricType.ANY,
          filters: [{
            name: 'SourceFilter',
            args: [0, 1, 2, 3]
          }],
          title: 'Events recorded'
        }
      ],
      [
        {
          component: 'histogram',
          type: MetricType.CURRENCY,
          filters: [{
            name: 'ObtentionFilter',
            args: []
          }],
          title: 'Gains over time'
        }],
      [
        {
          component: 'table',
          type: MetricType.CURRENCY,
          filters: [
            {
              name: 'SpendingFilter',
              args: []
            }
          ],
          title: 'Spendings'
        },
        {
          component: 'pie-chart',
          type: MetricType.CURRENCY,
          filters: [{
            name: 'ObtentionFilter',
            args: []
          }],
          title: 'Earning Sources',
          params: {
            metric: 'source'
          }
        }
      ]
    ]);
  }

  constructor(public grid: MetricsDisplayEntry[][] = [[]]) {
    super();
  }

  public addColumn(index?: number): void {
    if (!index) {
      this.grid = [...this.grid, []];
    } else {
      this.grid = [...this.grid.splice(index, 0, [])];
    }
  }

  public removeColumn(index: number): void {
    this.grid.splice(index, 1);
  }
}
