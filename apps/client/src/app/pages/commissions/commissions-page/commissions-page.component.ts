import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-commissions-page',
  templateUrl: './commissions-page.component.html',
  styleUrls: ['./commissions-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionsPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
