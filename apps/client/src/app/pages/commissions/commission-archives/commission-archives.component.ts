import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-commission-archives',
  templateUrl: './commission-archives.component.html',
  styleUrls: ['./commission-archives.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionArchivesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
