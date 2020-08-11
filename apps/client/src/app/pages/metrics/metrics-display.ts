import { MetricsDashboardLayout } from '../../modules/player-metrics/display/metrics-dashboard-layout';
import { ProbeReport } from '../../modules/player-metrics/model/probe-report';

export interface MetricsDisplay {
  layout: MetricsDashboardLayout;
  grid: {
    title: string;
    component: string;
    data: ProbeReport[];
    params: any;
  }[][];
  empty: boolean;
}
