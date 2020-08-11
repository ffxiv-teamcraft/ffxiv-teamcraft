import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';

export class FishFilter implements MetricsDisplayFilter<number[]> {
  constructor(private lazyData) {
  }

  matches(input: ProbeReport): boolean {
    return this.lazyData.data.fishes.indexOf(input.data[0]) > -1;
  }

  getName(): string {
    return 'FishFilter';
  }
}
