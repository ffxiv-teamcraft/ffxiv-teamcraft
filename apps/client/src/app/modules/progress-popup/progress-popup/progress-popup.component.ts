import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, scan, skip, startWith } from 'rxjs/operators';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-progress-popup',
  templateUrl: './progress-popup.component.html',
  styleUrls: ['./progress-popup.component.less']
})
export class ProgressPopupComponent implements OnInit {

  @Input()
  public operation$: Observable<any>;

  @Input()
  public count: number;

  public progress$: Observable<any>;

  constructor(private modalRef: NzModalRef) {
  }

  ngOnInit() {
    this.progress$ = this.operation$.pipe(
      startWith(0),
      scan((counter) => ++counter),
      map(counter => Math.ceil(100 * counter / this.count))
    );
    this.operation$.pipe(
      skip(this.count - 1)
    ).subscribe((res) => {
      this.modalRef.close(res);
    });
  }
}
