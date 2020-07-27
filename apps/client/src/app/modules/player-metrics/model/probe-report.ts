import { MetricType } from './metric-type';
import { ProbeSource } from './probe-source';

export interface ProbeReport {
  type: MetricType;
  source: ProbeSource;
  data: number[];
  timestamp?: number;
}
