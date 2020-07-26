import { MetricsDisplayEntry } from './metrics-display-entry';
import { MetricType } from '../model/metric-type';

export class MetricsDashboardLayout {

  public static get DEFAULT(): MetricsDashboardLayout {
    return new MetricsDashboardLayout([
      [
        {
          component: 'total',
          type: MetricType.CURRENCY,
          filter: {
            name: 'ItemFilter',
            args: [1, 2, 3, 4, 5, 6]
          },
          params: {
            currencyName: 'Gil',
            fontSize: '24px'
          },
          title: 'Total Gil benefit'
        },
        {
          component: 'table',
          type: MetricType.ANY,
          filter: {
            name: 'SourceFilter',
            args: [0, 1, 2, 3]
          },
          title: 'Events recorded'
        }
      ],
      [
        {
          component: 'histogram',
          type: MetricType.CURRENCY,
          filter: {
            name: 'ObtentionFilter',
            args: []
          },
          title: 'Gains over time'
        }],
      [
        {
          component: 'pie-chart',
          type: MetricType.CURRENCY,
          filter: {
            name: 'SpendingFilter',
            args: []
          },
          title: 'Spendings',
          params: {
            metric: 'source'
          }
        },
        {
          component: 'pie-chart',
          type: MetricType.CURRENCY,
          filter: {
            name: 'ObtentionFilter',
            args: []
          },
          title: 'Earning Sources',
          params: {
            metric: 'source'
          }
        }
      ]
    ]);
  }

  constructor(public grid: MetricsDisplayEntry[][] = [[]]) {
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
