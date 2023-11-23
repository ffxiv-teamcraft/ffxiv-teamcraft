import { Component, Input, ElementRef, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, NgZone } from '@angular/core';
import 'chartjs-chart-box-and-violin-plot/build/Chart.BoxPlot.js';

declare const Chart;

@Component({
    selector: 'app-chart',
    template: '',
    styles: [':host { display: block; }'],
    standalone: true
})
export class ChartComponent implements OnInit, OnChanges {
  chart: any;

  @Input() type: string;
  @Input() data: any;
  @Input() options: any;
  @Output() clickCanvas = new EventEmitter();
  @Output() clickDataset = new EventEmitter();
  @Output() clickElements = new EventEmitter();
  @Output() clickElement = new EventEmitter();

  private canvas;

  constructor(private elementRef: ElementRef, private ngZone: NgZone) { }

  ngOnInit() {
    this.create();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      if (changes['type'] || changes['options']) {
        this.create();
      } else if (changes['data']) {
        const currentValue = changes['data'].currentValue;
        ['datasets', 'labels', 'xLabels', 'yLabels'].forEach(property => {
          this.chart.data[property] = currentValue[property];
        })
        this.chart.update();
      }
    }
  }

  private create() {
    this.ngZone.runOutsideAngular(() => {
      if (this.canvas) {
        this.elementRef.nativeElement.removeChild(this.canvas);
      }
      this.canvas = document.createElement('canvas');
      this.elementRef.nativeElement.appendChild(this.canvas);
      this.chart = new Chart(this.canvas, {
        type: this.type,
        data: this.data,
        options: this.options
      });
      this.canvas.onclick = e => {
        this.ngZone.run(() => {
          this.clickCanvas.next(e);
          if (this.clickDataset.observers.length) {
            this.clickDataset.next(this.chart.getDatasetAtEvent(e));
          }
          if (this.clickElements.observers.length) {
            this.clickElements.next(this.chart.getElementsAtEvent(e));
          }
          if (this.clickElement.observers.length) {
            this.clickElement.next(this.chart.getElementAtEvent(e));
          }
        });
      };
    });
  }
}
