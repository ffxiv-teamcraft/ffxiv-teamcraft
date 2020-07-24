import { MetricsDisplayEntry } from './metrics-display-entry';
import { MetricType } from '../model/metric-type';

export class MetricsDashboardLayout {
  public static readonly DEFAULT = new MetricsDashboardLayout([
    [
      {
        component: 'total',
        type: MetricType.CURRENCY,
        filter: {
          name: 'NoFilter'
        },
        params: {
          currencyName: 'Gil',
          fontSize: '24px'
        },
        title: 'Total Gil benefit'
      },
      {
        component: 'table',
        filter: {
          name: 'NoFilter'
        },
        title: 'Events recorded'
      }
    ],
    [
      {
        component: 'histogram',
        type: MetricType.CURRENCY,
        filter: {
          name: 'ObtentionFilter'
        },
        title: 'Gains over time'
      }],
    [
      {
        component: 'pie-chart',
        type: MetricType.CURRENCY,
        filter: {
          name: 'SpendingFilter'
        },
        title: 'Spendings'
      },
      {
        component: 'pie-chart',
        type: MetricType.CURRENCY,
        filter: {
          name: 'ObtentionFilter'
        },
        title: 'Earning Sources'
      }
    ]
  ]);

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
    this.grid = [...this.grid.splice(index, 1)];
  }
}
