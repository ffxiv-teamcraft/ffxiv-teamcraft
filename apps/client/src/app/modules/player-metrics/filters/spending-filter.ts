import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';

export class SpendingFilter extends MetricsDisplayFilter<any[]> {
  matches(input: ProbeReport): boolean {
    return input.data[1] < 0;
  }

  getName(): string {
    return 'SpendingFilter';
  }
}
