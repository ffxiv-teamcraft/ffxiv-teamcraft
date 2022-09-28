import { MetricsDisplayFilter } from './metrics-display-filter';
import { ProbeReport } from '../model/probe-report';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { tap } from 'rxjs/operators';
import { LazyData } from '../../../lazy-data/lazy-data';
import { Observable } from 'rxjs';

export class FishFilter extends MetricsDisplayFilter<number[]> {
  private fishes: LazyData['fishes'];

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  loadData(): Observable<any> {
    return this.lazyData.getEntry('fishes').pipe(
      tap(fishes => this.fishes = fishes)
    );
  }

  matches(input: ProbeReport): boolean {
    return this.fishes.indexOf(input.data[0]) > -1;
  }

  getName(): string {
    return 'FishFilter';
  }
}
