import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';

export class ItemFilter implements MetricsDisplayFilter<number[]> {
  matches(input: ProbeReport, ...args: number[]): boolean {
    return args.indexOf(input.data[0]) > -1;
  }

  getName(): string {
    return 'ItemFilter';
  }
}
