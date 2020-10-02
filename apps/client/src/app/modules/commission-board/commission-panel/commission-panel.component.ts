import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { Commission } from '../model/commission';

@Component({
  selector: 'app-commission-panel',
  templateUrl: './commission-panel.component.html',
  styleUrls: ['./commission-panel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommissionPanelComponent implements OnInit {

  @Input()
  commission: Commission;

  constructor() {
  }

  ngOnInit(): void {
  }

}
