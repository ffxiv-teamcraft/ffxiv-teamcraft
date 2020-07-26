import { MetricType } from '../model/metric-type';

export interface MetricsDisplayEntry {
  title: string;
  component: string;
  type: MetricType;
  filters: {
    // Only for entries after the first one
    gate?: 'OR' | 'AND';
    not?: boolean;
    name: string;
    args: any[];
  }[];
  params?: any;
}
