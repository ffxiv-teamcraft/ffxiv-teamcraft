import { Component, Input } from '@angular/core';
import { ProbeReport } from '../model/probe-report';
import { BehaviorSubject } from 'rxjs';

@Component({
  template: ''
})
export abstract class AbstractMetricDisplayComponent {
  data$: BehaviorSubject<ProbeReport[]> = new BehaviorSubject<ProbeReport[]>([]);

  @Input()
  set data(data: ProbeReport[]) {
    this.data$.next(data);
  }

  @Input()
  title: string;

  @Input()
  params: any;
}
