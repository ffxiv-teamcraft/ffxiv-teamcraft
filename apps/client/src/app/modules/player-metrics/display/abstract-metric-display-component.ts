import { Component, Input } from '@angular/core';
import { ProbeReport } from '../model/probe-report';
import { BehaviorSubject } from 'rxjs';
import { MetricsDisplayEntry } from './metrics-display-entry';

@Component({
  template: ''
})
export abstract class AbstractMetricDisplayComponent {
  data$: BehaviorSubject<ProbeReport[]> = new BehaviorSubject<ProbeReport[]>([]);

  filters$: BehaviorSubject<MetricsDisplayEntry['filters']> = new BehaviorSubject<MetricsDisplayEntry['filters']>([]);

  @Input()
  title: string;

  @Input()
  set filters(filters: MetricsDisplayEntry['filters']) {
    this.filters$.next(filters || []);
  }

  @Input()
  params: any;

  @Input()
  set data(data: ProbeReport[]) {
    this.data$.next(data);
  }
}
