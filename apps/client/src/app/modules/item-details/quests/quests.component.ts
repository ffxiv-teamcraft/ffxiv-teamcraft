import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemDetailsPopup } from '../item-details-popup';
import { TranslateService } from '@ngx-translate/core';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { RouterLink } from '@angular/router';
import { FlexModule } from '@angular/flex-layout/flex';
import { LazyScrollComponent } from '../../lazy-scroll/lazy-scroll/lazy-scroll.component';

@Component({
    selector: 'app-quests',
    templateUrl: './quests.component.html',
    styleUrls: ['./quests.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [LazyScrollComponent, FlexModule, RouterLink, DbButtonComponent, I18nPipe, I18nRowPipe]
})
export class QuestsComponent extends ItemDetailsPopup<number[]> {

  constructor(public translate: TranslateService) {
    super();
  }
}
