import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeSource } from '../model/probe-source';
import { ProbeReport } from '../model/probe-report';

export class SourceFilter extends MetricsDisplayFilter<ProbeSource[]> {
  matches(input: ProbeReport, ...args: ProbeSource[]): boolean {
    return args.indexOf(input.source) > -1;
  }

  getName(): string {
    return 'SourceFilter';
  }
}
