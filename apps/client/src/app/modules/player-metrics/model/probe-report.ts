import { MetricType } from './metric-type';
import { ProbeSource } from './probe-source';

export interface ProbeReport {
  id?: number;
  type: MetricType;
  source: ProbeSource;
  data: number[];
  timestamp?: number;
}
