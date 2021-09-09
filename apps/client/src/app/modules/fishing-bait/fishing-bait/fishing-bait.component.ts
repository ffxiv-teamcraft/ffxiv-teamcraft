import { Component, Input } from '@angular/core';
import { FishingBait } from '../../../core/data/model/fishing-bait';

@Component({
  selector: 'app-fishing-bait',
  templateUrl: './fishing-bait.component.html',
  styleUrls: ['./fishing-bait.component.less']
})
export class FishingBaitComponent {

  @Input()
  baits: FishingBait[];

  @Input()
  flex = 'column';

  @Input()
  hideNames = false;

  @Input()
  iconWidth = 32;
}
