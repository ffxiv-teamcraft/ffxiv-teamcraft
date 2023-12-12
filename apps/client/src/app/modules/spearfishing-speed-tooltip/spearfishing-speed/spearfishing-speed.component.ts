import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SpearfishingSpeed } from '@ffxiv-teamcraft/types';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
    selector: 'app-spearfishing-speed',
    templateUrl: './spearfishing-speed.component.html',
    styleUrls: ['./spearfishing-speed.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzIconModule, NzPopoverModule]
})
export class SpearfishingSpeedComponent {

  @Input()
  speed: SpearfishingSpeed;

}
