import { Component, Input, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, scan, skip, startWith } from 'rxjs/operators';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { AsyncPipe } from '@angular/common';
import { DialogComponent } from '../../../core/dialog.component';

@Component({
  selector: 'app-progress-popup',
  templateUrl: './progress-popup.component.html',
  styleUrls: ['./progress-popup.component.less'],
  standalone: true,
  imports: [NzProgressModule, NzSpinModule, AsyncPipe]
})
export class ProgressPopupComponent extends DialogComponent implements OnInit {

  @Input()
  public operation$: Observable<any>;

  @Input()
  public count: number;

  public progress$: Observable<any>;

  constructor(private modalRef: NzModalRef) {
    super();
  }

  ngOnInit() {
    this.patchData();
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
