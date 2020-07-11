import { MetricsDisplayFilter } from './metrics-display-filter';
import { MetricType } from '../model/metric-type';
import { ProbeReport } from '../model/probe-report';

export class TypeFilter implements MetricsDisplayFilter<MetricType[]> {
  matches(input: ProbeReport, ...args: MetricType[]): boolean {
    return args.indexOf(input.type) > -1;
  }

  getName(): string {
    return 'TypeFilter';
  }
}
