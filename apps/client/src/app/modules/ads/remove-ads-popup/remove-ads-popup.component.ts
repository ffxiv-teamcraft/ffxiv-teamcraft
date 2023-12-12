import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportService } from '../../../core/patreon/support.service';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-remove-ads-popup',
    templateUrl: './remove-ads-popup.component.html',
    styleUrls: ['./remove-ads-popup.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NzDividerModule, NzButtonModule, NzWaveModule, TranslateModule]
})
export class RemoveAdsPopupComponent {

  constructor(private supportService: SupportService) {
  }

  patreonOauth(): void {
    this.supportService.patreonOauth();
  }

  tipeeeOauth(): void {
    this.supportService.tipeeeOauth();
  }

}
