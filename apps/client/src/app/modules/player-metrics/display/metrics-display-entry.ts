import { MetricType } from '../model/metric-type';

export interface MetricsDisplayEntry {
  title: string;
  component: string;
  type: MetricType;
  filter: {
    name: string;
    args: any[];
  }
  params: any;
  width?: string;
}
