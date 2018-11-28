import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-xivdb-tooltip-component',
  templateUrl: './xivapi-item-tooltip.component.html',
  styleUrls: ['./xivapi-item-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XivapiItemTooltipComponent {

  @Input() item: any;

}
