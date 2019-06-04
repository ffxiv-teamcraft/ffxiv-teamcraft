import { Component, Input } from '@angular/core';
import { NzModalService, NzSizeLDSType } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { MarketboardPopupComponent } from '../marketboard-popup/marketboard-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Component({
  selector: 'app-marketboard-icon',
  templateUrl: './marketboard-icon.component.html',
  styleUrls: ['./marketboard-icon.component.less']
})
export class MarketboardIconComponent {

  @Input()
  itemId: number;

  @Input()
  showHistory = false;

  @Input()
  size: NzSizeLDSType = 'small';

  disabled$ = combineLatest([this.authFacade.loggedIn$, this.authFacade.mainCharacter$]).pipe(
    map(([loggedIn, character]) => !loggedIn || character.ID < 0)
  );

  constructor(private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade,
              private l12n: LocalizedDataService, private i18n: I18nToolsService) {
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
