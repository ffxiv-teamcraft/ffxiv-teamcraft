import { MetricType } from './metric-type';

export interface ProbeReport {
  type: MetricType;
  data: number[];
  timestamp?: number;
}
