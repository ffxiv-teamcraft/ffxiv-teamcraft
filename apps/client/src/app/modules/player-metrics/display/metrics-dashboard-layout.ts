import { MetricsDisplayEntry } from './metrics-display-entry';
import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';

export class MetricsDashboardLayout extends DataWithPermissions {

  constructor(public name: string, public grid: MetricsDisplayEntry[][] = [[]], public isDefault = false) {
    super();
    if (isDefault) {
      this.$key = 'DEFAULT';
    }
  }

  public static get DEFAULT(): MetricsDashboardLayout {
    return new MetricsDashboardLayout('METRICS.Default_dashboard', [[{
        component: 'total',
        type: 0,
        filters: [{ name: 'GilFilter', args: [] }],
        params: { currencyName: 'Gil', fontSize: '24px' },
        title: 'Total Gil benefit'
      }, {
        component: 'pie-chart',
        type: 0,
        filters: [{ name: 'SpendingFilter', args: [] }, { gate: 'AND', name: 'GilFilter', args: [] }],
        title: 'Gil Spendings',
        params: { metric: 'source' }
      }, { component: 'table', type: -1, filters: [{ name: 'NoFilter', args: [] }], title: 'Full entries record' }], [{
        component: 'pie-chart',
        type: 1,
        filters: [{ name: 'ObtentionFilter', args: [] }, { gate: 'AND', name: 'SourceFilter', args: [1, 3] }, {
          gate: 'AND',
          not: true,
          name: 'GilFilter',
          args: []
        }],
        title: 'Items gathered',
        params: { metric: 'amount' }
      }, {
        component: 'pie-chart',
        type: 1,
        filters: [{ name: 'ObtentionFilter', args: [] }, { gate: 'AND', name: 'SourceFilter', args: [2] }, {
          gate: 'AND',
          not: true,
          name: 'GilFilter',
          args: []
        }],
        title: 'Items crafted',
        params: { metric: 'amount' }
      }]]
      , true);
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

  public clone(): MetricsDashboardLayout {
    const clone = new MetricsDashboardLayout(this.name, JSON.parse(JSON.stringify(this.grid)), this.isDefault);
    clone.$key = this.$key;
    clone.registry = this.registry;
    clone.authorId = this.authorId;
    clone.everyone = this.everyone;
    clone.index = this.index;
    clone.appVersion = this.appVersion;
    return clone;
  }

  public exportCode = () => {
    return JSON.stringify({ name: this.name, grid: this.grid });
  };
}
