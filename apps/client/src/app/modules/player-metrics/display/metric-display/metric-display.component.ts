import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AbstractMetricDisplayComponent } from '../abstract-metric-display-component';
import { TotalComponent } from '../total/total.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HistogramComponent } from '../histogram/histogram.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-metric-display',
  templateUrl: './metric-display.component.html',
  styleUrls: ['./metric-display.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricDisplayComponent extends AbstractMetricDisplayComponent implements AfterViewInit, OnDestroy {

  public static readonly COMPONENTS_REGISTRY = {
    'total': TotalComponent,
    'histogram': HistogramComponent,
    'pie-chart': PieChartComponent,
    'table': TableComponent
  };

  @Input()
  component: string;

  private onDestroy$ = new Subject<void>();

  @ViewChild('ref', { read: ViewContainerRef })
  private ref: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const entry = MetricDisplayComponent.COMPONENTS_REGISTRY[this.component];
      if (entry === undefined) {
        throw new Error(`Tried to instantiate non-existant metric display component ${this.component}`);
      }
      const factory = this.resolver.resolveComponentFactory<AbstractMetricDisplayComponent>(entry);
      const componentRef = this.ref.createComponent<AbstractMetricDisplayComponent>(factory);
      this.data$.pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(data => {
        componentRef.instance.data = data;
      });
      this.filters$.pipe(
        takeUntil(this.onDestroy$)
      ).subscribe(filters => {
        componentRef.instance.filters = filters;
      });
      componentRef.instance.title = this.title;
      componentRef.instance.params = this.params;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
