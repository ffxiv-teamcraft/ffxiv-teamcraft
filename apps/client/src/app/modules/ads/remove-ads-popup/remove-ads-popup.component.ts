import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PatreonService } from '../../../core/patreon/patreon.service';

@Component({
  selector: 'app-remove-ads-popup',
  templateUrl: './remove-ads-popup.component.html',
  styleUrls: ['./remove-ads-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoveAdsPopupComponent {

  constructor(private patreonService: PatreonService) {
  }

  patreonOauth(): void {
    this.patreonService.patreonOauth();
  }

}
