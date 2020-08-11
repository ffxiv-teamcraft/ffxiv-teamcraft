import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';

export class NoFilter implements MetricsDisplayFilter<any[]> {
  matches(input: ProbeReport): boolean {
    return true;
  }

  getName(): string {
    return 'NoFilter';
  }
}
