import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportService } from '../../../core/patreon/support.service';

@Component({
  selector: 'app-remove-ads-popup',
  templateUrl: './remove-ads-popup.component.html',
  styleUrls: ['./remove-ads-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoveAdsPopupComponent {

  constructor(private supportService: SupportService) {
  }

  patreonOauth(): void {
    this.supportService.patreonOauth();
  }

  tipeeeOauth(): void {
    //TODO: implement tipeee oauth
    //this.supportService.tipeeeOauth();
  }

}
