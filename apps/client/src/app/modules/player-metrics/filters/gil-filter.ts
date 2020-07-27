import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';

export class GilFilter implements MetricsDisplayFilter<number[]> {
  matches(input: ProbeReport): boolean {
    return input.data[0] === 1;
  }

  getName(): string {
    return 'GilFilter';
  }
}
