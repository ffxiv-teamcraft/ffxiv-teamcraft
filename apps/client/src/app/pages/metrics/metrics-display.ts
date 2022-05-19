import { MetricsDashboardLayout } from '../../modules/player-metrics/display/metrics-dashboard-layout';
import { ProbeReport } from '../../modules/player-metrics/model/probe-report';
import { MetricsDisplayEntry } from '../../modules/player-metrics/display/metrics-display-entry';

export interface MetricsDisplay {
  layout: MetricsDashboardLayout;
  grid: {
    title: string;
    component: string;
    data: ProbeReport[];
    filters: MetricsDisplayEntry['filters'];
    params: any;
  }[][];
  empty: boolean;
}
