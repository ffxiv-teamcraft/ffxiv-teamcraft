import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-compact-item-row',
  templateUrl: './compact-item-row.component.html',
  styleUrls: ['./compact-item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompactItemRowComponent implements OnInit {
  constructor() {
  }

  ngOnInit(): void {
  }
}
