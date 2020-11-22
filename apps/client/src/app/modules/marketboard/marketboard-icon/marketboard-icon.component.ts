import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { TranslateService } from '@ngx-translate/core';
import { MarketboardPopupComponent } from '../marketboard-popup/marketboard-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { map } from 'rxjs/operators';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Component({
  selector: 'app-marketboard-icon',
  templateUrl: './marketboard-icon.component.html',
  styleUrls: ['./marketboard-icon.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketboardIconComponent {

  @Input()
  itemId: number;

  @Input()
  showHistory = false;

  @Input()
  size: NzSizeLDSType = 'small';

  get itemCanBeSold(): boolean {
    return this.lazyData.data.marketItems.indexOf(this.itemId) > -1;
  }

  disabled$ = this.authFacade.loggedIn$.pipe(
    map((loggedIn) => !loggedIn)
  );

  constructor(private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade,
              private l12n: LocalizedDataService, private i18n: I18nToolsService, private lazyData: LazyDataService) {
  }

  openDialog(): void {
    this.dialog.create({
      nzTitle: `${this.translate.instant('MARKETBOARD.Title')} - ${this.i18n.getName(this.l12n.getItem(this.itemId))}`,
      nzContent: MarketboardPopupComponent,
      nzComponentParams: {
        itemId: this.itemId,
        showHistory: true
      },
      nzFooter: null,
      nzWidth: '80vw'
    });
  }

}
