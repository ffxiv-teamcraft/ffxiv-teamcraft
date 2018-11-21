import { Component, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { MarketboardPopupComponent } from '../marketboard-popup/marketboard-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

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

  disabled$ = combineLatest(this.authFacade.loggedIn$, this.authFacade.mainCharacter$).pipe(
    map(([loggedIn, character]) => !loggedIn || character.ID < 0)
  );

  constructor(private dialog: NzModalService, private translate: TranslateService, private authFacade: AuthFacade) {
  }

  openDialog(): void {
    this.dialog.create({
      nzTitle: this.translate.instant('MARKETBOARD.Title'),
      nzContent: MarketboardPopupComponent,
      nzComponentParams: {
        itemId: this.itemId,
        showHistory: this.showHistory
      },
      nzFooter: null
    });
  }

}
