import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpearfishingSpeed } from '@ffxiv-teamcraft/types';

@Component({
  selector: 'app-spearfishing-speed',
  templateUrl: './spearfishing-speed.component.html',
  styleUrls: ['./spearfishing-speed.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpearfishingSpeedComponent {

  @Input()
  speed: SpearfishingSpeed;

}
