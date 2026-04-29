import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MarketboardPopupComponent } from '../marketboard-popup/marketboard-popup.component';
import { AuthFacade } from '../../../+state/auth.facade';
import { first, map, switchMap } from 'rxjs/operators';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { observeInput } from '../../../core/rxjs/observe-input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-marketboard-icon',
    templateUrl: './marketboard-icon.component.html',
    styleUrls: ['./marketboard-icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzButtonModule, NzWaveModule, NzTooltipModule, NzIconModule, AsyncPipe, TranslateModule]
})
export class MarketboardIconComponent {
  private dialog = inject(NzModalService);
  private translate = inject(TranslateService);
  private authFacade = inject(AuthFacade);
  private i18n = inject(I18nToolsService);
  private lazyData = inject(LazyDataFacade);


  @Input()
  itemId: number;

  @Input()
  showHistory = false;

  @Input()
  size: NzSizeLDSType = 'small';

  itemCanBeSold$ = observeInput(this, 'itemId').pipe(
    switchMap(itemId => {
      return this.lazyData.getEntry('marketItems').pipe(
        map(marketItems => marketItems.includes(itemId))
      );
    })
  );

  disabled$ = this.authFacade.loggedIn$.pipe(
    map((loggedIn) => !loggedIn)
  );

  openDialog(): void {
    this.i18n.getNameObservable('items', this.itemId).pipe(
      first()
    ).subscribe(itemName => {
      this.dialog.create({
        nzTitle: `${this.translate.instant('MARKETBOARD.Title')} - ${itemName}`,
        nzContent: MarketboardPopupComponent,
        nzData: {
          itemId: this.itemId,
          showHistory: true
        },
        nzFooter: null,
        nzWidth: '80vw'
      });
    });
  }

}
