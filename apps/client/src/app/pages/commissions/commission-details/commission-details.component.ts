import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-commission-details',
  templateUrl: './commission-details.component.html',
  styleUrls: ['./commission-details.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
