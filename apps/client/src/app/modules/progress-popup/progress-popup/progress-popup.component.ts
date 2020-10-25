import { Component, Input, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, scan, skip, startWith } from 'rxjs/operators';
import { NzModalRef } from 'ng-zorro-antd/modal';

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
      catchError((err) => {
        console.error(err);
        this.modalRef.close(new Error());
        return EMPTY;
      }),
      skip(this.count - 1)
    ).subscribe((res) => {
      this.modalRef.close(res);
    });
  }
}
